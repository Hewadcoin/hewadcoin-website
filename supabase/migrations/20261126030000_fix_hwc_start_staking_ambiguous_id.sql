-- Fix the ambiguous "id" PL/pgSQL variable in the live staking RPC.
-- The previous implementation declared a local variable named "id" and also
-- queried tables with unqualified "id" columns, causing every stake attempt
-- to fail with SQLSTATE 42702 before a position could be created.
create or replace function private.hwc_start_staking(p_plan_id uuid, p_amount numeric)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_user_id uuid := (select auth.uid());
  v_plan public.staking_plans%rowtype;
  v_kyc_status text;
  v_position_id uuid;
  v_now timestamptz := clock_timestamp();
  v_usd_rate numeric(30,12);
  v_amount numeric(30,8);
  v_member_name text;
begin
  if v_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Enter a valid staking amount.';
  end if;
  v_amount := round(p_amount, 8);

  select pr.kyc_status into v_kyc_status
    from public.profiles as pr where pr.id = v_user_id;
  if v_kyc_status is distinct from 'approved' then
    raise exception 'KYC verification must be approved before staking.';
  end if;

  select sp.* into v_plan
    from public.staking_plans as sp
   where sp.id = p_plan_id and sp.active
     and sp.asset = 'HDC' and sp.duration_days = 360
   for share;
  if not found then
    raise exception 'This HDC staking plan is not available.';
  end if;
  if v_amount < v_plan.min_amount or v_amount > v_plan.max_amount then
    raise exception 'Amount is outside plan limits. Minimum: % HDC; maximum: % HDC.',
      v_plan.min_amount, v_plan.max_amount;
  end if;

  select er.rate into v_usd_rate
    from public.exchange_rates as er
   where er.base_asset = 'HDC' and er.quote_asset = 'USD' and er.active
   order by er.updated_at desc limit 1;

  insert into public.wallets(user_id) values (v_user_id)
  on conflict (user_id) do nothing;
  perform 1 from public.wallets as w where w.user_id = v_user_id for update;

  update public.wallets as w
     set balance_hwc = w.balance_hwc - v_amount,
         staked_hwc = w.staked_hwc + v_amount,
         updated_at = now()
   where w.user_id = v_user_id
     and w.balance_hwc - w.reserved_hwc >= v_amount;
  if not found then
    raise exception 'Insufficient available HDC balance.';
  end if;

  insert into public.staking_positions(
    user_id, plan_id, plan_name, asset, principal, original_principal,
    apr_percent, expected_reward, duration_days, started_at, matures_at,
    usd_rate_at_stake, usd_value_at_stake
  )
  values (
    v_user_id, v_plan.id, v_plan.name, 'HDC', v_amount, v_amount,
    0, 0, 360, v_now, v_now + interval '360 days',
    v_usd_rate,
    case when v_usd_rate is null then null else round(v_amount * v_usd_rate, 8) end
  )
  returning staking_positions.id into v_position_id;

  insert into public.wallet_transactions(
    user_id, asset, amount, transaction_type, status,
    description, reference, created_by
  )
  values (
    v_user_id, 'HDC', -v_amount, 'debit', 'completed',
    'HDC Digital Staking principal locked', v_position_id::text, v_user_id
  );

  select concat_ws(' ', pr.first_name, pr.last_name) into v_member_name
    from public.profiles as pr where pr.id = v_user_id;

  insert into public.notifications(user_id, title, body, notification_type)
  values (
    v_user_id, 'HDC staking successful',
    'Your Yearly Plan position was created successfully. Amount: ' || v_amount::text || ' HDC.',
    'staking_new_position'
  );
  insert into public.notifications(user_id, title, body, notification_type)
  values (
    null, 'New HDC staking request',
    coalesce(nullif(v_member_name, ''), 'A member') || ' staked ' ||
      v_amount::text || ' HDC in the Yearly Plan for 360 days.',
    'staking_new_position'
  );

  insert into private.staking_admin_audit(
    position_id, member_id, actor_id, action, details
  )
  values (
    v_position_id, v_user_id, v_user_id, 'stake_created',
    jsonb_build_object('amount', v_amount, 'plan_name', v_plan.name, 'duration_days', 360)
  );
  return v_position_id;
end;
$function$;