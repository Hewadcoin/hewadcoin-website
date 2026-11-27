
begin;
create or replace function public.is_hewad_owner()
returns boolean language sql stable security definer set search_path=''
as $$ select (select auth.uid())='2d92f1b7-5134-4026-837f-fb3056923a04'::uuid
and exists(select 1 from auth.users u where u.id=(select auth.uid()) and lower(u.email)='hewadcoin@gmail.com'); $$;

create table if not exists public.admin_accounts(
 user_id uuid primary key references auth.users(id) on delete restrict,
 status text not null default 'active' check(status in ('active','suspended','deleted')),
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), suspended_at timestamptz,
 deleted_at timestamptz, deleted_by uuid references auth.users(id));
create table if not exists public.admin_permissions(
 user_id uuid not null references public.admin_accounts(user_id) on delete restrict,
 permission_key text not null check(permission_key in
 ('dashboard','all_users','user_management','balance_management','deposit_management','withdraw_management','send_hdc','staking_management','position_management','mining_management','gift_management','referral_management','kyc_management','transaction_history','admin_list','settings')),
 granted_by uuid not null references auth.users(id), granted_at timestamptz not null default now(),
 primary key(user_id,permission_key));
create table if not exists public.admin_audit_logs(
 id bigint generated always as identity primary key, actor_user_id uuid not null references auth.users(id),
 target_user_id uuid references auth.users(id), action text not null, details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now());
create index if not exists admin_audit_logs_target_created_idx on public.admin_audit_logs(target_user_id,created_at desc);
create index if not exists admin_audit_logs_actor_created_idx on public.admin_audit_logs(actor_user_id,created_at desc);
alter table public.admin_accounts enable row level security;
alter table public.admin_permissions enable row level security;
alter table public.admin_audit_logs enable row level security;
drop policy if exists admin_accounts_owner_read on public.admin_accounts;
create policy admin_accounts_owner_read on public.admin_accounts for select to authenticated using(public.is_hewad_owner());
drop policy if exists admin_permissions_owner_read on public.admin_permissions;
create policy admin_permissions_owner_read on public.admin_permissions for select to authenticated using(public.is_hewad_owner());
drop policy if exists admin_audit_logs_owner_read on public.admin_audit_logs;
create policy admin_audit_logs_owner_read on public.admin_audit_logs for select to authenticated using(public.is_hewad_owner());

create or replace function public.admin_mgmt_search_users(p_search_type text,p_search_value text)
returns table(user_id uuid,first_name text,last_name text,email text,referral_code text,card_number text,
 identity_verification text,account_verification boolean,kyc_status text,active_positions bigint,
 total_staked_hdc numeric,referral_earnings numeric,account_status text,is_already_admin boolean)
language plpgsql stable security definer set search_path=''
as $$
declare v_type text:=lower(coalesce(p_search_type,'')); v_value text:=btrim(coalesce(p_search_value,''));
begin
 if not public.is_hewad_owner() then raise exception 'Owner access required.' using errcode='42501'; end if;
 if v_value='' or v_type not in('name','email','referral','card') then raise exception 'Choose a valid search type and enter a search value.'; end if;
 return query
 select p.id,p.first_name,p.last_name,u.email,p.referral_code,p.card_number,
 coalesce((select ka.status from public.kyc_applications ka where ka.user_id=p.id order by ka.created_at desc limit 1),p.kyc_status,'not_verified')::text,
 p.email_verified,p.kyc_status::text,
 (select count(*) from public.staking_positions sp where sp.user_id=p.id and sp.status in('active','pending','unlock_requested'))::bigint,
 coalesce(w.staked_hwc,0)::numeric,
 coalesce((select sum(rc.commission_amount) from public.simple_referral_commissions rc where rc.referrer_id=p.id),0)::numeric,
 p.account_status::text,
 exists(select 1 from public.admin_accounts aa where aa.user_id=p.id and aa.status<>'deleted')
 from public.profiles p join auth.users u on u.id=p.id left join public.wallets w on w.user_id=p.id
 where (v_type='name' and concat_ws(' ',p.first_name,p.last_name) ilike '%'||v_value||'%')
 or (v_type='email' and u.email ilike '%'||v_value||'%')
 or (v_type='referral' and p.referral_code ilike '%'||v_value||'%')
 or (v_type='card' and p.card_number ilike '%'||v_value||'%')
 order by p.created_at desc limit 30;
