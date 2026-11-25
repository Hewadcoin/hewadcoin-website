-- Production staking unlock workflow and non-compounding profit/loss rules.
alter table public.staking_positions
 add column if not exists original_principal numeric(30,8),
 add column if not exists usd_rate_at_stake numeric(30,12),
 add column if not exists usd_value_at_stake numeric(30,8),
 add column if not exists unlock_requested_at timestamptz,
 add column if not exists unlock_notified_at timestamptz,
 add column if not exists blocked_at timestamptz,
 add column if not exists reset_at timestamptz,
 add column if not exists reviewed_by uuid references auth.users(id),
 add column if not exists reviewed_at timestamptz,
 add column if not exists review_action text,
 add column if not exists review_note text,
 add column if not exists unlock_transaction_id uuid references public.wallet_transactions(id);
update public.staking_positions set original_principal=principal where original_principal is null;
alter table public.staking_positions alter column original_principal set not null;
alter table public.staking_positions drop constraint if exists staking_positions_status_check;
alter table public.staking_positions add constraint staking_positions_status_check check(status=any(array['active','unlock_pending','blocked','completed','reset','cancelled']));
alter table public.staking_positions drop constraint if exists staking_positions_duration_days_check;
alter table public.staking_positions add constraint staking_positions_duration_days_check check(duration_days=360);
alter table public.staking_daily_batches drop constraint if exists staking_daily_batches_distribution_date_key;
create index if not exists staking_positions_status_maturity_idx on public.staking_positions(status,matures_at);
create index if not exists staking_positions_user_status_idx on public.staking_positions(user_id,status,started_at desc);
create index if not exists staking_daily_results_position_created_idx on public.staking_daily_results(position_id,created_at desc);
create index if not exists staking_daily_batches_published_at_idx on public.staking_daily_batches(published_at desc);
insert into public.staking_plans(name,asset,min_amount,max_amount,duration_days,apr_percent,active)
select 'Yearly Plan','HDC',5000,1000000000,360,0,true
where not exists(select 1 from public.staking_plans where active and asset='HDC' and duration_days=360);

create or replace function private.hwc_start_staking(p_plan_id uuid,p_amount numeric)
returns uuid language plpgsql security definer set search_path=''
as $$
declare u uuid:=(select auth.uid()); p public.staking_plans%rowtype; k text; id uuid; t timestamptz:=clock_timestamp(); rate numeric(30,12); amt numeric(30,8);
begin
 if u is null then raise exception 'Authentication required.'; end if;
 if p_amount is null or p_amount<=0 then raise exception 'Enter a valid staking amount.'; end if;
 amt:=round(p_amount,8);
 select kyc_status into k from public.profiles where id=u;
 if k is distinct from 'approved' then raise exception 'KYC verification must be approved before staking.'; end if;
 select * into p from public.staking_plans where id=p_plan_id and active and asset='HDC' and duration_days=360 for share;
 if not found then raise exception 'This HDC staking plan is not available.'; end if;
 if amt<p.min_amount or amt>p.max_amount then raise exception 'Amount is outside plan limits. Minimum: % HDC; maximum: % HDC.',p.min_amount,p.max_amount; end if;
 select er.rate into rate from public.exchange_rates er where er.base_asset='HDC' and er.quote_asset='USD' and er.active order by er.updated_at desc limit 1;
 insert into public.wallets(user_id) values(u) on conflict(user_id) do nothing;
 perform 1 from public.wallets where user_id=u for update;
 update public.wallets set balance_hwc=balance_hwc-amt,staked_hwc=staked_hwc+amt,updated_at=now() where user_id=u and balance_hwc-reserved_hwc>=amt;
 if not found then raise exception 'Insufficient available HDC balance.'; end if;
 insert into public.staking_positions(user_id,plan_id,plan_name,asset,principal,original_principal,apr_percent,expected_reward,duration_days,started_at,matures_at,usd_rate_at_stake,usd_value_at_stake)
 values(u,p.id,p.name,'HDC',amt,amt,0,0,360,t,t+interval '360 days',rate,case when rate is null then null else round(amt*rate,8) end) returning staking_positions.id into id;
 insert into public.wallet_transactions(user_id,asset,amount,transaction_type,status,description,reference,created_by)
 values(u,'HDC',-amt,'debit','completed','HDC Digital Staking principal locked',id::text,u);
 return id;
end; $$;
create or replace function public.hwc_start_staking(p_plan_id uuid,p_amount numeric)
returns uuid language sql security definer set search_path='' as $$ select private.hwc_start_staking(p_plan_id,p_amount); $$;

