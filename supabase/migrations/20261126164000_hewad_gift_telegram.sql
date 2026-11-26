-- HEWAD COIN Gift + Telegram linking update
-- Applied to project qjclffmzkqfgqbbawhaz on 2026-11-26.
create table if not exists public.daily_gift_settings (
 id boolean primary key default true check(id),
 reward_amount numeric(28,8) not null default 8 check(reward_amount>0),
 updated_by uuid references auth.users(id),
 updated_at timestamptz not null default now()
);
insert into public.daily_gift_settings(id,reward_amount) values(true,8) on conflict(id) do nothing;
alter table public.daily_gift_settings enable row level security;

alter table public.gift_codes add column if not exists gift_type text not null default 'special';
alter table public.gift_codes drop constraint if exists gift_codes_gift_type_check;
alter table public.gift_codes add constraint gift_codes_gift_type_check check(gift_type in ('special','daily'));
alter table public.gift_codes alter column starts_at drop not null;
alter table public.gift_codes alter column expires_at drop not null;
alter table public.gift_codes alter column created_by drop not null;
alter table public.gift_claims drop constraint if exists gift_claims_one_per_user_per_day;

alter table public.telegram_account_links add column if not exists language text not null default 'ps';
alter table public.telegram_account_links drop constraint if exists telegram_account_links_language_check;
alter table public.telegram_account_links add constraint telegram_account_links_language_check check(language in ('ps','en'));

create or replace function public.hwc_create_telegram_link_code()
returns table(link_code text,expires_at timestamptz)
language plpgsql security definer set search_path=public,extensions,pg_temp
as $$
declare v_uid uuid:=auth.uid(); v_code text; v_exp timestamptz:=now()+interval '60 seconds';
begin
 if v_uid is null then raise exception 'Authentication required'; end if;
 if exists(select 1 from public.telegram_account_links where user_id=v_uid) then raise exception 'Telegram account is already linked'; end if;
 update public.telegram_link_codes set used_at=coalesce(used_at,now()) where user_id=v_uid and used_at is null;
 loop
  v_code:=lpad((floor(random()*10000))::integer::text,4,'0');
  exit when not exists(select 1 from public.telegram_link_codes where code_hash=encode(digest(v_code,'sha256'),'hex') and expires_at>now() and used_at is null);
 end loop;
 insert into public.telegram_link_codes(user_id,code_hash,expires_at) values(v_uid,encode(digest(v_code,'sha256'),'hex'),v_exp);
 return query select v_code,v_exp;
end $$;

create or replace function public.hwc_telegram_link_account(p_code text,p_telegram_user_id bigint,p_telegram_username text default null)
returns jsonb language plpgsql security definer set search_path=public,extensions,pg_temp
as $$
declare v_row public.telegram_link_codes%rowtype;
begin
 if p_code is null or p_code !~ '^[0-9]{4}$' or p_telegram_user_id is null then raise exception 'Invalid link request'; end if;
 select * into v_row from public.telegram_link_codes where code_hash=encode(digest(p_code,'sha256'),'hex') and used_at is null and expires_at>now() order by created_at desc limit 1 for update;
 if not found then raise exception 'Code is invalid or expired'; end if;
 if exists(select 1 from public.telegram_account_links where user_id=v_row.user_id) then raise exception 'HEWAD COIN account is already linked'; end if;
 if exists(select 1 from public.telegram_account_links where telegram_user_id=p_telegram_user_id) then raise exception 'This Telegram account is already linked'; end if;
 insert into public.telegram_account_links(user_id,telegram_user_id,telegram_username) values(v_row.user_id,p_telegram_user_id,nullif(regexp_replace(coalesce(p_telegram_username,''),'^@',''),''));
 update public.telegram_link_codes set used_at=now() where id=v_row.id;
 return jsonb_build_object('success',true);
end $$;

create or replace function private.hwc_admin_create_gift_code_v2(p_code text,p_reward_amount numeric,p_max_claims integer default null)
returns uuid language plpgsql security definer set search_path=''
as $$
declare v_admin uuid:=(select auth.uid()); v_id uuid; v_code text;
begin
 if v_admin is null or not (select public.is_hewad_admin()) then raise exception 'Administrator access required.'; end if;
 v_code:=upper(regexp_replace(trim(coalesce(p_code,'')),'[[:space:]]+','','g'));
 if v_code !~ '^[A-Z0-9-]{4,32}$' then raise exception 'Gift code must contain 4–32 letters, numbers or hyphens.'; end if;
 if p_reward_amount is null or p_reward_amount<=0 or p_reward_amount>1000000000000 then raise exception 'Enter a valid HDC reward amount.'; end if;
 if p_max_claims is not null and p_max_claims<=0 then raise exception 'Maximum claims must be greater than zero.'; end if;
 insert into public.gift_codes(code,asset,reward_amount,starts_at,expires_at,max_claims,claims_count,active,created_by,gift_type)
 values(v_code,'HDC',round(p_reward_amount,8),null,null,p_max_claims,0,true,v_admin,'special') returning id into v_id;
 return v_id;
end $$;
create or replace function public.hwc_admin_create_gift_code_v2(p_code text,p_reward_amount numeric,p_max_claims integer default null)
returns uuid language sql set search_path='' as $$ select private.hwc_admin_create_gift_code_v2(p_code,p_reward_amount,p_max_claims); $$;

