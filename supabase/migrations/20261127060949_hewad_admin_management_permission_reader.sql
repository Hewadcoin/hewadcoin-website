
create or replace function public.admin_mgmt_has_permission(p_permission text)
returns boolean language sql stable security definer set search_path=''
as $$
 select public.is_hewad_owner() or exists(
  select 1 from public.admin_accounts aa join public.admin_permissions ap on ap.user_id=aa.user_id
  where aa.user_id=(select auth.uid()) and aa.status='active' and ap.permission_key=p_permission
 );
$$;
revoke all on function public.admin_mgmt_has_permission(text) from public,anon,authenticated;
grant execute on function public.admin_mgmt_has_permission(text) to authenticated;