
create or replace function public.admin_mgmt_set_status(p_user_id uuid,p_status text)
returns void language plpgsql security definer set search_path=''
as $$
begin
 if not public.is_hewad_owner() then raise exception 'Only the Super Admin can suspend or activate administrators.' using errcode='42501'; end if;
 if p_user_id='2d92f1b7-5134-4026-837f-fb3056923a04'::uuid then raise exception 'Owner status cannot be changed.'; end if;
 if p_status not in('active','suspended') then raise exception 'Invalid administrator status.'; end if;
 update public.admin_accounts set status=p_status,suspended_at=case when p_status='suspended' then now() else null end,updated_at=now()
 where user_id=p_user_id and status<>'deleted';
 if not found then raise exception 'Administrator not found.'; end if;
 if p_status='suspended' then
  delete from public.user_roles where user_id=p_user_id and role='admin';
 else
  insert into public.user_roles(user_id,role) values(p_user_id,'admin') on conflict(user_id,role) do nothing;
 end if;
 insert into public.admin_audit_logs(actor_user_id,target_user_id,action,details)
 values((select auth.uid()),p_user_id,case when p_status='suspended' then 'admin_suspended' else 'admin_activated' end,'{}'::jsonb);
end; $$;