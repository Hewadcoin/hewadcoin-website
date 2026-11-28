-- Repair public PostgREST wrappers that call SECURITY DEFINER functions in the private schema.
-- The wrappers execute as their postgres owner because authenticated has no USAGE on private.
-- Authorization remains enforced inside each private function via auth.uid() and admin permission checks.

CREATE OR REPLACE FUNCTION public.hwc_get_withdrawal_policy(p_asset text)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path TO ''
AS $function$ SELECT private.hwc_get_withdrawal_policy(p_asset); $function$;

CREATE OR REPLACE FUNCTION public.hwc_admin_update_withdrawal_policy(
  p_asset text, p_fee_percent numeric, p_no_fee boolean, p_min_amount numeric,
  p_no_minimum boolean, p_max_24h_amount numeric, p_no_maximum boolean
)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path TO ''
AS $function$
  SELECT private.hwc_admin_update_withdrawal_policy(
    p_asset,p_fee_percent,p_no_fee,p_min_amount,p_no_minimum,p_max_24h_amount,p_no_maximum
  );
$function$;

CREATE OR REPLACE FUNCTION public.hwc_admin_withdrawal_user_email(p_user_id uuid)
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path TO ''
AS $function$ SELECT private.hwc_admin_withdrawal_user_email(p_user_id); $function$;

CREATE OR REPLACE FUNCTION public.hwc_admin_withdrawal_stats(p_period text DEFAULT 'all')
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO ''
AS $function$ SELECT private.hwc_admin_withdrawal_stats(p_period); $function$;

CREATE OR REPLACE FUNCTION public.hwc_admin_complete_withdrawal(p_request_id uuid, p_tx_hash text)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path TO ''
AS $function$ SELECT private.hwc_admin_complete_withdrawal(p_request_id,p_tx_hash); $function$;

CREATE OR REPLACE FUNCTION public.hwc_review_financial_request(
  p_request_type text, p_request_id uuid, p_decision text, p_admin_note text DEFAULT NULL
)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path TO ''
AS $function$
  SELECT private.hwc_review_financial_request(p_request_type,p_request_id,p_decision,p_admin_note);
$function$;

CREATE OR REPLACE FUNCTION public.hwc_create_withdrawal_request(
  p_asset text, p_amount numeric, p_withdrawal_method text, p_destination text, p_request_key uuid DEFAULT NULL
)
RETURNS uuid LANGUAGE sql SECURITY DEFINER SET search_path TO ''
AS $function$
  SELECT private.hwc_create_withdrawal_request(p_asset,p_amount,p_withdrawal_method,p_destination,p_request_key);
$function$;

CREATE OR REPLACE FUNCTION public.hwc_afn_withdraw_request(p_amount numeric, p_account text)
RETURNS uuid LANGUAGE sql SECURITY DEFINER SET search_path TO ''
AS $function$ SELECT private.hwc_afn_withdraw_request(p_amount,p_account); $function$;

REVOKE ALL ON FUNCTION public.hwc_get_withdrawal_policy(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.hwc_admin_update_withdrawal_policy(text,numeric,boolean,numeric,boolean,numeric,boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.hwc_admin_withdrawal_user_email(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.hwc_admin_withdrawal_stats(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.hwc_admin_complete_withdrawal(uuid,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.hwc_review_financial_request(text,uuid,text,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.hwc_create_withdrawal_request(text,numeric,text,text,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.hwc_afn_withdraw_request(numeric,text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.hwc_get_withdrawal_policy(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hwc_admin_update_withdrawal_policy(text,numeric,boolean,numeric,boolean,numeric,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hwc_admin_withdrawal_user_email(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hwc_admin_withdrawal_stats(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hwc_admin_complete_withdrawal(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hwc_review_financial_request(text,uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hwc_create_withdrawal_request(text,numeric,text,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hwc_afn_withdraw_request(numeric,text) TO authenticated;
