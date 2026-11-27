-- HEWAD COIN: production withdrawal policy, BEP20 request reservation and TX-hash completion.
create table if not exists public.withdrawal_policy_settings(
 asset text primary key check(asset in('USD','HDC','AFN')),
 fee_rate numeric(10,6) not null default 0 check(fee_rate between 0 and 1),
 no_fee boolean not null default false,
 min_amount numeric(28,8) not null default 0 check(min_amount>=0),
 no_minimum boolean not null default true,
 max_24h_amount numeric(28,8) not null default 0 check(max_24h_amount>=0),
 no_maximum boolean not null default true,
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id)
);
alter table public.withdrawal_policy_settings enable row level security;
revoke all on public.withdrawal_policy_settings from anon,authenticated;
insert into public.withdrawal_policy_settings(asset,fee_rate,no_fee,min_amount,no_minimum,max_24h_amount,no_maximum)
values('USD',.06,false,5,false,500,false),('HDC',0,true,0,true,0,true),('AFN',0,true,0,true,0,true)
on conflict(asset) do nothing;
alter table public.withdrawal_requests add column if not exists request_key uuid,
 add column if not exists tx_hash text, add column if not exists completed_at timestamptz,
 add column if not exists completed_by uuid references auth.users(id);
create unique index if not exists withdrawal_requests_user_request_key_uidx
 on public.withdrawal_requests(user_id,request_key) where request_key is not null;
alter table public.withdrawal_requests drop constraint if exists withdrawal_requests_status_check;
alter table public.withdrawal_requests add constraint withdrawal_requests_status_check
 check(status in('pending','approved','rejected','completed'));
drop policy if exists withdraw_management_read_wallets on public.wallets;
create policy withdraw_management_read_wallets on public.wallets for select to authenticated
 using(public.admin_mgmt_has_permission('withdraw_management'));
drop policy if exists withdraw_management_read_staking_positions on public.staking_positions;
create policy withdraw_management_read_staking_positions on public.staking_positions for select to authenticated
 using(public.admin_mgmt_has_permission('withdraw_management'));
