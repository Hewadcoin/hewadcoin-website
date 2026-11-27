
create or replace function public.admin_mgmt_get_audit(p_user_id uuid default null)
returns table(id bigint,actor_email text,target_email text,action text,details jsonb,created_at timestamptz)
language plpgsql stable security definer set search_path=''
as $$
begin
 if not public.is_hewad_owner() then raise exception 'Owner access required.' using errcode='42501'; end if;
 return query select l.id,au.email::text,tu.email::text,l.action::text,l.details,l.created_at
 from public.admin_audit_logs l join auth.users au on au.id=l.actor_user_id
 left join auth.users tu on tu.id=l.target_user_id
 where p_user_id is null or l.target_user_id=p_user_id
 order by l.created_at desc limit 200;
end; $$;