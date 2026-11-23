-- HEWAD COIN: four-stage Tazkira/Passport KYC and verified-member access controls
-- Applied to project qjclffmzkqfgqbbawhaz on 2026-11-23.

alter table public.kyc_applications
  add column if not exists passport_expiry_date date;

alter table public.kyc_applications
  alter column back_document_path drop not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='kyc_supported_document_type_check'
      and conrelid='public.kyc_applications'::regclass
  ) then
    alter table public.kyc_applications
      add constraint kyc_supported_document_type_check
      check (document_type in ('National ID / Tazkira','Passport'));
  end if;
end $$;

alter table public.kyc_applications
  drop constraint if exists kyc_document_details_check;

alter table public.kyc_applications
  add constraint kyc_document_details_check
  check (
    date_of_birth is not null
    and national_id_number is not null
    and length(btrim(national_id_number)) > 0
    and front_document_path is not null
    and selfie_document_path is not null
    and (
      (document_type='Passport' and passport_expiry_date is not null and back_document_path is null)
      or
      (document_type='National ID / Tazkira' and passport_expiry_date is null and back_document_path is not null)
    )
  );

create or replace function private.enforce_approved_kyc_for_member_action()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
begin
  select p.kyc_status into v_status
  from public.profiles p
  where p.id = new.user_id;

  if v_status is distinct from 'approved' then
    raise exception 'KYC verification must be approved before using this service.';
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_approved_kyc_for_member_action() from public, anon, authenticated;

drop trigger if exists require_kyc_deposit_request on public.deposit_requests;
create trigger require_kyc_deposit_request
before insert on public.deposit_requests
for each row execute function private.enforce_approved_kyc_for_member_action();

drop trigger if exists require_kyc_withdrawal_request on public.withdrawal_requests;
create trigger require_kyc_withdrawal_request
before insert on public.withdrawal_requests
for each row execute function private.enforce_approved_kyc_for_member_action();

drop trigger if exists require_kyc_gift_claim on public.gift_claims;
create trigger require_kyc_gift_claim
before insert on public.gift_claims
for each row execute function private.enforce_approved_kyc_for_member_action();

drop trigger if exists require_kyc_mining_click on public.mining_clicks;
create trigger require_kyc_mining_click
before insert on public.mining_clicks
for each row execute function private.enforce_approved_kyc_for_member_action();

create or replace function private.protect_profile_kyc_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() = old.id and not public.is_hewad_admin() then
    if pg_trigger_depth() <= 1 and new.kyc_status is distinct from old.kyc_status then
      raise exception 'KYC status can only be changed by the verification review process.';
    end if;
    if pg_trigger_depth() <= 1 and new.card_number is distinct from old.card_number then
      raise exception 'Member card numbers cannot be changed manually.';
    end if;
    if old.kyc_status = 'approved'
       and (new.country is distinct from old.country or new.kyc_country is distinct from old.kyc_country) then
      raise exception 'Country cannot be changed after KYC approval. Contact support for corrections.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_kyc_fields on public.profiles;
create trigger protect_profile_kyc_fields
before update on public.profiles
for each row execute function private.protect_profile_kyc_fields();

revoke all on function private.protect_profile_kyc_fields() from public, anon, authenticated;

create or replace function private.hdc_send_hewad(
  p_recipient_code text,
  p_amount numeric,
  p_note text default null::text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := (select auth.uid());
  v_recipient uuid;
  v_tx uuid := gen_random_uuid();
  v_identifier text := nullif(btrim(p_recipient_code),'');
  v_gross numeric(30,8);
  v_fee numeric(30,8);
  v_net numeric(30,8);
  v_sender_status text;
  v_recipient_status text;
  v_sender_kyc text;
  v_recipient_kyc text;
begin
  if v_uid is null then raise exception 'Authentication required.'; end if;
  if v_identifier is null or length(v_identifier)<3 or length(v_identifier)>254 then
    raise exception 'Enter the recipient email, referral code or card number.';
  end if;
  if p_amount is null or p_amount<=0 or p_amount>1000000000 then
    raise exception 'Enter a valid HDC amount greater than zero.';
  end if;
  v_gross:=round(p_amount,8);
  v_fee:=round(v_gross*0.01,8);
  v_net:=v_gross-v_fee;
  if v_net<=0 then raise exception 'The amount is too small after the 1%% fee.'; end if;

  select p.id,p.account_status,p.kyc_status
    into v_recipient,v_recipient_status,v_recipient_kyc
  from public.profiles p
  left join auth.users u on u.id=p.id
  where lower(coalesce(p.referral_code,''))=lower(v_identifier)
     or lower(coalesce(u.email,''))=lower(v_identifier)
     or lower(coalesce(p.card_number,''))=lower(v_identifier)
  order by case
    when lower(coalesce(p.referral_code,''))=lower(v_identifier) then 0
    when lower(coalesce(u.email,''))=lower(v_identifier) then 1
    else 2
  end
  limit 1;

  if v_recipient is null then
    raise exception 'No HEWAD COIN account was found for that email, referral code or card number.';
  end if;
  if v_recipient=v_uid then raise exception 'You cannot send HDC to your own account.'; end if;

  select p.account_status,p.kyc_status
    into v_sender_status,v_sender_kyc
  from public.profiles p
  where p.id=v_uid;

  if v_sender_kyc is distinct from 'approved' then
    raise exception 'KYC verification must be approved before sending HDC.';
  end if;
  if v_recipient_kyc is distinct from 'approved' then
    raise exception 'The recipient must complete KYC verification before receiving HDC.';
  end if;
  if v_sender_status is distinct from 'active' or v_recipient_status is distinct from 'active' then
    raise exception 'Both accounts must be active to send or receive HDC.';
  end if;

  insert into public.wallets(user_id) values(v_uid) on conflict(user_id) do nothing;
  insert into public.wallets(user_id) values(v_recipient) on conflict(user_id) do nothing;
  perform 1 from public.wallets
    where user_id in(v_uid,v_recipient)
    order by user_id for update;

  update public.wallets
    set balance_hwc=balance_hwc-v_gross,updated_at=now()
    where user_id=v_uid
      and (balance_hwc-reserved_hwc-staked_hwc)>=v_gross;
  if not found then
    raise exception 'Insufficient available HDC balance (including the 1%% fee).';
  end if;

  update public.wallets
    set balance_hwc=balance_hwc+v_net,updated_at=now()
    where user_id=v_recipient;

  insert into public.wallet_transactions(
    user_id,asset,amount,transaction_type,status,description,reference,created_by
  )
  values
    (v_uid,'HDC',-v_gross,'debit','completed',
     'HDC transfer sent. Includes 1% fee of '||v_fee::text||' HDC.',v_tx::text,v_uid),
    (v_recipient,'HDC',v_net,'credit','completed',
     'HDC received after 1% transfer fee.',v_tx::text,v_uid);

  insert into private.platform_fee_ledger(
    reference,fee_type,asset,gross_amount,fee_rate,fee_amount,net_amount,charged_user_id
  )
  values(v_tx::text,'internal_transfer','HDC',v_gross,0.01,v_fee,v_net,v_uid);

  return v_tx;
end;
$function$;