create or replace function private.hwc_admin_set_daily_gift_amount(p_amount numeric)
returns numeric language plpgsql security definer set search_path=''
as $$
declare v_admin uuid:=(select auth.uid());
begin
 if v_admin is null or not (select public.is_hewad_admin()) then raise exception 'Administrator access required.'; end if;
 if p_amount is null or p_amount<=0 or p_amount>1000000000000 then raise exception 'Enter a valid HDC amount.'; end if;
 insert into public.daily_gift_settings(id,reward_amount,updated_by,updated_at) values(true,round(p_amount,8),v_admin,now())
 on conflict(id) do update set reward_amount=excluded.reward_amount,updated_by=excluded.updated_by,updated_at=now();
 return round(p_amount,8);
end $$;
create or replace function public.hwc_admin_set_daily_gift_amount(p_amount numeric)
returns numeric language sql set search_path='' as $$ select private.hwc_admin_set_daily_gift_amount(p_amount); $$;

create or replace function private.hwc_admin_get_daily_gift_amount()
returns numeric language plpgsql security definer set search_path=''
as $$
begin
 if (select auth.uid()) is null or not (select public.is_hewad_admin()) then raise exception 'Administrator access required.'; end if;
 return (select reward_amount from public.daily_gift_settings where id=true);
end $$;
create or replace function public.hwc_admin_get_daily_gift_amount()
returns numeric language sql set search_path='' as $$ select private.hwc_admin_get_daily_gift_amount(); $$;

create or replace function public.hwc_bot_get_daily_gift()
returns jsonb language plpgsql security definer set search_path=public,extensions,pg_temp
as $$
declare v_today date:=(now() at time zone 'Asia/Kabul')::date;
 v_start timestamptz:=(v_today::timestamp at time zone 'Asia/Kabul');
 v_end timestamptz:=((v_today+1)::timestamp at time zone 'Asia/Kabul');
 v_code public.gift_codes%rowtype; v_amount numeric; v_code_text text;
begin
 perform pg_advisory_xact_lock(hashtext('hewad-daily-gift:'||v_today::text));
 select reward_amount into v_amount from public.daily_gift_settings where id=true;
 if v_amount is null then v_amount:=8; end if;
 select * into v_code from public.gift_codes where gift_type='daily' and starts_at=v_start and expires_at=v_end limit 1;
 if not found then
  loop
   v_code_text:='HDC-'||upper(substr(encode(gen_random_bytes(8),'hex'),1,12));
   exit when not exists(select 1 from public.gift_codes where code=v_code_text);
  end loop;
  insert into public.gift_codes(code,asset,reward_amount,starts_at,expires_at,max_claims,active,created_by,gift_type)
  values(v_code_text,'HDC',v_amount,v_start,v_end,null,true,null,'daily') returning * into v_code;
 end if;
 return jsonb_build_object('code',v_code.code,'date',v_today,'expires_at',v_code.expires_at);
end $$;
revoke all on function public.hwc_bot_get_daily_gift() from public,anon,authenticated;
grant execute on function public.hwc_bot_get_daily_gift() to service_role;

create or replace function private.hwc_redeem_gift_code(p_code text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_uid uuid:=(select auth.uid()); v_today date:=(now() at time zone 'Asia/Kabul')::date; v_code public.gift_codes%rowtype; v_claim_id uuid;
begin
 if v_uid is null then raise exception 'Please sign in to redeem a gift code.'; end if;
 if length(trim(coalesce(p_code,'')))<4 then raise exception 'Enter a valid gift code.'; end if;
 select * into v_code from public.gift_codes where code=upper(regexp_replace(trim(p_code),'[[:space:]]+','','g')) for update;
 if not found then raise exception 'This gift code does not exist.'; end if;
 if not v_code.active then raise exception 'This gift code is no longer active.'; end if;
 if v_code.starts_at is not null and now()<v_code.starts_at then raise exception 'This gift code is not active yet.'; end if;
 if v_code.expires_at is not null and now()>=v_code.expires_at then raise exception 'This gift code has expired.'; end if;
 if v_code.max_claims is not null and v_code.claims_count>=v_code.max_claims then raise exception 'All available gifts for this code have been claimed.'; end if;
 if exists(select 1 from public.gift_claims where gift_code_id=v_code.id and user_id=v_uid) then
  if v_code.gift_type='daily' then raise exception 'تاسو دغه ډالۍ یو ځل ترلاسه کړې ده'; else raise exception 'You have already used this gift code.'; end if;
 end if;
 insert into public.wallets(user_id) values(v_uid) on conflict(user_id) do nothing;
 perform 1 from public.wallets where user_id=v_uid for update;
 update public.wallets set balance_hwc=balance_hwc+v_code.reward_amount,updated_at=now() where user_id=v_uid;
 insert into public.gift_claims(gift_code_id,user_id,claim_date,asset,amount) values(v_code.id,v_uid,v_today,'HDC',v_code.reward_amount) returning id into v_claim_id;
 update public.gift_codes set claims_count=claims_count+1 where id=v_code.id;
 insert into public.wallet_transactions(user_id,asset,amount,transaction_type,status,description,reference,created_by)
 values(v_uid,'HDC',v_code.reward_amount,'credit','completed',case when v_code.gift_type='daily' then 'Daily Gift Reward' else 'Special Gift Reward' end,v_claim_id::text,v_uid);
 return jsonb_build_object('claim_id',v_claim_id,'asset','HDC','claimed_at',now(),'claim_date',v_today);
end $$;
