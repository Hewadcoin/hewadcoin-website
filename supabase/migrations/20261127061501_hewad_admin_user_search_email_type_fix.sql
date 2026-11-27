
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
 select p.id,p.first_name,p.last_name,u.email::text,p.referral_code,p.card_number,
 coalesce((select ka.status from public.kyc_applications ka where ka.user_id=p.id order by ka.created_at desc limit 1),p.kyc_status,'not_verified')::text,
 p.email_verified,p.kyc_status::text,
 (select count(*) from public.staking_positions sp where sp.user_id=p.id and sp.status in('active','pending','unlock_requested'))::bigint,
 coalesce(w.staked_hwc,0)::numeric,
 (coalesce((select sum(rc.commission_amount) from public.simple_referral_commissions rc where rc.referrer_id=p.id),0)+
  coalesce((select sum(ac.commission_amount) from public.ambassador_commissions ac where ac.ambassador_id=p.id),0))::numeric,
 p.account_status::text,
 exists(select 1 from public.admin_accounts aa where aa.user_id=p.id and aa.status<>'deleted')
 from public.profiles p join auth.users u on u.id=p.id left join public.wallets w on w.user_id=p.id
 where (v_type='name' and concat_ws(' ',p.first_name,p.last_name) ilike '%'||v_value||'%')
 or (v_type='email' and u.email ilike '%'||v_value||'%')
 or (v_type='referral' and p.referral_code ilike '%'||v_value||'%')
 or (v_type='card' and p.card_number ilike '%'||v_value||'%')
 order by p.created_at desc limit 30;
end; $$;