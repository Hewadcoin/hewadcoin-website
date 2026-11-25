-- Restore secure admin balance RPC wrappers after private schema usage
-- was revoked for authenticated browser clients.
create or replace function public.admin_get_user_balance_history(p_user_id uuid)
returns table (
  id uuid,
  asset text,
  direction text,
  amount numeric,
  balance_before numeric,
  balance_after numeric,
  note text,
  admin_id uuid,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null or not public.is_hewad_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;
  return query
    select * from private.admin_get_user_balance_history(p_user_id);
end;
$function$;

create or replace function public.admin_adjust_user_balance(
  p_user_id uuid,
  p_asset text,
  p_direction text,
  p_amount numeric,
  p_note text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null or not public.is_hewad_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;
  return private.admin_adjust_user_balance(p_user_id,p_asset,p_direction,p_amount,p_note);
end;
$function$;

revoke all on function public.admin_get_user_balance_history(uuid) from public, anon;
revoke all on function public.admin_adjust_user_balance(uuid,text,text,numeric,text) from public, anon;
grant execute on function public.admin_get_user_balance_history(uuid) to authenticated;
grant execute on function public.admin_adjust_user_balance(uuid,text,text,numeric,text) to authenticated;
