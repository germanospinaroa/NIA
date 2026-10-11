-- Add the public emotional funnel without rewriting short_v1/short_v2 history.
alter table public.funnel_events drop constraint if exists funnel_events_funnel_version_check;
alter table public.funnel_events add constraint funnel_events_funnel_version_check check (funnel_version in ('short_v1', 'short_v2', 'emotional_v1'));

alter table public.funnel_events drop constraint if exists funnel_events_screen_key_check;
alter table public.funnel_events add constraint funnel_events_screen_key_check check (screen_key is null or screen_key in ('recognition', 'pattern', 'desire', 'personalize', 'demo', 'testimonials', 'plans', 'reframe', 'evidence', 'continuity'));