end; $$;

create or replace function public.admin_mgmt_add_admin(p_user_id uuid,p_permissions text[])
returns void language plpgsql security definer set search_path=''
as $$
declare v_key text;
begin
 if not public.is_hewad_owner() then raise exception 'Only the Super Admin can add administrators.' using errcode='42501'; end if;
 if p_user_id is null or p_user_id='2d92f1b7-5134-4026-837f-fb3056923a04'::uuid then raise exception 'The Owner account cannot be added as a staff administrator.'; end if;
 if not exists(select 1 from auth.users where id=p_user_id) then raise exception 'User not found.'; end if;
 insert into public.admin_accounts(user_id,status,created_by,updated_at,suspended_at,deleted_at,deleted_by)
 values(p_user_id,'active',(select auth.uid()),now(),null,null,null)
 on conflict(user_id) do update set status='active',updated_at=now(),suspended_at=null,deleted_at=null,deleted_by=null;
 insert into public.user_roles(user_id,role) values(p_user_id,'admin') on conflict(user_id,role) do nothing;
 delete from public.admin_permissions where user_id=p_user_id;
 foreach v_key in array coalesce(p_permissions,array[]::text[]) loop
  if v_key not in('dashboard','all_users','user_management','balance_management','deposit_management','withdraw_management','send_hdc','staking_management','position_management','mining_management','gift_management','referral_management','kyc_management','transaction_history','admin_list','settings') then raise exception 'Invalid or protected permission: %',v_key; end if;
  insert into public.admin_permissions(user_id,permission_key,granted_by) values(p_user_id,v_key,(select auth.uid()));
 end loop;
 insert into public.admin_audit_logs(actor_user_id,target_user_id,action,details)
 values((select auth.uid()),p_user_id,'admin_added',jsonb_build_object('permissions',coalesce(p_permissions,array[]::text[])));
end; $$;

create or replace function public.admin_mgmt_update_permissions(p_user_id uuid,p_permissions text[])
returns void language plpgsql security definer set search_path=''
as $$
declare v_key text;
begin
 if not public.is_hewad_owner() then raise exception 'Only the Super Admin can change administrator permissions.' using errcode='42501'; end if;
 if p_user_id='2d92f1b7-5134-4026-837f-fb3056923a04'::uuid then raise exception 'Owner permissions cannot be changed.'; end if;
 if not exists(select 1 from public.admin_accounts where user_id=p_user_id and status='active') then raise exception 'Active administrator not found.'; end if;
 foreach v_key in array coalesce(p_permissions,array[]::text[]) loop
  if v_key not in('dashboard','all_users','user_management','balance_management','deposit_management','withdraw_management','send_hdc','staking_management','position_management','mining_management','gift_management','referral_management','kyc_management','transaction_history','admin_list','settings') then raise exception 'Invalid or protected permission: %',v_key; end if;
 end loop;
 delete from public.admin_permissions where user_id=p_user_id;
 insert into public.admin_permissions(user_id,permission_key,granted_by)
 select p_user_id,x,(select auth.uid()) from unnest(coalesce(p_permissions,array[]::text[])) x;
 insert into public.admin_audit_logs(actor_user_id,target_user_id,action,details)
 values((select auth.uid()),p_user_id,'permissions_updated',jsonb_build_object('permissions',coalesce(p_permissions,array[]::text[])));
end; $$;

create or replace function public.admin_mgmt_delete_admin(p_user_id uuid)
returns void language plpgsql security definer set search_path=''
as $$
begin
 if not public.is_hewad_owner() then raise exception 'Only the Super Admin can delete administrators.' using errcode='42501'; end if;
 if p_user_id='2d92f1b7-5134-4026-837f-fb3056923a04'::uuid then raise exception 'The Owner account cannot be deleted.'; end if;
 update public.admin_accounts set status='deleted',deleted_at=now(),deleted_by=(select auth.uid()),updated_at=now()
 where user_id=p_user_id and status<>'deleted';
 if not found then raise exception 'Administrator not found.'; end if;
 delete from public.admin_permissions where user_id=p_user_id;
 delete from public.user_roles where user_id=p_user_id and role='admin';
 insert into public.admin_audit_logs(actor_user_id,target_user_id,action,details)
 values((select auth.uid()),p_user_id,'admin_deleted','{}'::jsonb);
