-- HEWAD COIN: prevent one identity document from being approved on multiple accounts.
-- Normalize spaces, hyphens and punctuation before checking approved KYC records.

drop index if exists public.kyc_one_approved_document_id_uidx;
create unique index kyc_one_approved_document_id_uidx
  on public.kyc_applications (
    lower(regexp_replace(btrim(national_id_number), '[^[:alnum:]]+', '', 'g'))
  )
  where status = 'approved';

create or replace function public.hwc_guard_duplicate_kyc_document()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing record;
begin
  if new.status = 'approved'
     and (
       tg_op = 'INSERT'
       or old.status is distinct from 'approved'
       or old.national_id_number is distinct from new.national_id_number
     ) then
    select k.user_id, k.first_name, k.last_name, k.document_type
      into v_existing
    from public.kyc_applications k
    where lower(regexp_replace(btrim(k.national_id_number), '[^[:alnum:]]+', '', 'g')) =
          lower(regexp_replace(btrim(new.national_id_number), '[^[:alnum:]]+', '', 'g'))
      and k.status = 'approved'
      and k.id is distinct from new.id
    order by k.reviewed_at nulls last
    limit 1;

    if found then
      raise exception 'DUPLICATE_KYC_DOCUMENT: this identity document is already approved for another account (% %; account %).',
        coalesce(v_existing.first_name, ''),
        coalesce(v_existing.last_name, ''),
        v_existing.user_id
        using errcode = '23505';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.hwc_guard_duplicate_kyc_document() from public, anon, authenticated;

drop trigger if exists hwc_guard_duplicate_kyc_document on public.kyc_applications;
create trigger hwc_guard_duplicate_kyc_document
before insert or update of status, national_id_number
on public.kyc_applications
for each row execute function public.hwc_guard_duplicate_kyc_document();
