-- Admin event notifications for HEWAD COIN.
-- This migration is stored in the update branch only; it is not applied to production here.
create or replace function private.hwc_notify_admin_event(
  p_title text,
  p_body text,
  p_type text
) returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.notifications(user_id, title, body, notification_type)
  select r.user_id,
         left(coalesce(p_title, 'HEWAD COIN alert'), 160),
         left(coalesce(p_body, ''), 1000),
         left(coalesce(p_type, 'general'), 60)
  from public.user_roles r
  where r.role = 'admin';
$$;

create or replace function private.hwc_notify_profile_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform private.hwc_notify_admin_event(
      'New user registration',
      'A new HEWAD COIN member account has been created.',
      'registration'
    );
  elsif new.account_status is distinct from old.account_status then
    perform private.hwc_notify_admin_event(
      'Account status changed',
      'A member account status changed to ' || coalesce(new.account_status, 'unknown') || '.',
      'account'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists hwc_admin_notify_profile_insert on public.profiles;
create trigger hwc_admin_notify_profile_insert
after insert on public.profiles
for each row execute function private.hwc_notify_profile_event();

drop trigger if exists hwc_admin_notify_profile_status on public.profiles;
create trigger hwc_admin_notify_profile_status
after update of account_status on public.profiles
for each row
when (old.account_status is distinct from new.account_status)
execute function private.hwc_notify_profile_event();

create or replace function private.hwc_notify_kyc_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    perform private.hwc_notify_admin_event(
      'KYC status updated',
      'A member KYC application status changed to ' || coalesce(new.status, 'unknown') || '.',
      'kyc'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists hwc_admin_notify_kyc_status on public.kyc_applications;
create trigger hwc_admin_notify_kyc_status
after update of status on public.kyc_applications
for each row
when (old.status is distinct from new.status)
execute function private.hwc_notify_kyc_status();

create or replace function private.hwc_notify_financial_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_kind text := tg_argv[0];
  v_status text;
begin
  if tg_op = 'INSERT' then
    v_status := coalesce(new.status, 'pending');
    perform private.hwc_notify_admin_event(
      case when v_kind = 'deposit' then 'New deposit request' else 'New withdrawal request' end,
      'A member submitted a ' || v_kind || ' request. Current status: ' || v_status || '.',
      v_kind
    );
  elsif new.status is distinct from old.status then
    perform private.hwc_notify_admin_event(
      initcap(v_kind) || ' request status changed',
      'A member ' || v_kind || ' request status changed to ' || coalesce(new.status, 'unknown') || '.',
      v_kind
    );
  end if;
  return new;
end;
$$;

drop trigger if exists hwc_admin_notify_deposit_insert on public.deposit_requests;
create trigger hwc_admin_notify_deposit_insert
after insert on public.deposit_requests
for each row execute function private.hwc_notify_financial_request('deposit');

drop trigger if exists hwc_admin_notify_deposit_status on public.deposit_requests;
create trigger hwc_admin_notify_deposit_status
after update of status on public.deposit_requests
for each row
when (old.status is distinct from new.status)
execute function private.hwc_notify_financial_request('deposit');

drop trigger if exists hwc_admin_notify_withdrawal_insert on public.withdrawal_requests;
create trigger hwc_admin_notify_withdrawal_insert
after insert on public.withdrawal_requests
for each row execute function private.hwc_notify_financial_request('withdrawal');

drop trigger if exists hwc_admin_notify_withdrawal_status on public.withdrawal_requests;
create trigger hwc_admin_notify_withdrawal_status
after update of status on public.withdrawal_requests
for each row
when (old.status is distinct from new.status)
execute function private.hwc_notify_financial_request('withdrawal');

create or replace function private.hwc_notify_wallet_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.transaction_type in ('credit', 'debit', 'referral_reward', 'adjustment')
     or coalesce(new.description, '') ilike '%transfer%' then
    perform private.hwc_notify_admin_event(
      case
        when new.transaction_type = 'adjustment' then 'Admin balance adjustment'
        when new.transaction_type = 'referral_reward' then 'Referral reward recorded'
        else 'Wallet activity recorded'
      end,
      'A wallet transaction was recorded (' || coalesce(new.asset, 'asset') || ', ' ||
        coalesce(new.transaction_type, 'activity') || ').',
      'wallet'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists hwc_admin_notify_wallet_activity on public.wallet_transactions;
create trigger hwc_admin_notify_wallet_activity
after insert on public.wallet_transactions
for each row execute function private.hwc_notify_wallet_activity();

create or replace function private.hwc_notify_support_ticket()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.hwc_notify_admin_event(
    'New support request',
    'A member submitted a new support ticket.',
    'support'
  );
  return new;
end;
$$;

drop trigger if exists hwc_admin_notify_support_ticket on public.support_tickets;
create trigger hwc_admin_notify_support_ticket
after insert on public.support_tickets
for each row execute function private.hwc_notify_support_ticket();

revoke all on function private.hwc_notify_admin_event(text, text, text) from public, anon, authenticated;
revoke all on function private.hwc_notify_profile_event() from public, anon, authenticated;
revoke all on function private.hwc_notify_kyc_status() from public, anon, authenticated;
revoke all on function private.hwc_notify_financial_request() from public, anon, authenticated;
revoke all on function private.hwc_notify_wallet_activity() from public, anon, authenticated;
revoke all on function private.hwc_notify_support_ticket() from public, anon, authenticated;
