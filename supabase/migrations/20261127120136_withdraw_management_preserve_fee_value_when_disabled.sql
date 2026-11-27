-- Keep the saved fee rate visible when the No Fees switch is enabled.
CREATE OR REPLACE FUNCTION private.hwc_get_withdrawal_policy(p_asset text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare s public.withdrawal_policy_settings%rowtype;
begin
 if auth.uid() is null then raise exception 'Authentication required.'; end if;
 if upper(coalesce(p_asset,'')) not in('USD','USDT','HDC','AFN') then raise exception 'Unknown asset.'; end if;
 select * into s from public.withdrawal_policy_settings where asset=case when upper(p_asset)='USDT' then 'USD' else upper(p_asset) end;
 if not found then raise exception 'Withdrawal settings unavailable.'; end if;
 return jsonb_build_object('asset',s.asset,'fee_percent',s.fee_rate*100,
 'no_fee',s.no_fee,'min_amount',s.min_amount,'no_minimum',s.no_minimum,
 'max_24h_amount',s.max_24h_amount,'no_maximum',s.no_maximum,'updated_at',s.updated_at);
end $function$

