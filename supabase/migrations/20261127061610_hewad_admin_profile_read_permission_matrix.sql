
alter policy profiles_select_owner_or_admin on public.profiles
using (
 ((select auth.uid())=id)
 or public.admin_mgmt_has_permission('all_users')
 or public.admin_mgmt_has_permission('user_management')
 or public.admin_mgmt_has_permission('balance_management')
 or public.admin_mgmt_has_permission('deposit_management')
 or public.admin_mgmt_has_permission('withdraw_management')
 or public.admin_mgmt_has_permission('staking_management')
 or public.admin_mgmt_has_permission('position_management')
 or public.admin_mgmt_has_permission('gift_management')
 or public.admin_mgmt_has_permission('referral_management')
 or public.admin_mgmt_has_permission('kyc_management')
 or public.admin_mgmt_has_permission('transaction_history')
);