-- Scoped email lookup and administrator-only settings-table read access.
grant select on public.withdrawal_policy_settings to authenticated;
drop policy if exists withdraw_policy_admin_read on public.withdrawal_policy_settings;
create policy withdraw_policy_admin_read on public.withdrawal_policy_settings
 for select to authenticated using(public.admin_mgmt_has_permission('withdraw_management'));
CREATE OR REPLACE FUNCTION private.hwc_admin_withdrawal_user_email(p_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_email text;
begin
 if auth.uid() is null or not public.admin_mgmt_has_permission('withdraw_management') then
  raise exception 'Withdraw Management permission required.' using errcode='42501';
 end if;
 select u.email into v_email from auth.users u where u.id=p_user_id;
 return coalesce(v_email,'');
end $function$

CREATE OR REPLACE FUNCTION public.hwc_admin_withdrawal_user_email(p_user_id uuid)
 RETURNS text
 LANGUAGE sql
 SET search_path TO ''
AS $function$ select private.hwc_admin_withdrawal_user_email(p_user_id); $function$

revoke all on function private.hwc_admin_withdrawal_user_email(uuid) from public,anon;
grant execute on function private.hwc_admin_withdrawal_user_email(uuid) to authenticated;
revoke all on function public.hwc_admin_withdrawal_user_email(uuid) from public,anon;
grant execute on function public.hwc_admin_withdrawal_user_email(uuid) to authenticated;
