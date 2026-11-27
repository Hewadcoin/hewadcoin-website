-- Fix the public Gift Code RPC wrapper permissions.
-- The private implementation performs its own administrator authorization check.
create or replace function public.hwc_admin_create_gift_code_v2(
  p_code text,
  p_reward_amount numeric,
  p_max_claims integer default null
)
returns uuid
language sql
security definer
set search_path = ''
as $$
  select private.hwc_admin_create_gift_code_v2(p_code, p_reward_amount, p_max_claims);
$$;

revoke all on function public.hwc_admin_create_gift_code_v2(text,numeric,integer) from public, anon;
grant execute on function public.hwc_admin_create_gift_code_v2(text,numeric,integer) to authenticated;