drop function if exists public.hwc_create_withdrawal_request(text,numeric,text,text);
drop function if exists private.hwc_create_withdrawal_request(text,numeric,text,text);
CREATE OR REPLACE FUNCTION private.hwc_get_withdrawal_policy(p_asset text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare s public.withdrawal_policy_settings%rowtype;
begin
 if auth.uid() is null then raise exception 'Authentication required.'; end if;
 if upper(coalesce(p_asset,'')) not in('USD','USDT','HDC','AFN') then raise exception 'Unknown asset.'; end if;
 select * into s from public.withdrawal_policy_settings where asset=case when upper(p_asset)='USDT' then 'USD' else upper(p_asset) end;
 if not found then raise exception 'Withdrawal settings unavailable.'; end if;
 return jsonb_build_object('asset',s.asset,'fee_percent',case when s.no_fee then 0 else s.fee_rate*100 end,
 'no_fee',s.no_fee,'min_amount',s.min_amount,'no_minimum',s.no_minimum,
 'max_24h_amount',s.max_24h_amount,'no_maximum',s.no_maximum,'updated_at',s.updated_at);
end $function$


CREATE OR REPLACE FUNCTION private.hwc_admin_update_withdrawal_policy(p_asset text, p_fee_percent numeric, p_no_fee boolean, p_min_amount numeric, p_no_minimum boolean, p_max_24h_amount numeric, p_no_maximum boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare a text:=upper(coalesce(p_asset,'')); u uuid:=(select auth.uid());
begin
 if u is null or not public.admin_mgmt_has_permission('withdraw_management') then raise exception 'Withdraw Management permission required.' using errcode='42501'; end if;
 if a not in('USD','HDC','AFN') then raise exception 'Invalid asset.'; end if;
 if p_fee_percent is null or p_fee_percent<0 or p_fee_percent>100 then raise exception 'Fee must be between 0%% and 100%%.'; end if;
 if p_min_amount is null or p_min_amount<0 or p_max_24h_amount is null or p_max_24h_amount<0 then raise exception 'Limits cannot be negative.'; end if;
 if not coalesce(p_no_minimum,false) and not coalesce(p_no_maximum,false) and p_max_24h_amount>0 and p_min_amount>p_max_24h_amount then raise exception 'Minimum cannot exceed maximum.'; end if;
 insert into public.withdrawal_policy_settings(asset,fee_rate,no_fee,min_amount,no_minimum,max_24h_amount,no_maximum,updated_by,updated_at)
 values(a,p_fee_percent/100,coalesce(p_no_fee,false),p_min_amount,coalesce(p_no_minimum,false),p_max_24h_amount,coalesce(p_no_maximum,false),u,now())
 on conflict(asset) do update set fee_rate=excluded.fee_rate,no_fee=excluded.no_fee,min_amount=excluded.min_amount,
 no_minimum=excluded.no_minimum,max_24h_amount=excluded.max_24h_amount,no_maximum=excluded.no_maximum,updated_by=u,updated_at=now();
 insert into public.admin_audit_logs(actor_user_id,action,details)
 values(u,'withdrawal_policy_updated',jsonb_build_object('asset',a,'fee_percent',p_fee_percent,'no_fee',p_no_fee,
 'min_amount',p_min_amount,'no_minimum',p_no_minimum,'max_24h_amount',p_max_24h_amount,'no_maximum',p_no_maximum));
 return private.hwc_get_withdrawal_policy(a);
end $function$


CREATE OR REPLACE FUNCTION private.hwc_create_withdrawal_request(p_asset text, p_amount numeric, p_withdrawal_method text, p_destination text, p_request_key uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 u uuid:=(select auth.uid()); kyc text; st text; rid uuid; used numeric:=0;
 fee_rate numeric:=0; fee numeric:=0; net numeric:=0; mn numeric:=0; mx numeric:=0;
 nofee boolean:=false; nomin boolean:=true; nomax boolean:=true; amt numeric;
begin
 if u is null then raise exception 'Authentication required.'; end if;
 if upper(coalesce(p_asset,'')) not in('USD','USDT') then raise exception 'Only USDT withdrawals are currently available on BEP20.'; end if;
 if p_request_key is not null then
  perform pg_advisory_xact_lock(hashtextextended(u::text||':'||p_request_key::text,0));
  select id into rid from public.withdrawal_requests where user_id=u and request_key=p_request_key;
  if rid is not null then return rid; end if;
 end if;
 if p_amount is null or p_amount<=0 then raise exception 'Enter a valid amount.'; end if;
 if upper(coalesce(trim(p_withdrawal_method),''))<>'BEP20' then raise exception 'Only BEP20 network is supported.'; end if;
 if p_destination is null or trim(p_destination)!~'^0x[a-fA-F0-9]{40}$' then raise exception 'Enter a valid BEP20 wallet address.'; end if;
 select kyc_status,account_status into kyc,st from public.profiles where id=u;
 if st is distinct from 'active' then raise exception 'Your account must be active to withdraw.'; end if;
 if kyc is distinct from 'approved' then raise exception 'KYC verification must be approved before withdrawal.'; end if;
 select fee_rate,no_fee,min_amount,no_minimum,max_24h_amount,no_maximum
 into fee_rate,nofee,mn,nomin,mx,nomax from public.withdrawal_policy_settings where asset='USD';
 if not found then raise exception 'Withdrawal settings unavailable.'; end if;
 amt:=round(p_amount,8);
 if not nomin and amt<mn then raise exception 'Minimum withdrawal is % USDT.',mn; end if;
 if not nomax and mx>0 and amt>mx then raise exception 'Maximum withdrawal per request is % USDT.',mx; end if;
 perform 1 from public.wallets where user_id=u for update;
 if not found then raise exception 'Wallet not found.'; end if;
 select coalesce(sum(amount),0) into used from public.withdrawal_requests
 where user_id=u and asset='USD' and created_at>=now()-interval '24 hours' and status in('pending','approved','completed');
 if not nomax and mx>0 and used+amt>mx then raise exception 'Rolling 24-hour limit exceeded. Remaining: % USDT.',greatest(0,mx-used); end if;
 if not exists(select 1 from public.wallets where user_id=u and balance_usd-reserved_usd-staked_usd>=amt) then raise exception 'Insufficient available USDT balance.'; end if;
 fee:=case when nofee then 0 else round(amt*fee_rate,8) end; net:=round(amt-fee,8);
 update public.wallets set reserved_usd=reserved_usd+amt,updated_at=now() where user_id=u;
 insert into public.withdrawal_requests(user_id,asset,amount,withdrawal_method,destination,network,fee_rate,fee_amount,net_amount,request_key)
 values(u,'USD',amt,'BEP20',trim(p_destination),'BEP20',case when nofee then 0 else fee_rate end,fee,net,p_request_key) returning id into rid;
 insert into public.notifications(user_id,title,body,notification_type)
 values(u,'Withdrawal request submitted','Your BEP20 USDT withdrawal request has been sent for administrator review.','withdrawal');
 return rid;
end $function$


CREATE OR REPLACE FUNCTION private.hwc_afn_withdraw_request(p_amount numeric, p_account text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 u uuid:=(select auth.uid()); kyc text; st text; rid uuid; used numeric:=0;
 fee_rate numeric:=0; fee numeric:=0; net numeric:=0; mn numeric:=0; mx numeric:=0;
 nofee boolean:=false; nomin boolean:=true; nomax boolean:=true; amt numeric;
begin
 if u is null then raise exception 'Authentication required.'; end if;
 if p_amount is null or p_amount<=0 then raise exception 'Enter a valid AFN amount.'; end if;
 if length(trim(coalesce(p_account,''))) not between 5 and 100 then raise exception 'Enter a valid Account Pay number.'; end if;
 select kyc_status,account_status into kyc,st from public.profiles where id=u;
 if st is distinct from 'active' then raise exception 'Your account must be active to withdraw.'; end if;
 if kyc is distinct from 'approved' then raise exception 'KYC verification must be approved before withdrawal.'; end if;
 select fee_rate,no_fee,min_amount,no_minimum,max_24h_amount,no_maximum
 into fee_rate,nofee,mn,nomin,mx,nomax from public.withdrawal_policy_settings where asset='AFN';
 if not found then raise exception 'AFN withdrawal settings unavailable.'; end if;
 amt:=round(p_amount,2);
 if not nomin and amt<mn then raise exception 'Minimum AFN withdrawal is % AFN.',mn; end if;
 if not nomax and mx>0 and amt>mx then raise exception 'Maximum AFN withdrawal is % AFN.',mx; end if;
 perform 1 from public.wallets where user_id=u for update;
 if not found then raise exception 'Wallet not found.'; end if;
 select coalesce(sum(amount),0) into used from public.withdrawal_requests
 where user_id=u and asset='AFN' and created_at>=now()-interval '24 hours' and status in('pending','approved','completed');
 if not nomax and mx>0 and used+amt>mx then raise exception 'Rolling 24-hour AFN limit exceeded. Remaining: % AFN.',greatest(0,mx-used); end if;
 if not exists(select 1 from public.wallets where user_id=u and balance_afn-reserved_afn-staked_afn>=amt) then raise exception 'Insufficient available AFN balance.'; end if;
 fee:=case when nofee then 0 else round(amt*fee_rate,2) end; net:=round(amt-fee,2);
 update public.wallets set reserved_afn=reserved_afn+amt,updated_at=now() where user_id=u;
 insert into public.withdrawal_requests(user_id,asset,amount,withdrawal_method,destination,network,fee_rate,fee_amount,net_amount)
 values(u,'AFN',amt,'Account Pay',trim(p_account),'Account Pay',case when nofee then 0 else fee_rate end,fee,net) returning id into rid;
 insert into public.notifications(user_id,title,body,notification_type)
 values(u,'AFN withdrawal request submitted','Your AFN withdrawal request has been sent for administrator review.','withdrawal');
 return rid;
end $function$


CREATE OR REPLACE FUNCTION private.hwc_review_financial_request(p_request_type text, p_request_id uuid, p_decision text, p_admin_note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare u uuid:=(select auth.uid()); d public.deposit_requests%rowtype; w public.withdrawal_requests%rowtype;
begin
 if u is null then raise exception 'Authentication required.'; end if;
 if (p_request_type='deposit' and not public.admin_mgmt_has_permission('deposit_management'))
 or (p_request_type='withdrawal' and not public.admin_mgmt_has_permission('withdraw_management')) then
 raise exception 'Permission denied for this financial request type.' using errcode='42501'; end if;
 if p_decision not in('approved','rejected') then raise exception 'Invalid decision.'; end if;
 if p_admin_note is not null and length(p_admin_note)>1000 then raise exception 'Admin note is too long.'; end if;
 if p_request_type='deposit' then
  select * into d from public.deposit_requests where id=p_request_id for update;
  if not found then raise exception 'Deposit request not found.'; end if;
  if d.status<>'pending' then raise exception 'This request has already been reviewed.'; end if;
  if p_decision='approved' then
   insert into public.wallets(user_id) values(d.user_id) on conflict(user_id) do nothing;
   if d.asset='HDC' then update public.wallets set balance_hwc=balance_hwc+d.amount,updated_at=now() where user_id=d.user_id;
   elsif d.asset='USD' then update public.wallets set balance_usd=balance_usd+d.amount,updated_at=now() where user_id=d.user_id;
   else update public.wallets set balance_afn=balance_afn+d.amount,updated_at=now() where user_id=d.user_id; end if;
   insert into public.wallet_transactions(user_id,asset,amount,transaction_type,status,description,reference,created_by)
   values(d.user_id,d.asset,d.amount,'deposit','completed','Deposit approved',d.id::text,u);
  end if;
  update public.deposit_requests set status=p_decision,admin_note=nullif(trim(p_admin_note),''),reviewed_by=u,reviewed_at=now() where id=p_request_id;
  insert into public.notifications(user_id,title,body,notification_type)
  values(d.user_id,'Deposit request '||p_decision,case when p_decision='approved' then 'Your deposit was approved and your wallet was credited.' else coalesce(nullif(trim(p_admin_note),''),'Your deposit request was rejected.') end,'deposit');
 elsif p_request_type='withdrawal' then
  select * into w from public.withdrawal_requests where id=p_request_id for update;
  if not found then raise exception 'Withdrawal request not found.'; end if;
  if w.status<>'pending' then raise exception 'This request has already been reviewed.'; end if;
  if p_decision='rejected' then
   if w.asset='HDC' then update public.wallets set reserved_hwc=reserved_hwc-w.amount,updated_at=now() where user_id=w.user_id and reserved_hwc>=w.amount;
   elsif w.asset='USD' then update public.wallets set reserved_usd=reserved_usd-w.amount,updated_at=now() where user_id=w.user_id and reserved_usd>=w.amount;
   else update public.wallets set reserved_afn=reserved_afn-w.amount,updated_at=now() where user_id=w.user_id and reserved_afn>=w.amount; end if;
   if not found then raise exception 'Reserved balance could not be released.'; end if;
  end if;
  update public.withdrawal_requests set status=p_decision,admin_note=nullif(trim(p_admin_note),''),reviewed_by=u,reviewed_at=now() where id=p_request_id;
  insert into public.notifications(user_id,title,body,notification_type)
  values(w.user_id,'Withdrawal request '||case when p_decision='approved' then 'accepted' else 'rejected' end,
   case when p_decision='approved' then 'Your withdrawal request was accepted for manual payout. It is not complete until its transaction reference is recorded.'
   else coalesce(nullif(trim(p_admin_note),''),'Your withdrawal request was rejected and reserved funds were released.') end,'withdrawal');
  insert into public.admin_audit_logs(actor_user_id,target_user_id,action,details)
  values(u,w.user_id,case when p_decision='approved' then 'withdrawal_accepted' else 'withdrawal_rejected' end,
   jsonb_build_object('request_id',w.id,'asset',w.asset,'amount',w.amount,'network',w.network,'destination',w.destination,'admin_note',p_admin_note));
 else raise exception 'Unknown request type.'; end if;
 return jsonb_build_object('success',true,'status',p_decision);
end $function$


CREATE OR REPLACE FUNCTION private.hwc_admin_complete_withdrawal(p_request_id uuid, p_tx_hash text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare u uuid:=(select auth.uid()); w public.withdrawal_requests%rowtype;
begin
 if u is null or not public.admin_mgmt_has_permission('withdraw_management') then raise exception 'Withdraw Management permission required.' using errcode='42501'; end if;
 if p_tx_hash is null or length(trim(p_tx_hash)) not between 5 and 160 then raise exception 'Enter the transaction hash or payout reference.'; end if;
 select * into w from public.withdrawal_requests where id=p_request_id for update;
 if not found then raise exception 'Withdrawal request not found.'; end if;
 if w.status<>'approved' then raise exception 'Accept the request before completing it.'; end if;
 if upper(coalesce(w.network,''))='BEP20' and trim(p_tx_hash)!~'^0x[a-fA-F0-9]{64}$' then raise exception 'BEP20 transaction hash must be 0x followed by 64 hexadecimal characters.'; end if;
 if upper(coalesce(w.network,'')) not in('BEP20','ACCOUNT PAY') then raise exception 'Unsupported payout network.'; end if;
 if w.asset='HDC' then update public.wallets set balance_hwc=balance_hwc-w.amount,reserved_hwc=reserved_hwc-w.amount,updated_at=now() where user_id=w.user_id and balance_hwc>=w.amount and reserved_hwc>=w.amount;
 elsif w.asset='USD' then update public.wallets set balance_usd=balance_usd-w.amount,reserved_usd=reserved_usd-w.amount,updated_at=now() where user_id=w.user_id and balance_usd>=w.amount and reserved_usd>=w.amount;
 else update public.wallets set balance_afn=balance_afn-w.amount,reserved_afn=reserved_afn-w.amount,updated_at=now() where user_id=w.user_id and balance_afn>=w.amount and reserved_afn>=w.amount; end if;
 if not found then raise exception 'Wallet reservation could not be reconciled.'; end if;
 update public.withdrawal_requests set status='completed',tx_hash=trim(p_tx_hash),completed_by=u,completed_at=now() where id=p_request_id;
 insert into public.wallet_transactions(user_id,asset,amount,transaction_type,status,description,reference,created_by)
 values(w.user_id,w.asset,-w.amount,'withdrawal','completed','Withdrawal completed',w.id::text,u);
 insert into public.notifications(user_id,title,body,notification_type)
 values(w.user_id,'Withdrawal completed','Your withdrawal was completed after the payout reference was recorded: '||trim(p_tx_hash),'withdrawal');
 insert into public.admin_audit_logs(actor_user_id,target_user_id,action,details)
 values(u,w.user_id,'withdrawal_completed',jsonb_build_object('request_id',w.id,'asset',w.asset,'amount',w.amount,
 'fee_amount',w.fee_amount,'net_amount',w.net_amount,'network',w.network,'destination',w.destination,'tx_hash',trim(p_tx_hash)));
 return jsonb_build_object('success',true,'status','completed','tx_hash',trim(p_tx_hash));
end $function$


CREATE OR REPLACE FUNCTION private.hwc_record_usdt_withdrawal_fee()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if old.status='approved' and new.status='completed' and new.asset='USD' and coalesce(new.fee_amount,0)>0 then
  if not exists(select 1 from private.platform_fee_ledger where reference=new.id::text and fee_type='withdrawal') then
   insert into private.platform_fee_ledger(reference,fee_type,asset,gross_amount,fee_rate,fee_amount,net_amount,charged_user_id)
   values(new.id::text,'withdrawal','USD',new.amount,coalesce(new.fee_rate,0),new.fee_amount,coalesce(new.net_amount,new.amount-new.fee_amount),new.user_id);
  end if;
 end if;
 return new;
end $function$


CREATE OR REPLACE FUNCTION public.hwc_get_withdrawal_policy(p_asset text)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$ select private.hwc_get_withdrawal_policy(p_asset); $function$


CREATE OR REPLACE FUNCTION public.hwc_admin_update_withdrawal_policy(p_asset text, p_fee_percent numeric, p_no_fee boolean, p_min_amount numeric, p_no_minimum boolean, p_max_24h_amount numeric, p_no_maximum boolean)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$
 select private.hwc_admin_update_withdrawal_policy(p_asset,p_fee_percent,p_no_fee,p_min_amount,p_no_minimum,p_max_24h_amount,p_no_maximum);
$function$


CREATE OR REPLACE FUNCTION public.hwc_create_withdrawal_request(p_asset text, p_amount numeric, p_withdrawal_method text, p_destination text, p_request_key uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE sql
 SET search_path TO ''
AS $function$
 select private.hwc_create_withdrawal_request(p_asset,p_amount,p_withdrawal_method,p_destination,p_request_key);
$function$


CREATE OR REPLACE FUNCTION public.hwc_afn_withdraw_request(p_amount numeric, p_account text)
 RETURNS uuid
 LANGUAGE sql
 SET search_path TO ''
AS $function$ select private.hwc_afn_withdraw_request(p_amount,p_account); $function$


CREATE OR REPLACE FUNCTION public.hwc_review_financial_request(p_request_type text, p_request_id uuid, p_decision text, p_admin_note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$ select private.hwc_review_financial_request(p_request_type,p_request_id,p_decision,p_admin_note); $function$


CREATE OR REPLACE FUNCTION public.hwc_admin_complete_withdrawal(p_request_id uuid, p_tx_hash text)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$ select private.hwc_admin_complete_withdrawal(p_request_id,p_tx_hash); $function$

drop trigger if exists trg_record_usdt_withdrawal_fee on public.withdrawal_requests;
create trigger trg_record_usdt_withdrawal_fee after update of status on public.withdrawal_requests
for each row execute function private.hwc_record_usdt_withdrawal_fee();

revoke all on function private.hwc_get_withdrawal_policy(text) from public,anon;
revoke all on function private.hwc_admin_update_withdrawal_policy(text,numeric,boolean,numeric,boolean,numeric,boolean) from public,anon;
revoke all on function private.hwc_create_withdrawal_request(text,numeric,text,text,uuid) from public,anon;
revoke all on function private.hwc_afn_withdraw_request(numeric,text) from public,anon;
revoke all on function private.hwc_review_financial_request(text,uuid,text,text) from public,anon;
revoke all on function private.hwc_admin_complete_withdrawal(uuid,text) from public,anon;
grant execute on function private.hwc_get_withdrawal_policy(text) to authenticated;
grant execute on function private.hwc_admin_update_withdrawal_policy(text,numeric,boolean,numeric,boolean,numeric,boolean) to authenticated;
grant execute on function private.hwc_create_withdrawal_request(text,numeric,text,text,uuid) to authenticated;
grant execute on function private.hwc_afn_withdraw_request(numeric,text) to authenticated;
grant execute on function private.hwc_review_financial_request(text,uuid,text,text) to authenticated;
grant execute on function private.hwc_admin_complete_withdrawal(uuid,text) to authenticated;
revoke all on function public.hwc_get_withdrawal_policy(text) from public,anon;
revoke all on function public.hwc_admin_update_withdrawal_policy(text,numeric,boolean,numeric,boolean,numeric,boolean) from public,anon;
revoke all on function public.hwc_create_withdrawal_request(text,numeric,text,text,uuid) from public,anon;
revoke all on function public.hwc_afn_withdraw_request(numeric,text) from public,anon;
revoke all on function public.hwc_review_financial_request(text,uuid,text,text) from public,anon;
revoke all on function public.hwc_admin_complete_withdrawal(uuid,text) from public,anon;
grant execute on function public.hwc_get_withdrawal_policy(text) to authenticated;
grant execute on function public.hwc_admin_update_withdrawal_policy(text,numeric,boolean,numeric,boolean,numeric,boolean) to authenticated;
grant execute on function public.hwc_create_withdrawal_request(text,numeric,text,text,uuid) to authenticated;
grant execute on function public.hwc_afn_withdraw_request(numeric,text) to authenticated;
grant execute on function public.hwc_review_financial_request(text,uuid,text,text) to authenticated;
grant execute on function public.hwc_admin_complete_withdrawal(uuid,text) to authenticated;
