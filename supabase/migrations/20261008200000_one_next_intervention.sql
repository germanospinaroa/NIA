-- The production delivery model is SENT history + one future NEXT.
-- Preserve rows, but close the old five-day active set before enforcing the
-- invariant. The earliest active row is the only candidate that can remain;
-- the background refill then validates its content version and date.
with ranked as (
  select id,
         row_number() over (
           partition by user_id
           order by intended_local_date asc, created_at asc, id asc
         ) as position
  from public.approved_intervention_buffer
  where status in ('approved', 'buffered')
)
update public.approved_intervention_buffer as buffer
set status = 'invalidated',
    invalidated_at = coalesce(buffer.invalidated_at, now())
from ranked
where buffer.id = ranked.id
  and ranked.position > 1;

create unique index if not exists approved_intervention_buffer_one_active_next
  on public.approved_intervention_buffer(user_id)
  where status in ('approved', 'buffered');

-- Refill executions also need one active claim per user. This prevents two
-- concurrent cron invocations from both paying for the same NEXT generation.
with ranked_refills as (
  select id,
         row_number() over (
           partition by user_id, concurrency_key
           order by started_at asc, id asc
         ) as position
  from public.execution_runs
  where execution_context = 'production'
    and concurrency_key = 'approved-buffer-next'
    and status in ('started', 'generating', 'auditing')
)
update public.execution_runs as run
set status = 'failed',
    failure_code = 'duplicate_refill_claim_reconciled',
    failure_message = 'Superseded by the earliest active refill claim',
    completed_at = now()
from ranked_refills
where run.id = ranked_refills.id
  and ranked_refills.position > 1;

create unique index if not exists execution_runs_active_production_concurrency
  on public.execution_runs(user_id, concurrency_key)
  where execution_context = 'production'
    and concurrency_key is not null
    and status in ('started', 'generating', 'auditing');
