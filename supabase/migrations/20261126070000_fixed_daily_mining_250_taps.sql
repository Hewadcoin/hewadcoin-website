-- Replace legacy referral-tier / random-reward mining with fixed Afghanistan-day mining.
-- Daily window: 08:00 Asia/Kabul through 07:59:59 next day.
-- Each authenticated, KYC-approved tap credits exactly 0.1 HDC immediately.
-- Daily cap: 250 taps / 25 HDC. Existing historical rows are preserved.

create or replace function private.hwc_mining_status()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := (select auth.uid());
  v_today date := ((now() at time zone 'Asia/Kabul') - interval '8 hours')::date;
  v_clicks integer := 0;
  v_earned numeric(28,8) := 0;
  v_balance numeric(28,8) := 0;
  v_total_taps bigint := 0;
  v_total_mined numeric(28,8) := 0;
  v_cycles bigint := 0;
begin
  if v_uid is null then raise exception 'Please sign in to use Mining.'; end if;
  if not exists (
    select 1 from public.profiles p
    where p.id=v_uid
      and p.email_verified=true
      and p.account_status='active'
      and p.kyc_status='approved'
  ) then
    raise exception 'Your account must be active, email verified and KYC approved to use Mining.';
  end if;

  select coalesce(s.clicks_count,0), coalesce(s.reward_total,0)
    into v_clicks,v_earned
  from public.mining_daily_stats s
  where s.user_id=v_uid and s.mining_date=v_today;
  v_clicks:=coalesce(v_clicks,0);
  v_earned:=coalesce(v_earned,0);

  select coalesce(w.balance_hwc,0) into v_balance
  from public.wallets w where w.user_id=v_uid;

  select coalesce(sum(s.clicks_count),0),coalesce(sum(s.reward_total),0),
         count(*) filter (where s.clicks_count>=250)
    into v_total_taps,v_total_mined,v_cycles
  from public.mining_daily_stats s where s.user_id=v_uid;

  return jsonb_build_object(
    'mining_date',v_today,
    'window_timezone','Asia/Kabul',
    'window_start','08:00',
    'window_end','08:00',
    'clicks_today',v_clicks,
    'max_clicks',250,
    'remaining_clicks',greatest(0,250-v_clicks),
    'earned_today',round(v_earned,8),
    'reward_per_tap',0.1,
    'daily_max_reward',25,
    'balance_hdc',coalesce(v_balance,0),
    'total_taps',v_total_taps,
    'total_mined',round(v_total_mined,8),
    'completed_cycles',v_cycles
  );
end;
$function$;

create or replace function private.hwc_mining_click()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := (select auth.uid());
  v_now timestamptz := now();
  v_today date := ((now() at time zone 'Asia/Kabul') - interval '8 hours')::date;
  v_clicks integer := 0;
  v_earned numeric(28,8) := 0;
  v_last timestamptz;
  v_click_id uuid;
  v_balance numeric(28,8);
  v_reward numeric(28,8) := 0.1;
begin
  if v_uid is null then raise exception 'Please sign in to mine HDC.'; end if;
  if not exists (
    select 1 from public.profiles p
    where p.id=v_uid
      and p.email_verified=true
      and p.account_status='active'
      and p.kyc_status='approved'
  ) then
    raise exception 'Your account must be active, email verified and KYC approved to mine HDC.';
  end if;

  insert into public.wallets(user_id) values(v_uid)
  on conflict(user_id) do nothing;
  perform 1 from public.wallets where user_id=v_uid for update;

  insert into public.mining_daily_stats(user_id,mining_date)
  values(v_uid,v_today)
  on conflict(user_id,mining_date) do nothing;

  select clicks_count,reward_total,last_click_at
    into v_clicks,v_earned,v_last
  from public.mining_daily_stats
  where user_id=v_uid and mining_date=v_today
  for update;

  if v_clicks>=250 then
    raise exception 'You have completed all 250 taps for this mining day. A new cycle starts at 08:00 Afghanistan time.';
  end if;
  if v_last is not null and v_now-v_last<interval '250 milliseconds' then
    raise exception 'Please wait a moment before your next tap.';
  end if;

  -- Level remains 1 only to satisfy the legacy NOT NULL / 1..10 constraint.
  -- No referral tiers or variable reward amounts are used anymore.
  insert into public.mining_clicks(user_id,mining_date,level,reward)
  values(v_uid,v_today,1,v_reward)
  returning id into v_click_id;

  update public.wallets
    set balance_hwc=balance_hwc+v_reward,updated_at=v_now
    where user_id=v_uid
    returning balance_hwc into v_balance;

  update public.mining_daily_stats
    set clicks_count=clicks_count+1,
        reward_total=reward_total+v_reward,
        last_click_at=v_now,
        updated_at=v_now
    where user_id=v_uid and mining_date=v_today
    returning clicks_count,reward_total into v_clicks,v_earned;

  insert into public.wallet_transactions(
    user_id,asset,amount,transaction_type,status,description,reference,created_by
  ) values (
    v_uid,'HDC',v_reward,'credit','completed',
    'Mining reward: 0.1 HDC per tap (08:00 Asia/Kabul daily cycle).',
    v_click_id::text,v_uid
  );

  return jsonb_build_object(
    'click_id',v_click_id,
    'reward',v_reward,
    'asset','HDC',
    'clicks_today',v_clicks,
    'max_clicks',250,
    'remaining_clicks',greatest(0,250-v_clicks),
    'earned_today',round(v_earned,8),
    'balance_hdc',v_balance,
    'mining_date',v_today
  );
end;
$function$;

create or replace function public.hwc_mining_status()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
begin
  return private.hwc_mining_status();
end;
$function$;

create or replace function public.hwc_mining_click()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p
    where p.id=(select auth.uid()) and p.kyc_status='approved'
  ) then
    raise exception 'KYC verification must be approved before using Mining.';
  end if;
  return private.hwc_mining_click();
end;
$function$;

revoke all on function private.hwc_mining_status() from public,anon,authenticated;
revoke all on function private.hwc_mining_click() from public,anon,authenticated;
revoke all on function public.hwc_mining_status() from public,anon;
revoke all on function public.hwc_mining_click() from public,anon;
grant execute on function public.hwc_mining_status() to authenticated;
grant execute on function public.hwc_mining_click() to authenticated;
