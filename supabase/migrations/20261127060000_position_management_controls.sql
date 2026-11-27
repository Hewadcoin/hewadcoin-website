-- HEWAD COIN Position Management: isolated admin workflows and member unblock requests.
-- No production data is deleted. Delete is a soft archive; financial/audit history remains.

alter table public.staking_positions
  add column if not exists blocked_from_status text,
  add column if not exists unblock_requested_at timestamptz,
  add column if not exists held_at timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references auth.users(id),
  add column if not exists deleted_from_status text;

alter table public.staking_positions drop constraint if exists staking_positions_status_check;
alter table public.staking_positions
  add constraint staking_positions_status_check
  check (status = any (array[
    'active','unlock_pending','blocked','unblock_pending','held',
    'completed','reset','cancelled','deleted'
  ]::text[]));

alter table private.staking_admin_audit drop constraint if exists staking_admin_audit_action_check;
alter table private.staking_admin_audit
  add constraint staking_admin_audit_action_check
  check (action = any (array[
    'stake_created','block','reset','unlock','unblock',
    'hold','resume','delete','unblock_request','unblock_reject'
  ]::text[]));

create index if not exists staking_positions_unblock_request_idx
  on public.staking_positions(status,unblock_requested_at desc);
create index if not exists staking_positions_deleted_idx
  on public.staking_positions(deleted_at desc) where status='deleted';

create or replace function private.hwc_admin_position_management_search(
  p_search_type text,
  p_search_value text
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
  a uuid := (select auth.uid());
  typ text := lower(btrim(coalesce(p_search_type,'name')));
  term text := btrim(coalesce(p_search_value,''));
  result jsonb;
begin
  if a is null or not public.is_hewad_admin() then
    raise exception 'Administrator access required.' using errcode='42501';
  end if;
  if typ not in ('name','tazkira','email','referral','card') then
    raise exception 'Invalid search type.';
  end if;
  if term='' then raise exception 'Enter a search value.'; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'user_id',m.id,
    'full_name',m.full_name,
    'email',m.email,
    'national_id_number',m.national_id_number,
    'referral_code',m.referral_code,
    'card_number',m.card_number,
    'mobile_number',m.mobile_number,
    'country',m.country,
    'province',m.province,
    'kyc_status',m.kyc_status,
    'account_status',m.account_status,
    'balance_hwc',m.balance_hwc,
    'staked_hwc',m.staked_hwc,
    'total_positions',(select count(*) from public.staking_positions x where x.user_id=m.id),
    'active_positions',(select count(*) from public.staking_positions x where x.user_id=m.id and x.status='active'),
    'completed_positions',(select count(*) from public.staking_positions x where x.user_id=m.id and x.matures_at<=clock_timestamp()),
    'total_profit',coalesce((select sum(r.amount) from public.staking_daily_results r where r.user_id=m.id and r.result_type='profit'),0),
    'total_loss',coalesce((select sum(r.amount) from public.staking_daily_results r where r.user_id=m.id and r.result_type='loss'),0),
    'positions',coalesce((
      select jsonb_agg(jsonb_build_object(
        'position_id',sp.id,'status',sp.status,'plan_name',sp.plan_name,
        'principal',sp.principal,'original_principal',sp.original_principal,
        'started_at',sp.started_at,'matures_at',sp.matures_at,
        'unlock_requested_at',sp.unlock_requested_at,'unblock_requested_at',sp.unblock_requested_at,
        'blocked_at',sp.blocked_at,'held_at',sp.held_at,'deleted_at',sp.deleted_at,
        'paid_at',sp.paid_at,'reset_at',sp.reset_at,
        'total_profit',coalesce((select sum(r.amount) from public.staking_daily_results r where r.position_id=sp.id and r.result_type='profit'),0),
        'total_loss',coalesce((select sum(r.amount) from public.staking_daily_results r where r.position_id=sp.id and r.result_type='loss'),0),
        'remaining_days',greatest(0,ceil(extract(epoch from (sp.matures_at-clock_timestamp()))/86400))::integer
      ) order by sp.started_at desc)
      from public.staking_positions sp where sp.user_id=m.id
    ),'[]'::jsonb)
  ) order by m.created_at desc),'[]'::jsonb)
  into result
  from (
    select p.id,concat_ws(' ',p.first_name,p.last_name) full_name,u.email,
      k.national_id_number,p.referral_code,p.card_number,p.mobile_number,p.country,p.province,
      p.kyc_status,p.account_status,coalesce(w.balance_hwc,0) balance_hwc,
      coalesce(w.staked_hwc,0) staked_hwc,p.created_at
    from public.profiles p
    join auth.users u on u.id=p.id
    left join public.wallets w on w.user_id=p.id
    left join lateral (
      select ka.national_id_number
      from public.kyc_applications ka
      where ka.user_id=p.id
      order by ka.updated_at desc,ka.created_at desc
      limit 1
    ) k on true
    where
      (typ='name' and (
        concat_ws(' ',p.first_name,p.last_name) ilike '%'||term||'%'
        or coalesce(p.username,'') ilike '%'||term||'%'
        or split_part(coalesce(u.email,''),'@',1) ilike '%'||term||'%'
      ))
      or (typ='tazkira' and coalesce(k.national_id_number,'') ilike '%'||term||'%')
      or (typ='email' and coalesce(u.email,'') ilike '%'||term||'%')
      or (typ='referral' and coalesce(p.referral_code,'') ilike '%'||term||'%')
      or (typ='card' and coalesce(p.card_number,'') ilike '%'||term||'%')
    order by p.created_at desc
    limit 20
  ) m;
  return result;
