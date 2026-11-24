-- Notify members atomically after an administrator changes their wallet balance.
-- Also map USDT wallet adjustments to the USD transaction asset accepted by wallet_transactions.

create or replace function private.admin_adjust_user_balance(p_user_id uuid, p_asset text, p_direction text, p_amount numeric, p_note text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_admin uuid := (select auth.uid());
  v_amount numeric(30,8);
  v_before numeric(30,8);
  v_after numeric(30,8);
  v_adjustment_id uuid := gen_random_uuid();
  v_tx_id uuid := gen_random_uuid();
  v_note text := nullif(left(btrim(coalesce(p_note,'')),500),'');
begin
  if v_admin is null or not public.is_hewad_admin() then
    raise exception 'Administrator access required.' using errcode='42501';
  end if;
  if p_user_id is null then raise exception 'Select a valid user.'; end if;
  if p_asset not in ('USDT','HDC','AFN') then raise exception 'Unsupported asset.'; end if;
  if p_direction not in ('add','subtract') then raise exception 'Choose add or subtract.'; end if;
  if p_amount is null or p_amount<=0 or p_amount>1000000000 then raise exception 'Enter a valid amount greater than zero.'; end if;
  if v_note is null then raise exception 'An audit note/reason is required.'; end if;
  v_amount := round(p_amount,8);
  if v_amount<=0 then raise exception 'Amount is too small.'; end if;

  insert into public.wallets(user_id) values(p_user_id) on conflict(user_id) do nothing;
  select case p_asset when 'HDC' then balance_hwc when 'USDT' then balance_usd when 'AFN' then balance_afn end
    into v_before
  from public.wallets where user_id=p_user_id for update;

  if p_direction='subtract' then
    if p_asset='HDC' and (v_before - (select reserved_hwc+staked_hwc from public.wallets where user_id=p_user_id)) < v_amount then
      raise exception 'Insufficient available HDC balance; reserved/staked amounts cannot be removed.';
    elsif p_asset='USDT' and (v_before - (select reserved_usd+staked_usd from public.wallets where user_id=p_user_id)) < v_amount then
      raise exception 'Insufficient available USDT balance; reserved/staked amounts cannot be removed.';
    elsif p_asset='AFN' and (v_before - (select reserved_afn+staked_afn from public.wallets where user_id=p_user_id)) < v_amount then
      raise exception 'Insufficient available AFN balance; reserved/staked amounts cannot be removed.';
    end if;
  end if;

  v_after := case when p_direction='add' then v_before+v_amount else v_before-v_amount end;
  update public.wallets set
    balance_hwc = case when p_asset='HDC' then v_after else balance_hwc end,
    balance_usd = case when p_asset='USDT' then v_after else balance_usd end,
    balance_afn = case when p_asset='AFN' then v_after else balance_afn end,
    updated_at=now()
  where user_id=p_user_id;

  insert into public.wallet_transactions
    (id,user_id,asset,amount,transaction_type,status,description,reference,created_by)
  values
    (v_tx_id,p_user_id,case when p_asset='USDT' then 'USD' else p_asset end,
     case when p_direction='add' then v_amount else -v_amount end,
     'adjustment','completed',
     'Admin balance '||p_direction||': '||v_note,
     v_adjustment_id::text,v_admin);

  insert into private.admin_balance_adjustments
    (id,user_id,admin_id,asset,direction,amount,balance_before,balance_after,note)
  values
    (v_adjustment_id,p_user_id,v_admin,p_asset,p_direction,v_amount,v_before,v_after,v_note);

  insert into public.notifications(user_id,title,body,notification_type)
  values(
    p_user_id,
    case when p_direction='add' then 'Balance added to your account' else 'Balance deducted from your account' end,
    to_char(v_amount,'FM999999999999990D99999999')||' '||p_asset||
      case when p_direction='add' then ' was added to your balance. Reason: ' else ' was deducted from your balance. Reason: ' end||v_note,
    'balance_adjustment'
  );

  return jsonb_build_object(
    'adjustment_id',v_adjustment_id,
    'transaction_id',v_tx_id,
    'user_id',p_user_id,
    'asset',p_asset,
    'direction',p_direction,
    'amount',v_amount,
    'balance_before',v_before,
    'balance_after',v_after
  );
end;
$function$;
