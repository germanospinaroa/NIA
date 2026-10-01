-- NIA operational FK indexes.
-- Local follow-up only: improves joins and deletes without changing data or policies.

create index if not exists execution_runs_intervention_id_idx
  on public.execution_runs(intervention_id);

create index if not exists execution_provider_calls_generation_attempt_idx
  on public.execution_provider_calls(generation_attempt_id);
