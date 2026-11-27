
do $$
declare d text;
begin
 select pg_get_functiondef('public.admin_search_users(text,text,integer,integer)'::regprocedure) into d;
 d:=replace(d,
  'not public.admin_mgmt_has_permission(''user_management'')',
  'not (public.admin_mgmt_has_permission(''all_users'') or public.admin_mgmt_has_permission(''user_management'') or public.admin_mgmt_has_permission(''balance_management''))');
 execute d;
 select pg_get_functiondef('public.admin_get_user_balance_history(uuid)'::regprocedure) into d;
 d:=replace(d,
  'not public.admin_mgmt_has_permission(''transaction_history'')',
  'not (public.admin_mgmt_has_permission(''transaction_history'') or public.admin_mgmt_has_permission(''balance_management''))');
 execute d;
 select pg_get_functiondef('private.hwc_review_financial_request(text,uuid,text,text)'::regprocedure) into d;
 d:=replace(d,
  'if v_uid is null or not (public.admin_mgmt_has_permission(''deposit_management'') or public.admin_mgmt_has_permission(''withdraw_management'')) then raise exception ''Administrator access required.''; end if;',
  'if v_uid is null then raise exception ''Authentication required.''; end if; if (p_request_type=''deposit'' and not public.admin_mgmt_has_permission(''deposit_management'')) or (p_request_type=''withdrawal'' and not public.admin_mgmt_has_permission(''withdraw_management'')) then raise exception ''Permission denied for this financial request type.'' using errcode=''42501''; end if;');
 execute d;
end $$;