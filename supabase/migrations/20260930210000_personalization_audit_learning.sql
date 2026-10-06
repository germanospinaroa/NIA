-- NIA personalization foundation. This migration is additive and keeps existing MVP data.
alter table public.profiles
  add column if not exists desired_change_original text,
  add column if not exists desired_change_summary text,
  add column if not exists desired_change_concepts jsonb not null default '[]'::jsonb,
  add column if not exists desired_change_language jsonb not null default '[]'::jsonb,
  add column if not exists desired_change_started_at timestamptz,
  add column if not exists desired_change_last_confirmed_at timestamptz,
  add column if not exists desired_change_status text not null default 'active' check (desired_change_status in ('active','changed','archived')),
  add column if not exists current_context_original text,
  add column if not exists current_context_summary text,
  add column if not exists current_context_domain text,
  add column if not exists current_context_started_at timestamptz,
  add column if not exists current_context_last_confirmed_at timestamptz,
  add column if not exists current_context_status text not null default 'active' check (current_context_status in ('active','changed','archived')),
  add column if not exists learning_profile jsonb not null default '{}'::jsonb;

alter table public.onboarding_drafts
  add column if not exists desired_change_original text,
  add column if not exists current_context_original text,
  add column if not exists preferred_language text;

create table if not exists public.desired_change_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  desired_change_original text not null,
  desired_change_summary text,
  status text not null default 'ended' check (status in ('active','ended','archived')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists desired_change_history_user_created on public.desired_change_history(user_id, created_at desc);

create table if not exists public.context_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  context_original text not null,
  context_summary text,
  domain text,
  source text not null default 'user',
  status text not null default 'active' check (status in ('active','ended','archived')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.interventions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  function text not null,
  concept text not null,
  angle text not null,
  structure text not null,
  context_key text,
  desired_change_snapshot text,
  current_context_snapshot text,
  audit_status text not null default 'approved' check (audit_status in ('approved','rejected')),
  audit_results jsonb not null default '{}'::jsonb,
  channel text not null default 'web',
  status text not null default 'created' check (status in ('created','delivered','failed')),
  delivered_at timestamptz,
  idempotency_key text,
  created_at timestamptz not null default now()
);
-- The table may predate this migration in remote environments. CREATE TABLE IF NOT EXISTS
-- does not add columns to an existing table, so keep this compatibility step explicit.
alter table public.interventions add column if not exists idempotency_key text;
create index if not exists interventions_user_created on public.interventions(user_id, created_at desc);
create unique index if not exists interventions_user_idempotency on public.interventions(user_id, idempotency_key) where idempotency_key is not null;

create table if not exists public.intervention_candidates (
  id uuid primary key default gen_random_uuid(),
  intervention_id uuid references public.interventions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  candidate_text text not null,
  function text not null,
  concept text not null,
  angle text not null,
  structure text not null,
  audit_results jsonb not null default '{}'::jsonb,
  rejection_reason text,
  created_at timestamptz not null default now()
);
create index if not exists intervention_candidates_user_created on public.intervention_candidates(user_id, created_at desc);

create table if not exists public.intervention_feedback (
  id uuid primary key default gen_random_uuid(),
  intervention_id uuid not null references public.interventions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  dimension text not null,
  options jsonb not null default '[]'::jsonb,
  selected_option text,
  learning_signal jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  signal text not null,
  value jsonb not null,
  confidence numeric,
  source text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists learning_signals_user_created on public.learning_signals(user_id, created_at desc);

alter table public.context_history enable row level security;
alter table public.desired_change_history enable row level security;
alter table public.interventions enable row level security;
alter table public.intervention_candidates enable row level security;
alter table public.intervention_feedback enable row level security;
alter table public.learning_signals enable row level security;

drop policy if exists context_history_own on public.context_history;
create policy context_history_own on public.context_history for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists desired_change_history_own on public.desired_change_history;
create policy desired_change_history_own on public.desired_change_history for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists interventions_own on public.interventions;
create policy interventions_own on public.interventions for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists interventions_insert_own on public.interventions;
create policy interventions_insert_own on public.interventions for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists intervention_candidates_own on public.intervention_candidates;
create policy intervention_candidates_own on public.intervention_candidates for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists intervention_candidates_insert_own on public.intervention_candidates;
create policy intervention_candidates_insert_own on public.intervention_candidates for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists intervention_feedback_own on public.intervention_feedback;
create policy intervention_feedback_own on public.intervention_feedback for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists learning_signals_own on public.learning_signals;
create policy learning_signals_own on public.learning_signals for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists learning_signals_insert_own on public.learning_signals;
create policy learning_signals_insert_own on public.learning_signals for insert to authenticated with check ((select auth.uid()) = user_id);
