-- HEWAD COIN: verified-recipient lookup and idempotent HDC transfers.
-- Keeps the existing active-account and approved-KYC requirements, and adds
-- an explicit recipient email-verification requirement.

create table if not exists private.hdc_recipient_lookup_rate_limit (
  user_id uuid primary key,
  window_started_at timestamptz not null,
  attempts integer not null default 0
);

create table if not exists private.hdc_transfer_requests (
  sender_user_id uuid not null,
  request_id uuid not null,
  transaction_id uuid not null,
  recipient_user_id uuid not null,
  gross_amount numeric(30,8) not null,
  created_at timestamptz not null default now(),
  primary key (sender_user_id, request_id),
  unique (transaction_id)
);

revoke all on table private.hdc_recipient_lookup_rate_limit from public, anon, authenticated;
revoke all on table private.hdc_transfer_requests from public, anon, authenticated;

-- Recipient lookup returns a name only when the target is eligible to receive.
-- A small per-user rate limit reduces email/card enumeration.
create or replace function private.hdc_lookup_hewad_recipient(p_identifier text)
returns table (eligible boolean, display_name text, verification_status text)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := (select auth.uid());
  v_identifier text := nullif(btrim(p_identifier), '');
  v_recipient uuid;
  v_name text;
  v_email_verified boolean;
  v_email_confirmed boolean;
  v_account_status text;
  v_kyc_status text;
  v_attempts integer;
begin
  if v_uid is null then
    raise exception 'Authentication required.';
  end if;

  insert into private.hdc_recipient_lookup_rate_limit(user_id, window_started_at, attempts)
  values (v_uid, date_trunc('minute', now()), 1)
  on conflict (user_id) do update
    set attempts = case
      when private.hdc_recipient_lookup_rate_limit.window_started_at < date_trunc('minute', now()) then 1
      else private.hdc_recipient_lookup_rate_limit.attempts + 1
    end,
    window_started_at = case
      when private.hdc_recipient_lookup_rate_limit.window_started_at < date_trunc('minute', now()) then date_trunc('minute', now())
      else private.hdc_recipient_lookup_rate_limit.window_started_at
    end
  returning attempts into v_attempts;

  if v_attempts > 20 then
    raise exception 'Too many recipient lookups. Please wait one minute and try again.';
  end if;

  if v_identifier is null or length(v_identifier) < 6 or length(v_identifier) > 254 then
    return query select false, null::text, 'NOT_FOUND'::text;
    return;
  end if;

  if position('@' in v_identifier) > 0 then
    select p.id,
           nullif(btrim(concat_ws(' ', p.first_name, p.last_name)), ''),
           p.email_verified,
           (u.email_confirmed_at is not null),
           p.account_status,
           p.kyc_status
      into v_recipient, v_name, v_email_verified, v_email_confirmed, v_account_status, v_kyc_status
      from public.profiles p
      join auth.users u on u.id = p.id
     where lower(u.email) = lower(v_identifier)
     limit 1;
  elsif v_identifier ~ '^[0-9]{6,20}$' then
    select p.id,
           nullif(btrim(concat_ws(' ', p.first_name, p.last_name)), ''),
           p.email_verified,
           (u.email_confirmed_at is not null),
           p.account_status,
           p.kyc_status
      into v_recipient, v_name, v_email_verified, v_email_confirmed, v_account_status, v_kyc_status
      from public.profiles p
      join auth.users u on u.id = p.id
     where p.card_number = v_identifier
     limit 1;
  else
    return query select false, null::text, 'NOT_FOUND'::text;
    return;
  end if;

  if v_recipient is null then
    return query select false, null::text, 'NOT_FOUND'::text;
  elsif v_recipient = v_uid then
    return query select false, null::text, 'SELF_TRANSFER'::text;
  elsif v_account_status is distinct from 'active' then
    return query select false, null::text, 'ACCOUNT_INACTIVE'::text;
  elsif v_email_verified is distinct from true or v_email_confirmed is distinct from true then
    return query select false, null::text, 'NOT_VERIFIED'::text;
  elsif v_kyc_status is distinct from 'approved' then
    return query select false, null::text, 'KYC_REQUIRED'::text;
  else
    return query select true, coalesce(v_name, 'HEWAD COIN Member'), 'VERIFIED'::text;
  end if;
end;
$function$;

revoke all on function private.hdc_lookup_hewad_recipient(text) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.hdc_lookup_hewad_recipient(text) to authenticated;

create or replace function public.hdc_lookup_hewad_recipient(p_identifier text)
returns table (eligible boolean, display_name text, verification_status text)
language sql
security invoker
set search_path = ''
as $function$
  select * from private.hdc_lookup_hewad_recipient(p_identifier);
$function$;

revoke all on function public.hdc_lookup_hewad_recipient(text) from public, anon;
grant execute on function public.hdc_lookup_hewad_recipient(text) to authenticated;

