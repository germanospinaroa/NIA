alter table public.funnel_events drop constraint if exists funnel_events_funnel_version_check;
alter table public.funnel_events add constraint funnel_events_funnel_version_check
  check (funnel_version in ('short_v1', 'short_v2', 'emotional_v1', 'emotional_v2', 'emotional_v3'));

alter table public.funnel_events drop constraint if exists funnel_events_event_name_check;
alter table public.funnel_events add constraint funnel_events_event_name_check
  check (event_name in ('discover_started', 'premium_funnel_started', 'discover_screen_viewed', 'discover_screen_completed', 'premium_funnel_completed', 'pricing_viewed', 'plan_viewed', 'plans_viewed', 'plan_selected', 'checkout_started', 'funnel_started', 'recognition_viewed', 'recognition_completed', 'pattern_viewed', 'pattern_completed', 'desire_viewed', 'desire_completed', 'personalize_viewed', 'personalize_completed', 'demo_viewed', 'demo_completed', 'trust_viewed', 'trust_completed', 'purchase_confirmed'));

alter table public.funnel_events drop constraint if exists funnel_events_screen_key_check;
alter table public.funnel_events add constraint funnel_events_screen_key_check
  check (screen_key is null or screen_key in ('recognition', 'pattern', 'desire', 'personalize', 'demo', 'trust', 'testimonials', 'plans', 'reframe', 'evidence', 'continuity'));

alter table public.funnel_events drop constraint if exists funnel_events_screen_index_check;
alter table public.funnel_events add constraint funnel_events_screen_index_check
  check (screen_index is null or screen_index between 1 and 7);
