
create or replace function public.admin_mgmt_list_admins(p_include_deleted boolean default false)
returns table(user_id uuid,full_name text,email text,status text,created_at timestamptz,deleted_at timestamptz,deleted_by_email text,permissions text[])
language plpgsql stable security definer set search_path=''
as $$
begin
 if p_include_deleted and not public.is_hewad_owner() then
  raise exception 'Only the Super Admin can view deleted administrator history.' using errcode='42501';
 end if;
 if not public.is_hewad_owner() and not exists(
  select 1 from public.admin_accounts aa join public.admin_permissions ap on ap.user_id=aa.user_id
  where aa.user_id=(select auth.uid()) and aa.status='active' and ap.permission_key='admin_list'
 ) then raise exception 'Admin List permission required.' using errcode='42501'; end if;
 return query select aa.user_id,concat_ws(' ',p.first_name,p.last_name)::text,u.email::text,aa.status::text,aa.created_at,aa.deleted_at,du.email::text,
 coalesce(array(select ap.permission_key from public.admin_permissions ap where ap.user_id=aa.user_id order by ap.permission_key),array[]::text[])
 from public.admin_accounts aa join auth.users u on u.id=aa.user_id left join public.profiles p on p.id=aa.user_id
 left join auth.users du on du.id=aa.deleted_by
 where (p_include_deleted and aa.status='deleted') or (not p_include_deleted and aa.status<>'deleted')
 order by aa.created_at desc;
end; $$;