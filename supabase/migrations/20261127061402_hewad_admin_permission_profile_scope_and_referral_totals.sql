
begin;
alter policy profiles_select_owner_or_admin on public.profiles
using (((select auth.uid())=id) or public.admin_mgmt_has_permission('all_users') or public.admin_mgmt_has_permission('user_management'));
alter policy wallets_select_owner_or_admin on public.wallets
using (((select auth.uid())=user_id) or public.admin_mgmt_has_permission('balance_management') or public.admin_mgmt_has_permission('user_management'));
alter policy wallet_transactions_select_owner_or_admin on public.wallet_transactions
using (((select auth.uid())=user_id) or public.admin_mgmt_has_permission('transaction_history') or public.admin_mgmt_has_permission('balance_management') or public.admin_mgmt_has_permission('user_management'));
do $$
declare d text;
begin
 d:=pg_get_functiondef('public.admin_mgmt_search_users(text,text)'::regprocedure);
 d:=replace(d,
 'coalesce((select sum(rc.commission_amount) from public.simple_referral_commissions rc where rc.referrer_id=p.id),0)::numeric',
 '(coalesce((select sum(rc.commission_amount) from public.simple_referral_commissions rc where rc.referrer_id=p.id),0)+coalesce((select sum(ac.commission_amount) from public.ambassador_commissions ac where ac.ambassador_id=p.id),0))::numeric');
 execute d;
end $$;
commit;