-- HEWAD COIN: allow admins to configure policy values for all three ledger currencies.
-- This does NOT enable HDC or AFN payouts. The live request RPC remains USDT/BEP20-only.
CREATE OR REPLACE FUNCTION private.hwc_admin_update_withdrawal_policy(
 p_asset text,
 p_fee_percent numeric,
 p_no_fee boolean,
 p_min_amount numeric,
 p_no_minimum boolean,
 p_max_24h_amount numeric,
 p_no_maximum boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
 a text := upper(coalesce(p_asset,''));
 u uuid := (SELECT auth.uid());
BEGIN
 IF u IS NULL OR NOT public.admin_mgmt_has_permission('withdraw_management') THEN
  RAISE EXCEPTION 'Withdraw Management permission required.' USING errcode='42501';
 END IF;
 IF a NOT IN ('USD','HDC','AFN') THEN
  RAISE EXCEPTION 'Invalid withdrawal currency.';
 END IF;
 IF p_fee_percent IS NULL OR p_fee_percent < 0 OR p_fee_percent > 100 THEN
  RAISE EXCEPTION 'Fee must be between 0% and 100%.';
 END IF;
 IF p_min_amount IS NULL OR p_min_amount < 0 OR p_max_24h_amount IS NULL OR p_max_24h_amount < 0 THEN
  RAISE EXCEPTION 'Limits cannot be negative.';
 END IF;
 IF NOT coalesce(p_no_minimum,false) AND p_min_amount <= 0 THEN
  RAISE EXCEPTION 'Set a positive minimum or turn off Minimum Withdraw.';
 END IF;
 IF NOT coalesce(p_no_maximum,false) AND p_max_24h_amount <= 0 THEN
  RAISE EXCEPTION 'Set a positive 24-hour maximum or turn off Maximum Withdraw.';
 END IF;
 IF NOT coalesce(p_no_minimum,false)
    AND NOT coalesce(p_no_maximum,false)
    AND p_min_amount > p_max_24h_amount THEN
  RAISE EXCEPTION 'Minimum cannot exceed maximum.';
 END IF;

 INSERT INTO public.withdrawal_policy_settings(
  asset,fee_rate,no_fee,min_amount,no_minimum,max_24h_amount,no_maximum,updated_by,updated_at
 )
 VALUES(
  a,p_fee_percent/100,coalesce(p_no_fee,false),p_min_amount,coalesce(p_no_minimum,false),
  p_max_24h_amount,coalesce(p_no_maximum,false),u,now()
 )
 ON CONFLICT(asset) DO UPDATE SET
  fee_rate=excluded.fee_rate,
  no_fee=excluded.no_fee,
  min_amount=excluded.min_amount,
  no_minimum=excluded.no_minimum,
  max_24h_amount=excluded.max_24h_amount,
  no_maximum=excluded.no_maximum,
  updated_by=u,
  updated_at=now();

 INSERT INTO public.admin_audit_logs(actor_user_id,action,details)
 VALUES(
  u,
  'withdrawal_policy_updated',
  jsonb_build_object(
   'asset',a,
   'fee_percent',p_fee_percent,
   'fee_enabled',NOT coalesce(p_no_fee,false),
   'minimum',p_min_amount,
   'minimum_enabled',NOT coalesce(p_no_minimum,false),
   'maximum_24h',p_max_24h_amount,
   'maximum_enabled',NOT coalesce(p_no_maximum,false)
  )
 );
 RETURN private.hwc_get_withdrawal_policy(a);
END
$function$;
