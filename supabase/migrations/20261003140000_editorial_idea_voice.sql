-- Editorial idea and voice metadata are additive. Historical rows remain NULL.
alter table public.interventions
  add column if not exists editorial_idea text;

alter table public.intervention_candidates
  add column if not exists editorial_idea text;

create index if not exists interventions_user_editorial_idea_created
  on public.interventions(user_id, editorial_idea, created_at desc)
  where editorial_idea is not null;
