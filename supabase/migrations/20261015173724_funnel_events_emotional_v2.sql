-- Add the emotional_v2 public funnel and persist checkout initiation without rewriting history.
alter table public.funnel_events drop constraint if exists funnel_events_funnel_version_check;
alter table public.funnel_events add constraint funnel_events_funnel_version_check
  check (funnel_version in ('short_v1', 'short_v2', 'emotional_v1', 'emotional_v2'));

alter table public.funnel_events drop constraint if exists funnel_events_event_name_check;
alter table public.funnel_events add constraint funnel_events_event_name_check
  check (event_name in ('discover_started', 'premium_funnel_started', 'discover_screen_viewed', 'discover_screen_completed', 'premium_funnel_completed', 'pricing_viewed', 'plan_viewed', 'plans_viewed', 'plan_selected', 'checkout_started'));