create or replace function private.hwc_request_staking_unlock(p_position_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare u uuid:=(select auth.uid()); p public.staking_positions%rowtype; n text;
begin
 if u is null then raise exception 'Authentication required.'; end if;
 select * into p from public.staking_positions where id=p_position_id and user_id=u for update;
 if not found then raise exception 'Staking position not found.'; end if;
 if p.status<>'active' then raise exception 'This position is not available for an unlock request.'; end if;
 if p.matures_at>clock_timestamp() then raise exception 'The 360-day lock has not matured.'; end if;
 update public.staking_positions set status='unlock_pending',unlock_requested_at=clock_timestamp() where id=p_position_id and status='active';
 select concat_ws(' ',first_name,last_name) into n from public.profiles where id=u;
 insert into public.notifications(user_id,title,body,notification_type) values(u,'Staking unlock request submitted','Your unlock request is pending administrator approval. Your HDC remains locked.','staking_unlock_request');
 insert into public.notifications(user_id,title,body,notification_type) values(null,'New staking unlock request',coalesce(n,'A member')||' submitted an unlock request for '||p.original_principal::text||' HDC.','staking_unlock_request');
 return jsonb_build_object('position_id',p_position_id,'status','unlock_pending','requested_at',clock_timestamp());
end; $$;

create or replace function private.hwc_admin_review_staking_position(p_position_id uuid,p_action text,p_note text default null)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare a uuid:=(select auth.uid()); p public.staking_positions%rowtype; tx uuid; act text:=lower(btrim(coalesce(p_action,''))); note text:=nullif(left(btrim(coalesce(p_note,'')),1000),'');
begin
 if a is null or not public.is_hewad_admin() then raise exception 'Administrator access required.' using errcode='42501'; end if;
 if act not in ('unlock','block','reset','unblock') then raise exception 'Invalid position action.'; end if;
 select * into p from public.staking_positions where id=p_position_id for update;
 if not found then raise exception 'Position not found.'; end if;
 if act='block' then
  if p.status<>'unlock_pending' then raise exception 'Only pending positions can be blocked.'; end if;
  update public.staking_positions set status='blocked',blocked_at=clock_timestamp(),reviewed_by=a,reviewed_at=clock_timestamp(),review_action='block',review_note=note where id=p_position_id;
  insert into public.notifications(user_id,title,body,notification_type) values(p.user_id,'Staking position blocked','Your position is blocked. Your HDC remains locked.','staking_position_status');
  return jsonb_build_object('status','blocked','returned_amount',0);
 end if;
 if act='reset' then
  if p.status<>'unlock_pending' then raise exception 'Only pending positions can be reset.'; end if;
  perform 1 from public.wallets where user_id=p.user_id for update;
  update public.wallets set staked_hwc=staked_hwc-p.original_principal,updated_at=now() where user_id=p.user_id and staked_hwc>=p.original_principal;
  if not found then raise exception 'Staked balance reconciliation failed.'; end if;
  update public.staking_positions set status='reset',reset_at=clock_timestamp(),reviewed_by=a,reviewed_at=clock_timestamp(),review_action='reset',review_note=note where id=p_position_id;
  insert into public.notifications(user_id,title,body,notification_type) values(p.user_id,'Staking position reset','Your position was reset. No HDC was returned to your available balance.','staking_position_status');
  return jsonb_build_object('status','reset','returned_amount',0);
 end if;
 if act='unlock' and p.status<>'unlock_pending' then raise exception 'Only pending positions can be approved.'; end if;
 if act='unblock' and p.status<>'blocked' then raise exception 'Only blocked positions can be unblocked.'; end if;
 if p.matures_at>clock_timestamp() then raise exception 'The 360-day lock has not matured.'; end if;
 perform 1 from public.wallets where user_id=p.user_id for update;
 update public.wallets set balance_hwc=balance_hwc+p.original_principal,staked_hwc=staked_hwc-p.original_principal,updated_at=now()
 where user_id=p.user_id and staked_hwc>=p.original_principal;
 if not found then raise exception 'Staked balance reconciliation failed.'; end if;
 tx:=gen_random_uuid();
 update public.staking_positions set status='completed',paid_at=clock_timestamp(),reviewed_by=a,reviewed_at=clock_timestamp(),review_action=act,review_note=note,unlock_transaction_id=tx where id=p_position_id and status in ('unlock_pending','blocked');
 if not found then raise exception 'Position state changed; refresh and retry.'; end if;
 insert into public.wallet_transactions(id,user_id,asset,amount,transaction_type,status,description,reference,created_by)
 values(tx,p.user_id,'HDC',p.original_principal,'credit','completed','Staking principal returned after admin approval',p_position_id::text,a);
 insert into public.notifications(user_id,title,body,notification_type) values(p.user_id,'Staking position unlocked',p.original_principal::text||' HDC was returned to your available balance.','staking_position_status');
 return jsonb_build_object('status','completed','returned_amount',p.original_principal,'transaction_id',tx);
end; $$;

create or replace function private.hwc_admin_set_minimum_stake(p_plan_id uuid,p_min_amount numeric)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare a uuid:=(select auth.uid()); p public.staking_plans%rowtype;
begin
 if a is null or not public.is_hewad_admin() then raise exception 'Administrator access required.' using errcode='42501'; end if;
 if p_min_amount is null or p_min_amount<=0 then raise exception 'Minimum stake must be positive.'; end if;
 select * into p from public.staking_plans where id=p_plan_id and active for update;
 if not found or p_min_amount>p.max_amount then raise exception 'Invalid plan or minimum amount.'; end if;
 update public.staking_plans set min_amount=round(p_min_amount,8),updated_at=now() where id=p_plan_id;
 return jsonb_build_object('plan_id',p_plan_id,'min_amount',round(p_min_amount,8));
end; $$;

create or replace function private.hwc_admin_list_staking_positions(p_status text,p_search_type text default 'all',p_search_value text default null)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare a uuid:=(select auth.uid()); st text:=lower(btrim(coalesce(p_status,''))); typ text:=lower(btrim(coalesce(p_search_type,'all'))); term text:=nullif(btrim(coalesce(p_search_value,'')),''); out jsonb;
begin
 if a is null or not public.is_hewad_admin() then raise exception 'Administrator access required.' using errcode='42501'; end if;
 if st not in ('unlock_pending','blocked','completed','reset') then raise exception 'Invalid status.'; end if;
 if typ not in ('all','name','email','referral','card') then raise exception 'Invalid search type.'; end if;
 select coalesce(jsonb_agg(to_jsonb(q) order by q.started_at desc),'[]'::jsonb) into out from (
  select sp.id position_id,sp.status,sp.plan_name,sp.principal,sp.original_principal,sp.started_at,sp.matures_at,sp.unlock_requested_at,sp.blocked_at,sp.reset_at,sp.paid_at,sp.reviewed_at,sp.usd_rate_at_stake,sp.usd_value_at_stake,
   pr.id user_id,concat_ws(' ',pr.first_name,pr.last_name) full_name,pr.kyc_status,u.email,pr.mobile_number,pr.country,pr.referral_code,pr.card_number,
   coalesce(w.balance_hwc,0) balance_hwc,coalesce(w.staked_hwc,0) staked_hwc,
   coalesce((select sum(r.amount) from public.staking_daily_results r where r.position_id=sp.id and r.result_type='profit'),0) total_profit,
   coalesce((select sum(r.amount) from public.staking_daily_results r where r.position_id=sp.id and r.result_type='loss'),0) total_loss
  from public.staking_positions sp join public.profiles pr on pr.id=sp.user_id left join auth.users u on u.id=sp.user_id left join public.wallets w on w.user_id=sp.user_id
  where sp.status=st and (term is null or (typ in ('all','name') and concat_ws(' ',pr.first_name,pr.last_name) ilike '%'||term||'%')
   or (typ in ('all','email') and coalesce(u.email,'') ilike '%'||term||'%') or (typ in ('all','referral') and pr.referral_code ilike '%'||term||'%')
   or (typ in ('all','card') and coalesce(pr.card_number,'') ilike '%'||term||'%'))
 ) q;
 return out;
end; $$;

create or replace function private.hwc_admin_get_staking_position(p_position_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare a uuid:=(select auth.uid()); out jsonb;
begin
 if a is null or not public.is_hewad_admin() then raise exception 'Administrator access required.' using errcode='42501'; end if;
 select jsonb_build_object('position',jsonb_build_object(
  'position_id',sp.id,'status',sp.status,'plan_name',sp.plan_name,'principal',sp.principal,'original_principal',sp.original_principal,'started_at',sp.started_at,'matures_at',sp.matures_at,
  'unlock_requested_at',sp.unlock_requested_at,'blocked_at',sp.blocked_at,'reset_at',sp.reset_at,'paid_at',sp.paid_at,'reviewed_at',sp.reviewed_at,'review_action',sp.review_action,'review_note',sp.review_note,
  'usd_rate_at_stake',sp.usd_rate_at_stake,'usd_value_at_stake',sp.usd_value_at_stake,
  'total_profit',coalesce((select sum(amount) from public.staking_daily_results where position_id=sp.id and result_type='profit'),0),
  'total_loss',coalesce((select sum(amount) from public.staking_daily_results where position_id=sp.id and result_type='loss'),0),
  'user_id',pr.id,'full_name',concat_ws(' ',pr.first_name,pr.last_name),'kyc_status',pr.kyc_status,'email',u.email,'mobile_number',pr.mobile_number,'country',pr.country,'referral_code',pr.referral_code,'card_number',pr.card_number,
  'balance_hwc',coalesce(w.balance_hwc,0),'staked_hwc',coalesce(w.staked_hwc,0)),
  'daily_history',coalesce((select jsonb_agg(jsonb_build_object('result_type',r.result_type,'percent',r.percent,'amount',r.amount,'created_at',r.created_at) order by r.created_at desc) from public.staking_daily_results r where r.position_id=sp.id),'[]'::jsonb))
 into out from public.staking_positions sp join public.profiles pr on pr.id=sp.user_id left join auth.users u on u.id=sp.user_id left join public.wallets w on w.user_id=sp.user_id where sp.id=p_position_id;
 if out is null then raise exception 'Position not found.'; end if; return out;
end; $$;

create or replace function private.hwc_member_staking_overview()
returns jsonb language plpgsql security definer set search_path=''
as $$
declare u uuid:=(select auth.uid());
begin
 if u is null then raise exception 'Authentication required.'; end if;
 return jsonb_build_object(
  'pool_total',coalesce((select sum(original_principal) from public.staking_positions where status in ('active','unlock_pending','blocked')),0),
  'participants',coalesce((select count(distinct user_id) from public.staking_positions where status in ('active','unlock_pending','blocked')),0),
  'active_positions',coalesce((select count(*) from public.staking_positions where status='active'),0),
  'distributed_total',coalesce((select sum(amount) from public.staking_daily_results where result_type='profit'),0),
  'pending_total',coalesce((select sum(original_principal) from public.staking_positions where status in ('unlock_pending','blocked')),0),
  'my_staked',coalesce((select staked_hwc from public.wallets where user_id=u),0),
  'my_profit',coalesce((select sum(amount) from public.staking_daily_results where user_id=u and result_type='profit'),0),
  'my_loss',coalesce((select sum(amount) from public.staking_daily_results where user_id=u and result_type='loss'),0));
end; $$;

create or replace function private.hwc_publish_staking_daily_result(p_result_type text,p_percent numeric,p_distribution_date date default current_date)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare a uuid:=(select auth.uid()); bid uuid; p record; now_at timestamptz:=clock_timestamp(); amount numeric(30,8); n integer:=0; total numeric(30,8):=0;
begin
 if a is null or not public.is_hewad_admin() then raise exception 'Administrator access required.' using errcode='42501'; end if;
 if p_result_type not in ('profit','loss') then raise exception 'Choose profit or loss.'; end if;
 if p_percent is null or p_percent<0.10 or p_percent>100 then raise exception 'Percentage must be between 0.10 and 100.'; end if;
 if p_distribution_date is distinct from current_date then raise exception 'Distribution date must be today.'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('hewad_staking_daily_distribution'));
 if exists(select 1 from public.staking_daily_batches where published_at>now_at-interval '24 hours') then raise exception 'A profit or loss distribution was already made in the last 24 hours.'; end if;
 insert into public.staking_daily_batches(distribution_date,result_type,percent,published_by,published_at) values(p_distribution_date,p_result_type,round(p_percent,8),a,now_at) returning id into bid;
 for p in select id,user_id,original_principal from public.staking_positions where status='active' and asset='HDC' and started_at<now_at and matures_at>now_at order by user_id,started_at,id for update
 loop
  amount:=round(p.original_principal*p_percent/100,8);
  if p_result_type='profit' and amount>0 then
   insert into public.wallets(user_id) values(p.user_id) on conflict(user_id) do nothing;
   update public.wallets set balance_hwc=balance_hwc+amount,updated_at=now() where user_id=p.user_id;
   insert into public.wallet_transactions(user_id,asset,amount,transaction_type,status,description,reference,created_by)
   values(p.user_id,'HDC',amount,'credit','completed','Daily staking profit for position '||p.id::text,p.id::text,a);
  end if;
  insert into public.staking_daily_results(batch_id,position_id,user_id,asset,result_type,percent,amount,balance_deducted,principal_deducted,principal_after)
  values(bid,p.id,p.user_id,'HDC',p_result_type,round(p_percent,8),amount,0,0,p.original_principal);
  n:=n+1; total:=total+amount;
 end loop;
 update public.staking_daily_batches set positions_processed=n,total_amount=round(total,8) where id=bid;
 return jsonb_build_object('batch_id',bid,'positions_processed',n,'total_amount',round(total,8),'result_type',p_result_type,'percent',round(p_percent,8),'published_at',now_at);
end; $$;

create or replace function private.hwc_notify_all_matured_staking_positions()
returns integer language plpgsql security definer set search_path=''
as $$
declare p record; n integer:=0; t timestamptz:=clock_timestamp();
begin
 for p in select id,user_id,original_principal from public.staking_positions where status='active' and asset='HDC' and matures_at<=t and unlock_notified_at is null order by matures_at for update skip locked
 loop
  update public.staking_positions set unlock_notified_at=t where id=p.id and unlock_notified_at is null;
  if found then
   insert into public.notifications(user_id,title,body,notification_type) values(p.user_id,'Your HDC staking position has matured',p.original_principal::text||' HDC has matured. You may now request administrator unlock approval.','staking_maturity');
   n:=n+1;
  end if;
 end loop; return n;
end; $$;

create or replace function public.hwc_request_staking_unlock(p_position_id uuid) returns jsonb language sql security definer set search_path='' as $$ select private.hwc_request_staking_unlock(p_position_id); $$;
create or replace function public.hwc_admin_review_staking_position(p_position_id uuid,p_action text,p_note text default null) returns jsonb language sql security definer set search_path='' as $$ select private.hwc_admin_review_staking_position(p_position_id,p_action,p_note); $$;
create or replace function public.hwc_admin_set_minimum_stake(p_plan_id uuid,p_min_amount numeric) returns jsonb language sql security definer set search_path='' as $$ select private.hwc_admin_set_minimum_stake(p_plan_id,p_min_amount); $$;
create or replace function public.hwc_admin_list_staking_positions(p_status text,p_search_type text default 'all',p_search_value text default null) returns jsonb language sql security definer set search_path='' as $$ select private.hwc_admin_list_staking_positions(p_status,p_search_type,p_search_value); $$;
create or replace function public.hwc_admin_get_staking_position(p_position_id uuid) returns jsonb language sql security definer set search_path='' as $$ select private.hwc_admin_get_staking_position(p_position_id); $$;
create or replace function public.hwc_member_staking_overview() returns jsonb language sql security definer set search_path='' as $$ select private.hwc_member_staking_overview(); $$;
create or replace function public.hwc_publish_staking_daily_result(p_result_type text,p_percent numeric,p_distribution_date date default current_date) returns jsonb language sql security definer set search_path='' as $$ select private.hwc_publish_staking_daily_result(p_result_type,p_percent,p_distribution_date); $$;

revoke execute on function private.hwc_start_staking(uuid,numeric),private.hwc_request_staking_unlock(uuid),private.hwc_admin_review_staking_position(uuid,text,text),private.hwc_admin_set_minimum_stake(uuid,numeric),private.hwc_admin_list_staking_positions(text,text,text),private.hwc_admin_get_staking_position(uuid),private.hwc_member_staking_overview(),private.hwc_publish_staking_daily_result(text,numeric,date),private.hwc_notify_all_matured_staking_positions() from public,anon,authenticated;
revoke execute on function public.hwc_start_staking(uuid,numeric),public.hwc_request_staking_unlock(uuid),public.hwc_admin_review_staking_position(uuid,text,text),public.hwc_admin_set_minimum_stake(uuid,numeric),public.hwc_admin_list_staking_positions(text,text,text),public.hwc_admin_get_staking_position(uuid),public.hwc_member_staking_overview(),public.hwc_publish_staking_daily_result(text,numeric,date) from public,anon;
grant execute on function public.hwc_start_staking(uuid,numeric),public.hwc_request_staking_unlock(uuid),public.hwc_admin_review_staking_position(uuid,text,text),public.hwc_admin_set_minimum_stake(uuid,numeric),public.hwc_admin_list_staking_positions(text,text,text),public.hwc_admin_get_staking_position(uuid),public.hwc_member_staking_overview(),public.hwc_publish_staking_daily_result(text,numeric,date) to authenticated;
do $$ declare j bigint; begin select jobid into j from cron.job where jobname='hewad-staking-maturity-notifications' limit 1; if j is not null then perform cron.unschedule(j); end if; perform cron.schedule('hewad-staking-maturity-notifications','*/15 * * * *','select private.hwc_notify_all_matured_staking_positions();'); end $$;
