-- Editorial memory is derived from interventions. This migration only adds
-- nullable metadata for new records and a bounded communication preference.
alter table public.profiles
  add column if not exists communication_preference text;

update public.profiles
set communication_preference = 'adaptive'
where communication_preference is null;

alter table public.profiles
  alter column communication_preference set default 'adaptive',
  alter column communication_preference set not null;

do $$ begin
  alter table public.profiles add constraint profiles_communication_preference_check
    check (communication_preference in ('idea', 'practical', 'structured', 'adaptive'));
exception when duplicate_object then null;
end $$;

alter table public.interventions
  add column if not exists topic text,
  add column if not exists intervention_type text,
  add column if not exists depth text,
  add column if not exists blocks jsonb,
  add column if not exists editorial_strategy text,
  add column if not exists editorial_reason text;

alter table public.intervention_candidates
  add column if not exists topic text,
  add column if not exists intervention_type text,
  add column if not exists depth text,
  add column if not exists blocks jsonb;

do $$ begin
  alter table public.interventions add constraint interventions_intervention_type_check
    check (intervention_type is null or intervention_type in ('brief_insight', 'reflection', 'practical_guidance', 'tool', 'step_by_step', 'example', 'deep_dive'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.interventions add constraint interventions_depth_check
    check (depth is null or depth in ('brief', 'medium', 'deep'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.interventions add constraint interventions_editorial_strategy_check
    check (editorial_strategy is null or editorial_strategy in ('continue_topic', 'change_angle', 'refresh_topic', 'explore_adjacent'));
exception when duplicate_object then null;
end $$;

create index if not exists interventions_user_topic_created
  on public.interventions(user_id, topic, created_at desc)
  where topic is not null;
