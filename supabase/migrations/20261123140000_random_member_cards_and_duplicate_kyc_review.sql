-- HEWAD COIN: eight-digit random member cards and admin duplicate-document review
-- Safe for existing issued cards: existing numbers are preserved; new cards use random unique 8-digit numbers.

create unique index if not exists profiles_card_number_unique_idx
  on public.profiles(card_number)
  where card_number is not null and btrim(card_number) <> '';

create or replace function private.generate_unique_member_card_number()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_candidate text;
begin
  -- Serialize generation so simultaneous approvals cannot select the same free number.
  perform pg_advisory_xact_lock(hashtext('hewad-member-card-number'));

  loop
    v_candidate := (10000000 + floor(random() * 90000000)::bigint)::text;
    exit when not exists (
      select 1 from public.profiles p where p.card_number = v_candidate
    );
  end loop;

  return v_candidate;
end;
$$;

revoke all on function private.generate_unique_member_card_number() from public, anon, authenticated;

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
             card_number = coalesce(nullif(card_number, ''), private.generate_unique_member_card_number()),
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

-- Admin-only lookup: match normalized document numbers against every other account,
-- including pending/rejected applications, so the reviewer can inspect possible reuse.
create or replace function public.hwc_find_duplicate_kyc_document(
  p_document_id text,
  p_exclude_user_id uuid
)
returns table (
  application_id uuid,
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  document_type text,
  national_id_number text,
  date_of_birth date,
  country text,
  province text,
  district text,
  mobile_number text,
  status text,
  created_at timestamptz,
  front_document_path text,
  back_document_path text,
  selfie_document_path text,
  card_number text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_hewad_admin() then
    raise exception 'Only authorized HEWAD COIN reviewers can inspect duplicate identity records.'
      using errcode = '42501';
  end if;

  if nullif(regexp_replace(lower(btrim(coalesce(p_document_id,''))), '[[:space:]]+', '', 'g'),'') is null then
    return;
  end if;

  return query
  select k.id, k.user_id, u.email::text, k.first_name, k.last_name,
         k.document_type, k.national_id_number, k.date_of_birth, k.country,
         k.province, k.district, k.mobile_number, k.status, k.created_at,
         k.front_document_path, k.back_document_path, k.selfie_document_path,
         p.card_number
  from public.kyc_applications k
  join auth.users u on u.id = k.user_id
  left join public.profiles p on p.id = k.user_id
  where k.user_id <> p_exclude_user_id
    and lower(regexp_replace(btrim(coalesce(k.national_id_number,'')), '[[:space:]]+', '', 'g')) =
        lower(regexp_replace(btrim(p_document_id), '[[:space:]]+', '', 'g'))
  order by case k.status when 'approved' then 0 when 'pending' then 1 else 2 end,
           k.created_at desc
  limit 20;
end;
$$;

revoke all on function public.hwc_find_duplicate_kyc_document(text, uuid) from public, anon;
grant execute on function public.hwc_find_duplicate_kyc_document(text, uuid) to authenticated;


-- Enforce one approved identity document number across all member accounts.
-- This unique index also closes the race between simultaneous approval attempts.
create unique index if not exists kyc_one_approved_document_per_id_uidx
  on public.kyc_applications (
    lower(regexp_replace(btrim(national_id_number), '[[:space:]]+', '', 'g'))
  )
  where status = 'approved'
    and nullif(btrim(national_id_number), '') is not null;

-- Enforce one active identity document across all accounts.
-- Rejected applications may be resubmitted; pending/approved documents are unique globally.
create unique index if not exists kyc_one_active_document_per_id_uidx
  on public.kyc_applications (
    lower(regexp_replace(btrim(national_id_number), '[[:space:]]+', '', 'g'))
  )
  where status in ('pending', 'approved')
    and nullif(btrim(national_id_number), '') is not null;
