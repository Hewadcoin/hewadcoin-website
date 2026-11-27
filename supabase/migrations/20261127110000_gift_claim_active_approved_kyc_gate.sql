-- HEWAD COIN: Gift redemption requires an active account and approved KYC.
-- Keep this gate specific to gift claims; do not change deposit, withdrawal, or mining rules.

create or replace function private.enforce_eligible_kyc_for_gift_claim()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account_status text;
  v_kyc_status text;
begin
  select p.account_status, p.kyc_status
    into v_account_status, v_kyc_status
  from public.profiles p
  where p.id = new.user_id;

  if not found then
    raise exception 'A valid HEWAD COIN account is required to claim a gift.';
  end if;

  if v_account_status is distinct from 'active' then
    raise exception 'Gift rewards are available only to active accounts.';
  end if;

  if v_kyc_status is distinct from 'approved' then
    raise exception 'KYC verification must be approved before claiming a gift.';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_eligible_kyc_for_gift_claim()
  from public, anon, authenticated;

drop trigger if exists require_kyc_gift_claim on public.gift_claims;
drop trigger if exists require_eligible_kyc_gift_claim on public.gift_claims;

create trigger require_eligible_kyc_gift_claim
before insert on public.gift_claims
for each row
execute function private.enforce_eligible_kyc_for_gift_claim();
