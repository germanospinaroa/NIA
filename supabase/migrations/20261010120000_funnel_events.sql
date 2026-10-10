create table if not exists public.funnel_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  event_name text not null check (event_name in ('discover_started', 'premium_funnel_started', 'discover_screen_viewed', 'discover_screen_completed', 'premium_funnel_completed', 'pricing_viewed', 'plan_viewed', 'plans_viewed', 'plan_selected')),
  funnel_version text not null check (funnel_version = 'short_v1'),
  screen_index integer null check (screen_index is null or screen_index between 1 and 6),
  screen_key text null check (screen_key is null or screen_key in ('recognition', 'reframe', 'evidence', 'personalize', 'demo', 'continuity')),
  pathname text not null default '/',
  referrer text null,
  utm_source text null,
  utm_medium text null,
  utm_campaign text null,
  created_at timestamptz not null default now()
);

create index if not exists funnel_events_session_created on public.funnel_events(session_id, created_at);
create index if not exists funnel_events_name_created on public.funnel_events(event_name, created_at);
alter table public.funnel_events enable row level security;
revoke all on public.funnel_events from anon, authenticated;
