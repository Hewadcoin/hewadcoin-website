-- Wallet balance fields already exclude locked staking principal: staking debits balance_hwc/balance_usd when a position is opened.
-- Reserved amounts remain excluded from spendable funds; staked amounts must not be subtracted a second time.
do $migration$
declare
  v_def text;
  v_old text;
  v_new text;
begin
  v_def := pg_get_functiondef('private.admin_adjust_user_balance(uuid,text,text,numeric,text)'::regprocedure);

  v_old := '(v_before - (select reserved_hwc+staked_hwc from public.wallets where user_id=p_user_id))';
  v_new := '(v_before - coalesce((select reserved_hwc from public.wallets where user_id=p_user_id),0))';
  if position(v_old in v_def)=0 then raise exception 'Could not locate HDC subtract guard in private.admin_adjust_user_balance'; end if;
  v_def := replace(v_def,v_old,v_new);

  v_old := '(v_before - (select reserved_usd+staked_usd from public.wallets where user_id=p_user_id))';
  v_new := '(v_before - coalesce((select reserved_usd from public.wallets where user_id=p_user_id),0))';
  if position(v_old in v_def)=0 then raise exception 'Could not locate USDT subtract guard in private.admin_adjust_user_balance'; end if;
  v_def := replace(v_def,v_old,v_new);

  v_old := '(v_before - (select reserved_afn+staked_afn from public.wallets where user_id=p_user_id))';
  v_new := '(v_before - coalesce((select reserved_afn from public.wallets where user_id=p_user_id),0))';
  if position(v_old in v_def)=0 then raise exception 'Could not locate AFN subtract guard in private.admin_adjust_user_balance'; end if;
  v_def := replace(v_def,v_old,v_new);
  execute v_def;

  v_def := pg_get_functiondef('private.hwc_convert_assets(text,text,numeric)'::regprocedure);
  v_old := 'balance_hwc - coalesce(reserved_hwc, 0) - coalesce(staked_hwc, 0)';
  v_new := 'balance_hwc - coalesce(reserved_hwc, 0)';
  if position(v_old in v_def)=0 then raise exception 'Could not locate HDC available-balance guard in private.hwc_convert_assets'; end if;
  v_def := replace(v_def,v_old,v_new);

  v_old := 'balance_usd - coalesce(reserved_usd, 0) - coalesce(staked_usd, 0)';
  v_new := 'balance_usd - coalesce(reserved_usd, 0)';
  if position(v_old in v_def)=0 then raise exception 'Could not locate USD available-balance guard in private.hwc_convert_assets'; end if;
  v_def := replace(v_def,v_old,v_new);
  execute v_def;
end
$migration$;