end;
$$;

create or replace function private.hwc_admin_position_management_list(
  p_bucket text,
  p_search_type text default 'all',
  p_search_value text default null
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
  a uuid := (select auth.uid());
  bucket text := lower(btrim(coalesce(p_bucket,'all')));
  typ text := lower(btrim(coalesce(p_search_type,'all')));
  term text := nullif(btrim(coalesce(p_search_value,'')),'');
  result jsonb;
begin
  if a is null or not public.is_hewad_admin() then
    raise exception 'Administrator access required.' using errcode='42501';
  end if;
  if bucket not in ('all','pending','blocked','unblock','deleted','active','held') then
    raise exception 'Invalid Position Management section.';
  end if;
  if typ not in ('all','name','tazkira','email','referral','card') then
    raise exception 'Invalid search type.';
  end if;

  select coalesce(jsonb_agg(to_jsonb(q) order by q.started_at desc),'[]'::jsonb)
  into result
  from (
    select sp.id position_id,sp.user_id,sp.status,sp.plan_name,sp.principal,sp.original_principal,
      sp.started_at,sp.matures_at,sp.unlock_requested_at,sp.unblock_requested_at,
      sp.blocked_at,sp.held_at,sp.deleted_at,sp.paid_at,sp.reset_at,sp.reviewed_at,sp.review_action,
      greatest(0,ceil(extract(epoch from (sp.matures_at-clock_timestamp()))/86400))::integer remaining_days,
      concat_ws(' ',p.first_name,p.last_name) full_name,u.email,
      k.national_id_number,p.referral_code,p.card_number,p.mobile_number,
      coalesce((select sum(r.amount) from public.staking_daily_results r where r.position_id=sp.id and r.result_type='profit'),0) total_profit,
      coalesce((select sum(r.amount) from public.staking_daily_results r where r.position_id=sp.id and r.result_type='loss'),0) total_loss
    from public.staking_positions sp
    join public.profiles p on p.id=sp.user_id
    left join auth.users u on u.id=sp.user_id
    left join lateral (
      select ka.national_id_number from public.kyc_applications ka
      where ka.user_id=sp.user_id order by ka.updated_at desc,ka.created_at desc limit 1
    ) k on true
    where
      (
        (bucket='all')
        or (bucket='pending' and sp.status='unlock_pending')
        or (bucket='blocked' and sp.status='blocked')
        or (bucket='unblock' and (sp.status='unblock_pending' or (sp.review_action='unblock' and sp.status in ('active','unlock_pending','held'))))
        or (bucket='deleted' and sp.status='deleted')
        or (bucket='active' and sp.status='active')
        or (bucket='held' and sp.status='held')
      )
      and (
        term is null
        or (typ in ('all','name') and concat_ws(' ',p.first_name,p.last_name) ilike '%'||term||'%')
        or (typ in ('all','tazkira') and coalesce(k.national_id_number,'') ilike '%'||term||'%')
        or (typ in ('all','email') and coalesce(u.email,'') ilike '%'||term||'%')
        or (typ in ('all','referral') and coalesce(p.referral_code,'') ilike '%'||term||'%')
        or (typ in ('all','card') and coalesce(p.card_number,'') ilike '%'||term||'%')
      )
  ) q;
  return result;
end;
$$;

create or replace function private.hwc_admin_position_management_action(
  p_position_id uuid,
  p_action text,
  p_note text default null
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
  a uuid := (select auth.uid());
  p public.staking_positions%rowtype;
  act text := lower(btrim(coalesce(p_action,'')));
  note text := nullif(left(btrim(coalesce(p_note,'')),1000),'');
  restore_status text;
  tx uuid;
begin
  if a is null or not public.is_hewad_admin() then
    raise exception 'Administrator access required.' using errcode='42501';
  end if;
  if act not in ('block','unblock','hold','resume','delete','reset','reject_unblock') then
    raise exception 'Invalid position action.';
  end if;

  select * into p from public.staking_positions where id=p_position_id for update;
  if not found then raise exception 'Position not found.'; end if;

  if act='block' then
    if p.status not in ('active','unlock_pending','held') then
      raise exception 'Only active, pending or held positions can be blocked.';
    end if;
    update public.staking_positions
      set blocked_from_status=p.status,status='blocked',blocked_at=clock_timestamp(),
          reviewed_by=a,reviewed_at=clock_timestamp(),review_action='block',review_note=note
      where id=p_position_id;
    insert into public.notifications(user_id,title,body,notification_type)
      values(p.user_id,'Staking position blocked','Your HDC position has been blocked. Daily profit distribution is paused; your principal remains recorded.','staking_position_status');
    insert into private.staking_admin_audit(position_id,member_id,actor_id,action,note,details)
      values(p.id,p.user_id,a,'block',note,jsonb_build_object('from_status',p.status,'principal',p.original_principal,'blocked_at',clock_timestamp()));
    return jsonb_build_object('status','blocked');
  end if;

  if act='unblock' then
    if p.status not in ('blocked','unblock_pending') then
      raise exception 'Only blocked positions or unblock requests can be approved.';
    end if;
    restore_status:=coalesce(nullif(p.blocked_from_status,'blocked'),'active');
    if restore_status not in ('active','unlock_pending','held') then restore_status:='active'; end if;
    update public.staking_positions
      set status=restore_status,blocked_from_status=null,unblock_requested_at=null,
          reviewed_by=a,reviewed_at=clock_timestamp(),review_action='unblock',review_note=note
      where id=p_position_id;
    insert into public.notifications(user_id,title,body,notification_type)
      values(p.user_id,'Staking position unblocked','Your staking position was approved for reactivation. Profit eligibility resumes from the next eligible distribution.','staking_position_status');
    insert into private.staking_admin_audit(position_id,member_id,actor_id,action,note,details)
      values(p.id,p.user_id,a,'unblock',note,jsonb_build_object('restored_status',restore_status,'unblocked_at',clock_timestamp()));
    return jsonb_build_object('status',restore_status);
  end if;

  if act='reject_unblock' then
    if p.status<>'unblock_pending' then raise exception 'No pending unblock request exists for this position.'; end if;
    update public.staking_positions
      set status='blocked',unblock_requested_at=null,reviewed_by=a,reviewed_at=clock_timestamp(),
          review_action='reject_unblock',review_note=note
      where id=p_position_id;
    insert into public.notifications(user_id,title,body,notification_type)
      values(p.user_id,'Unblock request declined','Your request to reactivate this staking position was not approved.','staking_position_status');
    insert into private.staking_admin_audit(position_id,member_id,actor_id,action,note,details)
      values(p.id,p.user_id,a,'unblock_reject',note,jsonb_build_object('status','blocked','rejected_at',clock_timestamp()));
    return jsonb_build_object('status','blocked');
  end if;

  if act='hold' then
    if p.status<>'active' then raise exception 'Only active positions can be put on hold.'; end if;
    update public.staking_positions
      set status='held',held_at=clock_timestamp(),reviewed_by=a,reviewed_at=clock_timestamp(),
          review_action='hold',review_note=note
      where id=p_position_id;
    insert into public.notifications(user_id,title,body,notification_type)
      values(p.user_id,'Staking position on hold','Daily profit distribution for this position is paused. Your principal remains recorded.','staking_position_status');
    insert into private.staking_admin_audit(position_id,member_id,actor_id,action,note,details)
      values(p.id,p.user_id,a,'hold',note,jsonb_build_object('status','held','held_at',clock_timestamp()));
    return jsonb_build_object('status','held');
  end if;

  if act='resume' then
    if p.status<>'held' then raise exception 'Only held positions can be resumed.'; end if;
    update public.staking_positions
      set status='active',held_at=null,reviewed_by=a,reviewed_at=clock_timestamp(),
          review_action='resume',review_note=note
      where id=p_position_id;
    insert into public.notifications(user_id,title,body,notification_type)
      values(p.user_id,'Staking position resumed','Your staking position is active again. Profit eligibility resumes from the next eligible distribution.','staking_position_status');
    insert into private.staking_admin_audit(position_id,member_id,actor_id,action,note,details)
      values(p.id,p.user_id,a,'resume',note,jsonb_build_object('status','active','resumed_at',clock_timestamp()));
    return jsonb_build_object('status','active');
  end if;

  if act='delete' then
    if p.status='deleted' then raise exception 'This position is already deleted.'; end if;
    update public.staking_positions
      set deleted_from_status=p.status,status='deleted',deleted_at=clock_timestamp(),deleted_by=a,
          reviewed_by=a,reviewed_at=clock_timestamp(),review_action='delete',review_note=note
      where id=p_position_id;
    insert into public.notifications(user_id,title,body,notification_type)
      values(p.user_id,'Staking position removed from dashboard','This position was removed from your dashboard. Any locked principal remains recorded and can be reviewed by the administrator.','staking_position_status');
    insert into private.staking_admin_audit(position_id,member_id,actor_id,action,note,details)
      values(p.id,p.user_id,a,'delete',note,jsonb_build_object('from_status',p.status,'principal_still_locked',p.status not in ('completed','reset','cancelled'),'deleted_at',clock_timestamp()));
    return jsonb_build_object('status','deleted','principal_still_locked',p.status not in ('completed','reset','cancelled'));
  end if;

  if act='reset' then
    if p.status not in ('unlock_pending','deleted') then
      raise exception 'Reset is available only for matured pending or deleted positions.';
    end if;
    if p.matures_at>clock_timestamp() then
      raise exception 'The 360-day lock has not matured. The original HDC cannot be returned yet.';
    end if;
    if p.status='deleted' and p.deleted_from_status in ('completed','reset','cancelled') then
      raise exception 'This deleted position was already settled and has no locked principal.';
    end if;
    perform 1 from public.wallets where user_id=p.user_id for update;
    update public.wallets
      set balance_hwc=balance_hwc+p.original_principal,
          staked_hwc=staked_hwc-p.original_principal,updated_at=now()
      where user_id=p.user_id and staked_hwc>=p.original_principal;
    if not found then raise exception 'Staked balance reconciliation failed. No funds were transferred.'; end if;
    tx:=gen_random_uuid();
    insert into public.wallet_transactions(id,user_id,asset,amount,transaction_type,status,description,reference,created_by)
      values(tx,p.user_id,'HDC',p.original_principal,'credit','completed',
        'Staking principal returned after administrator reset',p_position_id::text,a);
    update public.staking_positions
      set status='reset',reset_at=clock_timestamp(),paid_at=clock_timestamp(),
          reviewed_by=a,reviewed_at=clock_timestamp(),review_action='reset',
          review_note=note,unlock_transaction_id=tx
      where id=p_position_id and status in ('unlock_pending','deleted');
    if not found then raise exception 'Position state changed; refresh and retry.'; end if;
    insert into public.notifications(user_id,title,body,notification_type)
      values(p.user_id,'Staking principal returned',p.original_principal::text||' HDC was returned to your available balance.','staking_position_status');
    insert into private.staking_admin_audit(position_id,member_id,actor_id,action,note,details)
      values(p.id,p.user_id,a,'reset',note,jsonb_build_object('status','reset','returned_amount',p.original_principal,'transaction_id',tx));
    return jsonb_build_object('status','reset','returned_amount',p.original_principal,'transaction_id',tx);
  end if;

  raise exception 'Unsupported position action.';
end;
$$;

create or replace function private.hwc_request_staking_unblock(p_position_code text)
returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
  u uuid := (select auth.uid());
  p public.staking_positions%rowtype;
  code text := upper(regexp_replace(btrim(coalesce(p_position_code,'')),'^HDC-','','i'));
begin
  if u is null then raise exception 'Authentication required.'; end if;
  if code='' then raise exception 'Position ID is required.'; end if;
  select * into p
    from public.staking_positions
    where user_id=u and status='blocked'
      and upper(left(replace(id::text,'-',''),8))=code
    for update;
  if not found then raise exception 'Blocked position not found. Refresh your staking page.'; end if;
  update public.staking_positions
    set status='unblock_pending',unblock_requested_at=clock_timestamp()
    where id=p.id and status='blocked';
  if not found then raise exception 'Position state changed. Refresh and try again.'; end if;
  insert into public.notifications(user_id,title,body,notification_type)
    values(null,'Staking unblock request','A member requested administrator approval to reactivate position '||p.id::text||'.','staking_unblock_request');
  insert into private.staking_admin_audit(position_id,member_id,actor_id,action,details)
    values(p.id,u,u,'unblock_request',jsonb_build_object('requested_at',clock_timestamp()));
  return jsonb_build_object('position_id',p.id,'status','unblock_pending');
end;
$$;

-- Keep the staking pool and pending totals accurate while positions are held,
-- awaiting unblock approval, or hidden from the member dashboard.
create or replace function private.hwc_member_staking_overview()
returns jsonb language plpgsql security definer set search_path=''
as $$
declare u uuid := (select auth.uid());
begin
  if u is null then raise exception 'Authentication required.'; end if;
  return jsonb_build_object(
    'pool_total',coalesce((select sum(original_principal) from public.staking_positions where status in ('active','unlock_pending','blocked','unblock_pending','held') or (status='deleted' and coalesce(deleted_from_status,'') not in ('completed','reset','cancelled'))),0),
    'participants',coalesce((select count(distinct user_id) from public.staking_positions where status in ('active','held')),0),
    'my_active_positions',coalesce((select count(*) from public.staking_positions where user_id=u and status='active' and asset='HDC' and duration_days=360),0),
    'active_positions',coalesce((select count(*) from public.staking_positions where status='active'),0),
    'distributed_total',coalesce((select sum(amount) from public.staking_daily_results where result_type='profit'),0),
    'pending_total',coalesce((select sum(original_principal) from public.staking_positions where status in ('unlock_pending','blocked','unblock_pending','held') or (status='deleted' and coalesce(deleted_from_status,'') not in ('completed','reset','cancelled'))),0),
    'my_staked',coalesce((select staked_hwc from public.wallets where user_id=u),0),
    'my_profit',coalesce((select sum(amount) from public.staking_daily_results where user_id=u and result_type='profit'),0),
    'my_loss',coalesce((select sum(amount) from public.staking_daily_results where user_id=u and result_type='loss'),0)
  );
end;
$$;

create or replace function public.hwc_admin_position_management_search(p_search_type text,p_search_value text)
returns jsonb language sql security definer set search_path=''
as $$ select private.hwc_admin_position_management_search(p_search_type,p_search_value); $$;

create or replace function public.hwc_admin_position_management_list(p_bucket text,p_search_type text default 'all',p_search_value text default null)
returns jsonb language sql security definer set search_path=''
as $$ select private.hwc_admin_position_management_list(p_bucket,p_search_type,p_search_value); $$;

create or replace function public.hwc_admin_position_management_action(p_position_id uuid,p_action text,p_note text default null)
returns jsonb language sql security definer set search_path=''
as $$ select private.hwc_admin_position_management_action(p_position_id,p_action,p_note); $$;

create or replace function public.hwc_request_staking_unblock(p_position_code text)
returns jsonb language sql security definer set search_path=''
as $$ select private.hwc_request_staking_unblock(p_position_code); $$;

revoke execute on function private.hwc_admin_position_management_search(text,text),
  private.hwc_admin_position_management_list(text,text,text),
  private.hwc_admin_position_management_action(uuid,text,text),
  private.hwc_request_staking_unblock(text) from public,anon,authenticated;

revoke execute on function public.hwc_admin_position_management_search(text,text),
  public.hwc_admin_position_management_list(text,text,text),
  public.hwc_admin_position_management_action(uuid,text,text),
  public.hwc_request_staking_unblock(text) from public,anon;

grant execute on function public.hwc_admin_position_management_search(text,text),
  public.hwc_admin_position_management_list(text,text,text),
  public.hwc_admin_position_management_action(uuid,text,text),
  public.hwc_request_staking_unblock(text) to authenticated;
