-- Additive editorial metadata. Historical rows remain NULL.
alter table public.interventions
  add column if not exists situation text,
  add column if not exists intention text,
  add column if not exists editorial_type text,
  add column if not exists insight_id text,
  add column if not exists functional_emotion text,
  add column if not exists directiveness text,
  add column if not exists closing_type text,
  add column if not exists action_id text,
  add column if not exists editorial_signature jsonb,
  add column if not exists editorial_score jsonb,
  add column if not exists gate_results jsonb,
  add column if not exists same_day_repetition boolean,
  add column if not exists saturation_state text,
  add column if not exists regeneration_reason text,
  add column if not exists longitudinal_evidence_refs jsonb,
  add column if not exists slot text,
  add column if not exists local_date date;

alter table public.intervention_candidates
  add column if not exists situation text,
  add column if not exists intention text,
  add column if not exists editorial_type text,
  add column if not exists insight_id text,
  add column if not exists functional_emotion text,
  add column if not exists directiveness text,
  add column if not exists closing_type text,
  add column if not exists action_id text,
  add column if not exists editorial_signature jsonb,
  add column if not exists editorial_score jsonb,
  add column if not exists gate_results jsonb,
  add column if not exists same_day_repetition boolean,
  add column if not exists saturation_state text,
  add column if not exists regeneration_reason text,
  add column if not exists longitudinal_evidence_refs jsonb,
  add column if not exists selected_candidate boolean,
  add column if not exists slot text,
  add column if not exists local_date date;

create index if not exists interventions_editorial_territory_date_idx
  on public.interventions (user_id, territory_key, created_at desc);
create index if not exists interventions_editorial_slot_idx
  on public.interventions (user_id, local_date, slot);
