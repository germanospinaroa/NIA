alter table public.funnel_events
  drop constraint if exists funnel_events_screen_index_check;

alter table public.funnel_events
  add constraint funnel_events_screen_index_check
  check (screen_index is null or screen_index between 1 and 7);
