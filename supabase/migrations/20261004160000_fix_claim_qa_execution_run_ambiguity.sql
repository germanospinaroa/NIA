-- Qualify every execution_runs reference to avoid collisions with RETURNS TABLE
-- output names such as idempotency_key, status and request_id.
-- Function replacement only: no data, RLS or table changes.

create or replace function public.claim_qa_execution_run(
  p_user_id uuid,
  p_request_id uuid,
  p_idempotency_key text,
  p_concurrency_key text,
  p_stale_before timestamptz
)
returns table (
  execution_id uuid,
  request_id uuid,
  idempotency_key text,
  status text,
  started_at timestamptz,
  created boolean,
  active boolean,
  stale_replaced boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_run public.execution_runs%rowtype;
  new_run public.execution_runs%rowtype;
  was_stale boolean := false;
begin
  select er.* into current_run
  from public.execution_runs as er
  where er.user_id = p_user_id
    and er.idempotency_key = p_idempotency_key
  limit 1
  for update;

  if found then
    return query select current_run.id, current_run.request_id, current_run.idempotency_key,
      current_run.status, current_run.started_at, false,
      current_run.status in ('started', 'generating', 'auditing'), false;
    return;
  end if;

  select er.* into current_run
  from public.execution_runs as er
  where er.user_id = p_user_id
    and er.execution_context = 'qa'
    and er.concurrency_key = p_concurrency_key
    and er.status in ('started', 'generating', 'auditing')
  order by er.started_at desc
  limit 1
  for update;

  if found and current_run.started_at > p_stale_before then
    return query select current_run.id, current_run.request_id, current_run.idempotency_key,
      current_run.status, current_run.started_at, false, true, false;
    return;
  end if;

  if found then
    update public.execution_runs as er
    set status = 'failed',
        failure_code = 'qa_stale_execution',
        failure_message = 'QA execution exceeded the 15 minute active window',
        completed_at = now(),
        duration_ms = greatest(0, extract(epoch from (now() - current_run.started_at))::integer)
    where er.id = current_run.id;
    was_stale := true;
  end if;

  begin
    insert into public.execution_runs (
      user_id, request_id, idempotency_key, channel, trigger_source,
      execution_context, concurrency_key, status
    ) values (
      p_user_id, p_request_id, p_idempotency_key, 'whatsapp', 'admin_qa',
      'qa', p_concurrency_key, 'started'
    ) returning * into new_run;
  exception when unique_violation then
    select er.* into current_run
    from public.execution_runs as er
    where er.user_id = p_user_id
      and er.execution_context = 'qa'
      and er.concurrency_key = p_concurrency_key
      and er.status in ('started', 'generating', 'auditing')
    order by er.started_at desc
    limit 1
    for update;

    if found then
      return query select current_run.id, current_run.request_id, current_run.idempotency_key,
        current_run.status, current_run.started_at, false, true, false;
      return;
    end if;
    raise;
  end;

  return query select new_run.id, new_run.request_id, new_run.idempotency_key,
    new_run.status, new_run.started_at, true, true, was_stale;
end;
$$;

revoke all on function public.claim_qa_execution_run(uuid, uuid, text, text, timestamptz) from public;
grant execute on function public.claim_qa_execution_run(uuid, uuid, text, text, timestamptz) to service_role;
