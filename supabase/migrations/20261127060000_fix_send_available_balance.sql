-- Staking principal is debited from balance_hwc when a stake opens.
-- Keep reserved HDC excluded, but do not subtract staked_hwc a second time.
do $migration$
declare
  v_def text;
  v_old text := '(balance_hwc - reserved_hwc - staked_hwc)';
  v_new text := '(balance_hwc - coalesce(reserved_hwc, 0))';
begin
  v_def := pg_get_functiondef('hewad_api.hdc_send_hewad_v2(text,numeric,uuid,text)'::regprocedure);

  if position(v_old in v_def) = 0 then
    if position(v_new in v_def) > 0 then
      return;
    end if;
    raise exception 'Could not locate the HDC available-balance guard in hewad_api.hdc_send_hewad_v2';
  end if;

  v_def := replace(v_def, v_old, v_new);
  execute v_def;
end
$migration$;
