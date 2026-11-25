-- Keep callable transfer internals in a dedicated non-exposed schema.
-- Do not grant authenticated users general USAGE on the shared private schema.

create schema if not exists hewad_api;

alter function private.hdc_lookup_hewad_recipient(text) set schema hewad_api;
alter function private.hdc_send_hewad(text, numeric, text) set schema hewad_api;
alter function private.hdc_send_hewad_v2(text, numeric, uuid, text) set schema hewad_api;

revoke usage on schema private from authenticated;
grant usage on schema hewad_api to authenticated;

revoke all on function hewad_api.hdc_lookup_hewad_recipient(text) from public, anon;
revoke all on function hewad_api.hdc_send_hewad(text, numeric, text) from public, anon;
revoke all on function hewad_api.hdc_send_hewad_v2(text, numeric, uuid, text) from public, anon;
grant execute on function hewad_api.hdc_lookup_hewad_recipient(text) to authenticated;
grant execute on function hewad_api.hdc_send_hewad(text, numeric, text) to authenticated;
grant execute on function hewad_api.hdc_send_hewad_v2(text, numeric, uuid, text) to authenticated;

create or replace function public.hdc_lookup_hewad_recipient(p_identifier text)
returns table (eligible boolean, display_name text, verification_status text)
language sql
security invoker
set search_path = ''
as $function$
  select * from hewad_api.hdc_lookup_hewad_recipient(p_identifier);
$function$;
revoke all on function public.hdc_lookup_hewad_recipient(text) from public, anon;
grant execute on function public.hdc_lookup_hewad_recipient(text) to authenticated;

create or replace function public.hdc_send_hewad(p_recipient_code text, p_amount numeric, p_note text default null)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p
     where p.id = (select auth.uid()) and p.kyc_status = 'approved'
  ) then
    raise exception 'KYC verification must be approved before sending HDC.';
  end if;
  return hewad_api.hdc_send_hewad(p_recipient_code, p_amount, p_note);
end;
$function$;
revoke all on function public.hdc_send_hewad(text, numeric, text) from public, anon;
grant execute on function public.hdc_send_hewad(text, numeric, text) to authenticated;

create or replace function public.hdc_send_hewad_v2(
  p_recipient_code text,
  p_amount numeric,
  p_request_id uuid,
  p_note text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  if auth.uid() is null then raise exception 'Authentication required.'; end if;
  return hewad_api.hdc_send_hewad_v2(p_recipient_code, p_amount, p_request_id, p_note);
end;
$function$;
revoke all on function public.hdc_send_hewad_v2(text, numeric, uuid, text) from public, anon;
grant execute on function public.hdc_send_hewad_v2(text, numeric, uuid, text) to authenticated;