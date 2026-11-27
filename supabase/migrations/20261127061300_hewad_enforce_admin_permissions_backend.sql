
begin;
-- Convert legacy generic admin gates into the exact permission for each existing admin operation.
do $$
declare r record; perm text; def text;
begin
 for r in
  select n.nspname,p.proname,p.oid
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where p.prokind='f' and n.nspname in ('public','private')
    and p.proname in (
     'admin_adjust_user_balance','admin_get_user_balance_history','hwc_admin_ambassador_application_details',
     'hwc_admin_ambassador_list','hwc_admin_ambassador_proofs','hwc_admin_review_ambassador_proof',
     'hwc_admin_set_ambassador','hwc_admin_create_gift_code','hwc_admin_create_gift_code_v2',
     'hwc_admin_get_daily_gift_amount','hwc_admin_list_gift_codes','hwc_admin_set_daily_gift_amount',
     'hwc_admin_set_gift_code_active','hwc_admin_get_staking_position','hwc_admin_list_staking_positions',
     'hwc_admin_review_staking_position','hwc_admin_set_minimum_stake','hwc_publish_staking_daily_result',
     'hwc_admin_position_management_action','hwc_admin_position_management_list',
     'hwc_admin_position_management_search','hwc_admin_set_afn_wallet_rates','hwc_admin_withdrawal_stats',
     'hwc_review_financial_request','protect_profile_kyc_fields','admin_adjust_wallet',
     'admin_search_users','admin_set_account_status','admin_set_exchange_rate',
     'hwc_admin_set_withdrawal_stats_display','hwc_admin_withdrawal_stats_settings',
     'hwc_find_duplicate_kyc_document','hwc_guard_support_message_read_update'
    )
 loop
  perm := case r.proname
   when 'admin_adjust_user_balance' then 'balance_management'
   when 'admin_adjust_wallet' then 'balance_management'
   when 'admin_get_user_balance_history' then 'transaction_history'
   when 'admin_search_users' then 'user_management'
   when 'admin_set_account_status' then 'user_management'
   when 'admin_set_exchange_rate' then 'settings'
   when 'hwc_admin_ambassador_application_details' then 'referral_management'
   when 'hwc_admin_ambassador_list' then 'referral_management'
   when 'hwc_admin_ambassador_proofs' then 'referral_management'
   when 'hwc_admin_review_ambassador_proof' then 'referral_management'
   when 'hwc_admin_set_ambassador' then 'referral_management'
   when 'hwc_admin_create_gift_code' then 'gift_management'
   when 'hwc_admin_create_gift_code_v2' then 'gift_management'
   when 'hwc_admin_get_daily_gift_amount' then 'gift_management'
   when 'hwc_admin_list_gift_codes' then 'gift_management'
   when 'hwc_admin_set_daily_gift_amount' then 'gift_management'
   when 'hwc_admin_set_gift_code_active' then 'gift_management'
   when 'hwc_admin_get_staking_position' then 'position_management'
   when 'hwc_admin_list_staking_positions' then 'position_management'
   when 'hwc_admin_review_staking_position' then 'position_management'
   when 'hwc_admin_position_management_action' then 'position_management'
   when 'hwc_admin_position_management_list' then 'position_management'
   when 'hwc_admin_position_management_search' then 'position_management'
   when 'hwc_admin_set_minimum_stake' then 'staking_management'
   when 'hwc_publish_staking_daily_result' then 'staking_management'
   when 'hwc_admin_set_afn_wallet_rates' then 'settings'
   when 'hwc_admin_withdrawal_stats' then 'withdraw_management'
   when 'hwc_admin_set_withdrawal_stats_display' then 'withdraw_management'
   when 'hwc_admin_withdrawal_stats_settings' then 'withdraw_management'
   when 'hwc_find_duplicate_kyc_document' then 'kyc_management'
   when 'protect_profile_kyc_fields' then 'kyc_management'
   when 'hwc_guard_support_message_read_update' then 'user_management'
   else null end;
  def := pg_get_functiondef(r.oid);
  if r.proname='hwc_review_financial_request' then
   def := replace(def,'not public.is_hewad_admin()',
    'not (public.admin_mgmt_has_permission(''deposit_management'') or public.admin_mgmt_has_permission(''withdraw_management''))');
   def := replace(def,'not (select public.is_hewad_admin())',
    'not (public.admin_mgmt_has_permission(''deposit_management'') or public.admin_mgmt_has_permission(''withdraw_management''))');
  elsif perm is not null then
   def := replace(def,'public.is_hewad_admin()','public.admin_mgmt_has_permission('''||perm||''')');
  end if;
  execute def;
 end loop;
end $$;

-- Fine-grained table access for legacy direct reads/updates; own-user access remains unchanged.
do $$
declare r record; perm text; q text; w text; stmt text;
begin
 for r in select schemaname,tablename,policyname,qual,with_check from pg_policies
  where schemaname='public' and (coalesce(qual,'') ilike '%is_hewad_admin()%' or coalesce(with_check,'') ilike '%is_hewad_admin()%')
 loop
  perm := case r.tablename
   when 'ambassador_accounts' then 'referral_management'
   when 'ambassador_applications' then 'referral_management'
   when 'ambassador_commissions' then 'referral_management'
   when 'ambassador_proofs' then 'referral_management'
   when 'deposit_requests' then 'deposit_management'
   when 'exchange_rate_history' then 'settings'
   when 'exchange_rates' then 'settings'
   when 'gift_claims' then 'gift_management'
   when 'gift_codes' then 'gift_management'
   when 'kyc_applications' then 'kyc_management'
   when 'notifications' then 'dashboard'
   when 'profiles' then 'all_users'
   when 'staking_daily_batches' then 'staking_management'
   when 'staking_daily_results' then 'staking_management'
   when 'staking_plans' then 'staking_management'
   when 'staking_positions' then 'position_management'
   when 'support_message_reactions' then 'user_management'
   when 'support_messages' then 'user_management'
   when 'support_tickets' then 'user_management'
   when 'wallet_transactions' then 'transaction_history'
   when 'wallets' then 'balance_management'
   when 'withdrawal_requests' then 'withdraw_management'
   else null end;
  if perm is null then continue; end if;
  q:=r.qual; w:=r.with_check;
  if q is not null then q:=replace(replace(q,'public.is_hewad_admin()','public.admin_mgmt_has_permission('''||perm||''')'),'is_hewad_admin()','public.admin_mgmt_has_permission('''||perm||''')'); end if;
  if w is not null then w:=replace(replace(w,'public.is_hewad_admin()','public.admin_mgmt_has_permission('''||perm||''')'),'is_hewad_admin()','public.admin_mgmt_has_permission('''||perm||''')'); end if;
  stmt:=format('alter policy %I on %I.%I',r.policyname,r.schemaname,r.tablename);
  if q is not null then stmt:=stmt||format(' using (%s)',q); end if;
  if w is not null then stmt:=stmt||format(' with check (%s)',w); end if;
  execute stmt;
 end loop;
end $$;

-- Generic legacy gate is owner-only. Every staff-admin data operation now uses its named permission.
create or replace function public.is_hewad_admin()
returns boolean language sql stable security definer set search_path=''
as $$ select public.is_hewad_owner(); $$;
commit;