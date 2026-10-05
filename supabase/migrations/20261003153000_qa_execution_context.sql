-- Keep QA runs independent from production daily idempotency and editorial memory.
-- Additive only: existing production rows remain valid and historical metadata stays NULL.

alter table public.execution_runs
  add column if not exists execution_context text,
  add column if not exists concurrency_key text;

alter table public.interventions
  add column if not exists execution_context text;

alter table public.intervention_candidates
  add column if not exists execution_context text;

create index if not exists execution_runs_qa_context_idx
  on public.execution_runs(user_id, execution_context, started_at desc);

-- A user may have many completed QA runs, but only one active QA run at a time.
-- Production runs leave concurrency_key NULL and are not affected.
create unique index if not exists execution_runs_active_qa_concurrency
  on public.execution_runs(user_id, concurrency_key)
  where execution_context = 'qa'
    and concurrency_key is not null
    and status in ('started', 'generating', 'auditing');

-- Claiming is kept in one transaction so stale recovery and a new QA run
-- cannot race each other. No production execution can enter this function.
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
  select * into current_run
  from public.execution_runs
  where user_id = p_user_id
    and idempotency_key = p_idempotency_key
  limit 1
  for update;

  if found then
    return query select current_run.id, current_run.request_id, current_run.idempotency_key,
      current_run.status, current_run.started_at, false,
      current_run.status in ('started', 'generating', 'auditing'), false;
    return;
  end if;

  select * into current_run
  from public.execution_runs
  where user_id = p_user_id
    and execution_context = 'qa'
    and concurrency_key = p_concurrency_key
    and status in ('started', 'generating', 'auditing')
  order by started_at desc
  limit 1
  for update;

  if found and current_run.started_at > p_stale_before then
    return query select current_run.id, current_run.request_id, current_run.idempotency_key,
      current_run.status, current_run.started_at, false, true, false;
    return;
  end if;

  if found then
    update public.execution_runs
    set status = 'failed',
        failure_code = 'qa_stale_execution',
        failure_message = 'QA execution exceeded the 15 minute active window',
        completed_at = now(),
        duration_ms = greatest(0, extract(epoch from (now() - current_run.started_at))::integer)
    where id = current_run.id;
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
    select * into current_run
    from public.execution_runs
    where user_id = p_user_id
      and execution_context = 'qa'
      and concurrency_key = p_concurrency_key
      and status in ('started', 'generating', 'auditing')
    order by started_at desc
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