end; $$;

create or replace function public.admin_mgmt_restore_admin(p_user_id uuid)
returns void language plpgsql security definer set search_path=''
as $$
begin
 if not public.is_hewad_owner() then raise exception 'Only the Super Admin can restore administrators.' using errcode='42501'; end if;
 if p_user_id='2d92f1b7-5134-4026-837f-fb3056923a04'::uuid then raise exception 'Owner account is not a restorable staff administrator.'; end if;
 update public.admin_accounts set status='active',deleted_at=null,deleted_by=null,suspended_at=null,updated_at=now()
 where user_id=p_user_id and status='deleted';
 if not found then raise exception 'Deleted administrator not found.'; end if;
 insert into public.user_roles(user_id,role) values(p_user_id,'admin') on conflict(user_id,role) do nothing;
 insert into public.admin_audit_logs(actor_user_id,target_user_id,action,details)
 values((select auth.uid()),p_user_id,'admin_restored','{"permissions_reset":true}'::jsonb);
end; $$;

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
 insert into public.admin_audit_logs(actor_user_id,target_user_id,action,details)
 values((select auth.uid()),p_user_id,case when p_status='suspended' then 'admin_suspended' else 'admin_activated' end,'{}'::jsonb);
end; $$;

create or replace function public.admin_mgmt_list_admins(p_include_deleted boolean default false)
returns table(user_id uuid,full_name text,email text,status text,created_at timestamptz,deleted_at timestamptz,deleted_by_email text,permissions text[])
language plpgsql stable security definer set search_path=''
as $$
begin
 if not public.is_hewad_owner() and not exists(select 1 from public.admin_accounts aa join public.admin_permissions ap on ap.user_id=aa.user_id where aa.user_id=(select auth.uid()) and aa.status='active' and ap.permission_key='admin_list') then
  raise exception 'Admin List permission required.' using errcode='42501';
 end if;
 return query select aa.user_id,concat_ws(' ',p.first_name,p.last_name),u.email,aa.status,aa.created_at,aa.deleted_at,du.email,
 coalesce(array(select ap.permission_key from public.admin_permissions ap where ap.user_id=aa.user_id order by ap.permission_key),array[]::text[])
 from public.admin_accounts aa join auth.users u on u.id=aa.user_id left join public.profiles p on p.id=aa.user_id
 left join auth.users du on du.id=aa.deleted_by
 where (p_include_deleted and aa.status='deleted') or (not p_include_deleted and aa.status<>'deleted')
 order by aa.created_at desc;
end; $$;

create or replace function public.admin_mgmt_get_audit(p_user_id uuid default null)
returns table(id bigint,actor_email text,target_email text,action text,details jsonb,created_at timestamptz)
language plpgsql stable security definer set search_path=''
as $$
begin
 if not public.is_hewad_owner() then raise exception 'Owner access required.' using errcode='42501'; end if;
 return query select l.id,au.email,tu.email,l.action,l.details,l.created_at from public.admin_audit_logs l
 join auth.users au on au.id=l.actor_user_id left join auth.users tu on tu.id=l.target_user_id
 where p_user_id is null or l.target_user_id=p_user_id order by l.created_at desc limit 200;
end; $$;

revoke all on public.admin_accounts,public.admin_permissions,public.admin_audit_logs from anon,authenticated;
grant select on public.admin_accounts,public.admin_permissions,public.admin_audit_logs to authenticated;
revoke all on function public.admin_mgmt_search_users(text,text),public.admin_mgmt_add_admin(uuid,text[]),
 public.admin_mgmt_update_permissions(uuid,text[]),public.admin_mgmt_delete_admin(uuid),
 public.admin_mgmt_restore_admin(uuid),public.admin_mgmt_set_status(uuid,text),
 public.admin_mgmt_list_admins(boolean),public.admin_mgmt_get_audit(uuid) from public,anon,authenticated;
grant execute on function public.is_hewad_owner(),public.admin_mgmt_search_users(text,text),
 public.admin_mgmt_add_admin(uuid,text[]),public.admin_mgmt_update_permissions(uuid,text[]),
 public.admin_mgmt_delete_admin(uuid),public.admin_mgmt_restore_admin(uuid),
 public.admin_mgmt_set_status(uuid,text),public.admin_mgmt_list_admins(boolean),
 public.admin_mgmt_get_audit(uuid) to authenticated;
commit;