-- Include AFN and HDC withdrawal fees in the platform fee ledger when payouts complete.
alter table private.platform_fee_ledger drop constraint if exists platform_fee_ledger_asset_check;
alter table private.platform_fee_ledger add constraint platform_fee_ledger_asset_check check(asset in('HDC','USD','AFN'));
CREATE OR REPLACE FUNCTION private.hwc_record_usdt_withdrawal_fee()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if old.status='approved' and new.status='completed' and coalesce(new.fee_amount,0)>0 then
  if not exists(select 1 from private.platform_fee_ledger where reference=new.id::text and fee_type='withdrawal') then
   insert into private.platform_fee_ledger(reference,fee_type,asset,gross_amount,fee_rate,fee_amount,net_amount,charged_user_id)
   values(new.id::text,'withdrawal',new.asset,new.amount,coalesce(new.fee_rate,0),new.fee_amount,coalesce(new.net_amount,new.amount-new.fee_amount),new.user_id);
  end if;
 end if;
 return new;
end $function$

