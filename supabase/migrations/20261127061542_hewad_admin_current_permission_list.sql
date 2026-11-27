
create or replace function public.admin_mgmt_my_permissions()
returns text[] language sql stable security definer set search_path=''
as $$
 select case when public.is_hewad_owner() then array[
  'dashboard','all_users','user_management','balance_management','deposit_management','withdraw_management',
  'send_hdc','staking_management','position_management','mining_management','gift_management',
  'referral_management','kyc_management','transaction_history','admin_list','settings'
 ]::text[] else coalesce((
  select array_agg(ap.permission_key order by ap.permission_key)
  from public.admin_accounts aa join public.admin_permissions ap on ap.user_id=aa.user_id
  where aa.user_id=(select auth.uid()) and aa.status='active'
 ),array[]::text[]) end;
$$;
revoke all on function public.admin_mgmt_my_permissions() from public,anon,authenticated;
grant execute on function public.admin_mgmt_my_permissions() to authenticated;