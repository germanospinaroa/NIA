-- Keep backoffice QA interactions out of the production daily-message lane.
-- The production one-daily index intentionally remains scoped to daily_message.
alter table public.interactions
  drop constraint if exists interactions_interaction_type_check;

alter table public.interactions
  add constraint interactions_interaction_type_check
  check (interaction_type in ('daily_message', 'nia_point', 'nia_welcome', 'qa_daily_message'));
