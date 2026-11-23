create schema if not exists private;

create or replace function private.prevent_kyc_identity_reuse()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  normalized_document text;
  existing_owner uuid;
begin
  if auth.uid() is null or auth.uid() <> new.user_id then
    raise exception using
      errcode = '42501',
      message = 'KYC applications must belong to the signed-in account.';
  end if;

  normalized_document := upper(
    regexp_replace(coalesce(new.national_id_number, ''), '[^[:alnum:]]', '', 'g')
  );

  if normalized_document = '' then
    raise exception using
      errcode = '23514',
      message = 'A valid identity document number is required.';
  end if;

  select k.user_id
    into existing_owner
  from public.kyc_applications as k
  where upper(regexp_replace(coalesce(k.national_id_number, ''), '[^[:alnum:]]', '', 'g')) = normalized_document
    and k.user_id <> new.user_id
  order by k.created_at asc
  limit 1;

  if existing_owner is not null then
    raise exception using
      errcode = '23505',
      message = 'This identity document is already linked to another account.';
  end if;

  return new;
end;
$function$;

revoke all on function private.prevent_kyc_identity_reuse() from public, anon, authenticated;

drop trigger if exists prevent_kyc_identity_reuse on public.kyc_applications;
create trigger prevent_kyc_identity_reuse
before insert or update of user_id, national_id_number
on public.kyc_applications
for each row
execute function private.prevent_kyc_identity_reuse();

create unique index if not exists kyc_one_active_document_normalized_uidx
on public.kyc_applications (
  upper(regexp_replace(coalesce(national_id_number, ''), '[^[:alnum:]]', '', 'g'))
)
where status in ('pending', 'approved')
  and nullif(regexp_replace(coalesce(national_id_number, ''), '[^[:alnum:]]', '', 'g'), '') is not null;

drop index if exists public.kyc_one_active_document_per_id_uidx;
