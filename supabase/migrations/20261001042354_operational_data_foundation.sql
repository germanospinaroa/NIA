-- NIA operational data foundation.
-- Additive only: execution telemetry, provider usage, events and admin audit.

create table if not exists public.execution_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id text not null,
  idempotency_key text,
  channel text not null default 'web' check (channel in ('web', 'whatsapp')),
  trigger_source text not null default 'unknown',
  status text not null default 'started' check (status in ('started', 'generating', 'auditing', 'approved', 'no_approved_intervention', 'failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_ms integer,
  intervention_id uuid references public.interventions(id) on delete set null,
  failure_code text,
  failure_message text,
  candidate_count integer not null default 0,
  retry_count integer not null default 0,
  stage_results jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create unique index if not exists execution_runs_request_id on public.execution_runs(request_id);
create index if not exists execution_runs_user_started on public.execution_runs(user_id, started_at desc);
create index if not exists execution_runs_status_started on public.execution_runs(status, started_at desc);

create table if not exists public.generation_attempts (
  id uuid primary key default gen_random_uuid(),
  execution_run_id uuid not null references public.execution_runs(id) on delete cascade,
  attempt_number integer not null,
  attempt_type text not null check (attempt_type in ('generation', 'technical_retry', 'quality_retry')),
  provider text,
  model text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_ms integer,
  status text not null default 'started' check (status in ('started', 'completed', 'failed')),
  candidate_count integer not null default 0,
  approved_candidate_count integer not null default 0,
  rejection_count integer not null default 0,
  error_code text,
  error_message text,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  created_at timestamptz not null default now()
);
create index if not exists generation_attempts_execution_created on public.generation_attempts(execution_run_id, created_at);

create table if not exists public.execution_provider_calls (
  id uuid primary key default gen_random_uuid(),
  execution_run_id uuid not null references public.execution_runs(id) on delete cascade,
  generation_attempt_id uuid references public.generation_attempts(id) on delete set null,
  provider text not null,
  model text,
  operation text not null check (operation in ('generation', 'embedding', 'semantic_judge', 'llm_audit')),
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  latency_ms integer,
  status text not null check (status in ('success', 'failed')),
  error_code text,
  error_message text,
  created_at timestamptz not null default now()
);
create index if not exists execution_provider_calls_execution_created on public.execution_provider_calls(execution_run_id, created_at);
create index if not exists execution_provider_calls_user_lookup on public.execution_provider_calls(provider, operation, created_at desc);

create table if not exists public.event_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  execution_run_id uuid references public.execution_runs(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists event_log_user_occurred on public.event_log(user_id, occurred_at desc);
create index if not exists event_log_type_occurred on public.event_log(event_type, occurred_at desc);
create index if not exists event_log_execution_occurred on public.event_log(execution_run_id, occurred_at);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
create index if not exists admin_audit_log_admin_occurred on public.admin_audit_log(admin_user_id, occurred_at desc);
create index if not exists admin_audit_log_target_occurred on public.admin_audit_log(target_type, target_id, occurred_at desc);

alter table public.execution_runs enable row level security;
alter table public.generation_attempts enable row level security;
alter table public.execution_provider_calls enable row level security;
alter table public.event_log enable row level security;
alter table public.admin_audit_log enable row level security;

drop policy if exists execution_runs_select_own on public.execution_runs;
create policy execution_runs_select_own on public.execution_runs
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists generation_attempts_select_own on public.generation_attempts;
create policy generation_attempts_select_own on public.generation_attempts
  for select to authenticated using (exists (
    select 1 from public.execution_runs run
    where run.id = generation_attempts.execution_run_id
      and run.user_id = (select auth.uid())
  ));

drop policy if exists execution_provider_calls_select_own on public.execution_provider_calls;
create policy execution_provider_calls_select_own on public.execution_provider_calls
  for select to authenticated using (exists (
    select 1 from public.execution_runs run
    where run.id = execution_provider_calls.execution_run_id
      and run.user_id = (select auth.uid())
  ));

drop policy if exists event_log_select_own on public.event_log;
create policy event_log_select_own on public.event_log
  for select to authenticated using ((select auth.uid()) = user_id);

-- Operational writes are performed by the authenticated server client for the
-- current user or by the server-side service role for admin operations.
drop policy if exists execution_runs_insert_own on public.execution_runs;
create policy execution_runs_insert_own on public.execution_runs
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists execution_runs_update_own on public.execution_runs;
create policy execution_runs_update_own on public.execution_runs
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists generation_attempts_insert_own on public.generation_attempts;
create policy generation_attempts_insert_own on public.generation_attempts
  for insert to authenticated with check (exists (
    select 1 from public.execution_runs run
    where run.id = generation_attempts.execution_run_id
      and run.user_id = (select auth.uid())
  ));

drop policy if exists generation_attempts_update_own on public.generation_attempts;
create policy generation_attempts_update_own on public.generation_attempts
  for update to authenticated using (exists (
    select 1 from public.execution_runs run
    where run.id = generation_attempts.execution_run_id
      and run.user_id = (select auth.uid())
  )) with check (exists (
    select 1 from public.execution_runs run
    where run.id = generation_attempts.execution_run_id
      and run.user_id = (select auth.uid())
  ));

drop policy if exists execution_provider_calls_insert_own on public.execution_provider_calls;
create policy execution_provider_calls_insert_own on public.execution_provider_calls
  for insert to authenticated with check (exists (
    select 1 from public.execution_runs run
    where run.id = execution_provider_calls.execution_run_id
      and run.user_id = (select auth.uid())
  ));

drop policy if exists event_log_insert_own on public.event_log;
create policy event_log_insert_own on public.event_log
  for insert to authenticated with check ((select auth.uid()) = user_id);