-- Harden the legacy three-argument transfer RPC as well, so older clients
-- cannot bypass recipient email verification.
create or replace function private.hdc_send_hewad(p_recipient_code text, p_amount numeric, p_note text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := (select auth.uid());
  v_recipient uuid;
  v_tx uuid := gen_random_uuid();
  v_identifier text := nullif(btrim(p_recipient_code), '');
  v_gross numeric(30,8);
  v_fee numeric(30,8);
  v_net numeric(30,8);
  v_sender_status text;
  v_recipient_status text;
  v_sender_kyc text;
  v_recipient_kyc text;
  v_recipient_email_verified boolean;
  v_recipient_email_confirmed boolean;
begin
  if v_uid is null then raise exception 'Authentication required.'; end if;
  if v_identifier is null or length(v_identifier) < 3 or length(v_identifier) > 254 then
    raise exception 'Enter the recipient email or card number.';
  end if;
  if p_amount is null or p_amount <= 0 or p_amount > 1000000000 then
    raise exception 'Enter a valid HDC amount greater than zero.';
  end if;
  v_gross := round(p_amount, 8);
  v_fee := round(v_gross * 0.01, 8);
  v_net := v_gross - v_fee;
  if v_net <= 0 then raise exception 'The amount is too small after the 1% fee.'; end if;

  select p.id, p.account_status, p.kyc_status, p.email_verified, (u.email_confirmed_at is not null)
    into v_recipient, v_recipient_status, v_recipient_kyc, v_recipient_email_verified, v_recipient_email_confirmed
    from public.profiles p
    left join auth.users u on u.id = p.id
   where (position('@' in v_identifier) > 0 and lower(coalesce(u.email, '')) = lower(v_identifier))
      or (v_identifier ~ '^[0-9]{6,20}$' and p.card_number = v_identifier)
   limit 1;

  if v_recipient is null then raise exception 'No eligible HEWAD COIN recipient was found.'; end if;
  if v_recipient = v_uid then raise exception 'You cannot send HDC to your own account.'; end if;
  select p.account_status, p.kyc_status into v_sender_status, v_sender_kyc
    from public.profiles p where p.id = v_uid;
  if v_sender_kyc is distinct from 'approved' then raise exception 'KYC verification must be approved before sending HDC.'; end if;
  if v_recipient_kyc is distinct from 'approved' then raise exception 'The recipient must complete KYC verification before receiving HDC.'; end if;
  if v_recipient_email_verified is distinct from true or v_recipient_email_confirmed is distinct from true then
    raise exception 'Recipient Email Not Verified.';
  end if;
  if v_sender_status is distinct from 'active' or v_recipient_status is distinct from 'active' then
    raise exception 'Both accounts must be active to send or receive HDC.';
  end if;

  insert into public.wallets(user_id) values(v_uid) on conflict(user_id) do nothing;
  insert into public.wallets(user_id) values(v_recipient) on conflict(user_id) do nothing;
  perform 1 from public.wallets where user_id in(v_uid, v_recipient) order by user_id for update;

  update public.wallets
     set balance_hwc = balance_hwc - v_gross, updated_at = now()
   where user_id = v_uid and (balance_hwc - reserved_hwc - staked_hwc) >= v_gross;
  if not found then raise exception 'Insufficient available HDC balance (including the 1% fee).'; end if;

  update public.wallets set balance_hwc = balance_hwc + v_net, updated_at = now() where user_id = v_recipient;
  insert into public.wallet_transactions(user_id, asset, amount, transaction_type, status, description, reference, created_by)
  values
    (v_uid, 'HDC', -v_gross, 'debit', 'completed', 'HDC transfer sent. Includes 1% fee of ' || v_fee::text || ' HDC.', v_tx::text, v_uid),
    (v_recipient, 'HDC', v_net, 'credit', 'completed', 'HDC received after 1% transfer fee.', v_tx::text, v_uid);
  insert into private.platform_fee_ledger(reference, fee_type, asset, gross_amount, fee_rate, fee_amount, net_amount, charged_user_id)
  values(v_tx::text, 'internal_transfer', 'HDC', v_gross, 0.01, v_fee, v_net, v_uid);
  return v_tx;
end;
$function$;

-- New idempotent transfer RPC. A client-generated UUID must be reused on retries.
create or replace function private.hdc_send_hewad_v2(
  p_recipient_code text,
  p_amount numeric,
  p_request_id uuid,
  p_note text default null
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
  v_existing_tx uuid;
  v_identifier text := nullif(btrim(p_recipient_code), '');
  v_gross numeric(30,8);
  v_fee numeric(30,8);
  v_net numeric(30,8);
  v_sender_status text;
  v_recipient_status text;
  v_sender_kyc text;
  v_recipient_kyc text;
  v_recipient_email_verified boolean;
  v_recipient_email_confirmed boolean;
begin
  if v_uid is null then raise exception 'Authentication required.'; end if;
  if p_request_id is null then raise exception 'A transfer request ID is required.'; end if;
  if v_identifier is null or length(v_identifier) < 6 or length(v_identifier) > 254 then
    raise exception 'Enter the recipient email or card number.';
  end if;
  if p_amount is null or p_amount <= 0 or p_amount > 1000000000 then
    raise exception 'Enter a valid HDC amount greater than zero.';
  end if;
  v_gross := round(p_amount, 8);
  v_fee := round(v_gross * 0.01, 8);
  v_net := v_gross - v_fee;
  if v_net <= 0 then raise exception 'The amount is too small after the 1% fee.'; end if;

  select p.id, p.account_status, p.kyc_status, p.email_verified, (u.email_confirmed_at is not null)
    into v_recipient, v_recipient_status, v_recipient_kyc, v_recipient_email_verified, v_recipient_email_confirmed
    from public.profiles p
    left join auth.users u on u.id = p.id
   where (position('@' in v_identifier) > 0 and lower(coalesce(u.email, '')) = lower(v_identifier))
      or (v_identifier ~ '^[0-9]{6,20}$' and p.card_number = v_identifier)
   limit 1;

  if v_recipient is null then raise exception 'No eligible HEWAD COIN recipient was found.'; end if;
  if v_recipient = v_uid then raise exception 'You cannot send HDC to your own account.'; end if;

  select p.account_status, p.kyc_status into v_sender_status, v_sender_kyc
    from public.profiles p where p.id = v_uid;
  if v_sender_kyc is distinct from 'approved' then raise exception 'KYC verification must be approved before sending HDC.'; end if;
  if v_recipient_kyc is distinct from 'approved' then raise exception 'The recipient must complete KYC verification before receiving HDC.'; end if;
  if v_recipient_email_verified is distinct from true or v_recipient_email_confirmed is distinct from true then
    raise exception 'Recipient Email Not Verified.';
  end if;
  if v_sender_status is distinct from 'active' or v_recipient_status is distinct from 'active' then
    raise exception 'Both accounts must be active to send or receive HDC.';
  end if;

  insert into private.hdc_transfer_requests(sender_user_id, request_id, transaction_id, recipient_user_id, gross_amount)
  values (v_uid, p_request_id, v_tx, v_recipient, v_gross)
  on conflict (sender_user_id, request_id) do nothing;

  if not found then
    select r.transaction_id into v_existing_tx
      from private.hdc_transfer_requests r
     where r.sender_user_id = v_uid and r.request_id = p_request_id
       and r.recipient_user_id = v_recipient and r.gross_amount = v_gross;
    if v_existing_tx is null then
      raise exception 'This request ID was already used for a different transfer.';
    end if;
    return v_existing_tx;
  end if;

  insert into public.wallets(user_id) values(v_uid) on conflict(user_id) do nothing;
  insert into public.wallets(user_id) values(v_recipient) on conflict(user_id) do nothing;
  perform 1 from public.wallets where user_id in(v_uid, v_recipient) order by user_id for update;

  update public.wallets
     set balance_hwc = balance_hwc - v_gross, updated_at = now()
   where user_id = v_uid and (balance_hwc - reserved_hwc - staked_hwc) >= v_gross;
  if not found then raise exception 'Insufficient available HDC balance (including the 1% fee).'; end if;

  update public.wallets set balance_hwc = balance_hwc + v_net, updated_at = now() where user_id = v_recipient;
  insert into public.wallet_transactions(user_id, asset, amount, transaction_type, status, description, reference, created_by)
  values
    (v_uid, 'HDC', -v_gross, 'debit', 'completed', 'HDC transfer sent. Includes 1% fee of ' || v_fee::text || ' HDC.', v_tx::text, v_uid),
    (v_recipient, 'HDC', v_net, 'credit', 'completed', 'HDC received after 1% transfer fee.', v_tx::text, v_uid);
  insert into private.platform_fee_ledger(reference, fee_type, asset, gross_amount, fee_rate, fee_amount, net_amount, charged_user_id)
  values(v_tx::text, 'internal_transfer', 'HDC', v_gross, 0.01, v_fee, v_net, v_uid);
  return v_tx;
end;
$function$;

revoke all on function private.hdc_send_hewad_v2(text, numeric, uuid, text) from public, anon;
grant execute on function private.hdc_send_hewad_v2(text, numeric, uuid, text) to authenticated;

create or replace function public.hdc_send_hewad_v2(
  p_recipient_code text,
  p_amount numeric,
  p_request_id uuid,
  p_note text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  if auth.uid() is null then raise exception 'Authentication required.'; end if;
  return private.hdc_send_hewad_v2(p_recipient_code, p_amount, p_request_id, p_note);
end;
$function$;

revoke all on function public.hdc_send_hewad_v2(text, numeric, uuid, text) from public, anon;
grant execute on function public.hdc_send_hewad_v2(text, numeric, uuid, text) to authenticated;
