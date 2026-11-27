-- Require positive values whenever a minimum or rolling 24-hour maximum is enabled.
CREATE OR REPLACE FUNCTION private.hwc_admin_update_withdrawal_policy(p_asset text, p_fee_percent numeric, p_no_fee boolean, p_min_amount numeric, p_no_minimum boolean, p_max_24h_amount numeric, p_no_maximum boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare a text:=upper(coalesce(p_asset,'')); u uuid:=(select auth.uid());
begin
 if u is null or not public.admin_mgmt_has_permission('withdraw_management') then raise exception 'Withdraw Management permission required.' using errcode='42501'; end if;
 if a not in('USD','HDC','AFN') then raise exception 'Invalid asset.'; end if;
 if p_fee_percent is null or p_fee_percent<0 or p_fee_percent>100 then raise exception 'Fee must be between 0%% and 100%%.'; end if;
 if p_min_amount is null or p_min_amount<0 or p_max_24h_amount is null or p_max_24h_amount<0 then raise exception 'Limits cannot be negative.'; end if;
 if not coalesce(p_no_minimum,false) and p_min_amount<=0 then raise exception 'Set a positive minimum or turn on No Minimum Limit.'; end if;
 if not coalesce(p_no_maximum,false) and p_max_24h_amount<=0 then raise exception 'Set a positive 24-hour maximum or turn on No Maximum Limit.'; end if;
 if not coalesce(p_no_minimum,false) and not coalesce(p_no_maximum,false) and p_max_24h_amount>0 and p_min_amount>p_max_24h_amount then raise exception 'Minimum cannot exceed maximum.'; end if;
 insert into public.withdrawal_policy_settings(asset,fee_rate,no_fee,min_amount,no_minimum,max_24h_amount,no_maximum,updated_by,updated_at)
 values(a,p_fee_percent/100,coalesce(p_no_fee,false),p_min_amount,coalesce(p_no_minimum,false),p_max_24h_amount,coalesce(p_no_maximum,false),u,now())
 on conflict(asset) do update set fee_rate=excluded.fee_rate,no_fee=excluded.no_fee,min_amount=excluded.min_amount,
 no_minimum=excluded.no_minimum,max_24h_amount=excluded.max_24h_amount,no_maximum=excluded.no_maximum,updated_by=u,updated_at=now();
 insert into public.admin_audit_logs(actor_user_id,action,details)
 values(u,'withdrawal_policy_updated',jsonb_build_object('asset',a,'fee_percent',p_fee_percent,'no_fee',p_no_fee,
 'min_amount',p_min_amount,'no_minimum',p_no_minimum,'max_24h_amount',p_max_24h_amount,'no_maximum',p_no_maximum));
 return private.hwc_get_withdrawal_policy(a);
end $function$

