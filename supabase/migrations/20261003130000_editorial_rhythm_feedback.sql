-- Editorial rhythm is derived from intervention history. These nullable fields enrich
-- new records without rewriting historical content or creating a parallel memory table.
alter table public.interventions
  add column if not exists editorial_take text,
  add column if not exists experience_type text,
  add column if not exists territory_key text,
  add column if not exists exercise_present boolean,
  add column if not exists question_present boolean,
  add column if not exists feedback_requested boolean;

alter table public.intervention_candidates
  add column if not exists editorial_take text,
  add column if not exists experience_type text,
  add column if not exists territory_key text,
  add column if not exists exercise_present boolean,
  add column if not exists question_present boolean,
  add column if not exists feedback_requested boolean;

do $$ begin
  alter table public.interventions add constraint interventions_experience_type_check
    check (experience_type is null or experience_type in ('brief_insight', 'reflection', 'encouragement', 'perspective_shift', 'practical_tool', 'exercise', 'challenge', 'question', 'check_in', 'validation', 'direct_push', 'concrete_example', 'story_or_scenario', 'feedback_request'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.intervention_candidates add constraint intervention_candidates_experience_type_check
    check (experience_type is null or experience_type in ('brief_insight', 'reflection', 'encouragement', 'perspective_shift', 'practical_tool', 'exercise', 'challenge', 'question', 'check_in', 'validation', 'direct_push', 'concrete_example', 'story_or_scenario', 'feedback_request'));
exception when duplicate_object then null;
end $$;

create index if not exists interventions_user_experience_created
  on public.interventions(user_id, experience_type, created_at desc)
  where experience_type is not null;

create index if not exists interventions_user_take_created
  on public.interventions(user_id, editorial_take, created_at desc)
  where editorial_take is not null;
