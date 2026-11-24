-- HWC Coin rate management. Stored in the update branch; not applied to the live database.
-- Rates represent display valuation only. They never mint, burn, or modify wallet token balances.
create table if not exists public.hwc_coin_rates (
  id smallint primary key default 1 check (id = 1),
  afn_per_hwc numeric(20,8),
  usd_per_hwc numeric(20,8),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  constraint hwc_coin_rates_afn_positive check (afn_per_hwc is null or afn_per_hwc > 0),
  constraint hwc_coin_rates_usd_positive check (usd_per_hwc is null or usd_per_hwc > 0)
);

insert into public.hwc_coin_rates(id) values (1)
on conflict (id) do nothing;

create table if not exists public.hwc_coin_rate_history (
  id uuid primary key default gen_random_uuid(),
  currency text not null check (currency in ('AFN','USD')),
  old_rate numeric(20,8),
  new_rate numeric(20,8) not null check (new_rate > 0),
  changed_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists hwc_coin_rate_history_created_idx
  on public.hwc_coin_rate_history(created_at desc);

alter table public.hwc_coin_rates enable row level security;
alter table public.hwc_coin_rate_history enable row level security;

revoke all on public.hwc_coin_rates from anon, authenticated;
revoke all on public.hwc_coin_rate_history from anon, authenticated;
grant select on public.hwc_coin_rates to authenticated;
grant select on public.hwc_coin_rate_history to authenticated;

drop policy if exists "Authenticated users can read current HWC rates" on public.hwc_coin_rates;
create policy "Authenticated users can read current HWC rates"
  on public.hwc_coin_rates for select to authenticated using (true);

drop policy if exists "Only admins can read HWC rate history" on public.hwc_coin_rate_history;
create policy "Only admins can read HWC rate history"
  on public.hwc_coin_rate_history for select to authenticated
  using (
    exists (
      select 1 from public.user_roles r
      where r.user_id = (select auth.uid()) and r.role = 'admin'
    )
  );

create or replace function public.admin_set_hwc_coin_rate(
  p_currency text,
  p_rate numeric
) returns table(currency text, rate numeric, updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_currency text := upper(trim(coalesce(p_currency, '')));
  v_old numeric(20,8);
  v_new numeric(20,8);
  v_now timestamptz := now();
begin
  if auth.uid() is null or not exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role = 'admin'
  ) then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if v_currency not in ('AFN','USD') then
    raise exception 'Currency must be AFN or USD.';
  end if;
  if p_rate is null or p_rate <= 0 or p_rate > 1000000000000 then
    raise exception 'Enter a valid positive HWC rate.';
  end if;
  v_new := round(p_rate, 8);

  insert into public.hwc_coin_rates(id) values (1) on conflict (id) do nothing;
  select case when v_currency = 'AFN' then afn_per_hwc else usd_per_hwc end
    into v_old
    from public.hwc_coin_rates
    where id = 1
    for update;

  if v_currency = 'AFN' then
    update public.hwc_coin_rates
      set afn_per_hwc = v_new, updated_at = v_now, updated_by = auth.uid()
      where id = 1;
  else
    update public.hwc_coin_rates
      set usd_per_hwc = v_new, updated_at = v_now, updated_by = auth.uid()
      where id = 1;
  end if;

  insert into public.hwc_coin_rate_history(currency, old_rate, new_rate, changed_by, created_at)
    values (v_currency, v_old, v_new, auth.uid(), v_now);

  return query select v_currency, v_new, v_now;
end;
$$;

revoke all on function public.admin_set_hwc_coin_rate(text,numeric) from public, anon;
grant execute on function public.admin_set_hwc_coin_rate(text,numeric) to authenticated;
