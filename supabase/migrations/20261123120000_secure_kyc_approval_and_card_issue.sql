-- HEWAD COIN: secure KYC approval, unique verified identity, country and card issue date
-- Applied to Supabase project qjclffmzkqfgqbbawhaz on 2026-11-23.

alter table public.profiles
  add column if not exists card_created_at timestamptz;

drop index if exists public.kyc_one_approved_document_id_uidx;
create unique index kyc_one_approved_document_id_uidx
  on public.kyc_applications (lower(regexp_replace(btrim(national_id_number), '[[:space:]]+', '', 'g')))
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
  if new.status = 'approved' and old.status is distinct from 'approved' then
    select k.user_id, k.first_name, k.last_name, k.document_type
      into v_existing
    from public.kyc_applications k
    where lower(regexp_replace(btrim(k.national_id_number), '[[:space:]]+', '', 'g')) =
          lower(regexp_replace(btrim(new.national_id_number), '[[:space:]]+', '', 'g'))
      and k.status = 'approved'
      and k.user_id <> new.user_id
    order by k.reviewed_at nulls last
    limit 1;

    if found then
      raise exception 'DUPLICATE_KYC_DOCUMENT: this document is already approved for another account (% %; account %). This request cannot be approved.',
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
before update of status on public.kyc_applications
for each row execute function public.hwc_guard_duplicate_kyc_document();

create or replace function public.sync_kyc_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.status is distinct from old.status then
    new.updated_at := now();

    if new.status in ('approved', 'rejected') then
      new.reviewed_at := now();
      new.reviewed_by := (select auth.uid());
    end if;

    if new.status = 'approved' then
      update public.profiles
         set kyc_status = 'approved',
             first_name = new.first_name,
             last_name = new.last_name,
             country = new.country,
             kyc_country = new.country,
             province = new.province,
             card_number = coalesce(nullif(card_number, ''), nextval('public.member_card_number_seq'::regclass)::text),
             card_created_at = coalesce(card_created_at, now()),
             updated_at = now()
       where id = new.user_id;

      insert into public.notifications(user_id, title, body, notification_type)
      values(new.user_id, 'KYC approved',
             'Your identity verification has been approved. Your HEWAD COIN member card is now active.',
             'kyc');

    elsif new.status = 'rejected' then
      update public.profiles
         set kyc_status = 'rejected', updated_at = now()
       where id = new.user_id;

      insert into public.notifications(user_id, title, body, notification_type)
      values(new.user_id, 'KYC rejected',
             coalesce(nullif(btrim(new.rejection_reason), ''), 'Please contact support for details.'),
             'kyc');
    end if;
  end if;
  return new;
end;
$function$;
