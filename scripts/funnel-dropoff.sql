-- Read-only report for the active public funnel version.
-- Use DISTINCT session_id + screen_key so reloads and revisits do not inflate reach.
with reached as (
  select distinct session_id, screen_key, screen_index
  from public.funnel_events
  where funnel_version = 'short_v2'
    and event_name = 'discover_screen_viewed'
  union
  select distinct session_id, 'plans', 7
  from public.funnel_events
  where funnel_version = 'short_v2'
    and event_name in ('plans_viewed', 'pricing_viewed')
), stages as (
  select * from (values
    (1, 'recognition'),
    (2, 'reframe'),
    (3, 'evidence'),
    (4, 'personalize'),
    (5, 'demo'),
    (6, 'testimonials'),
    (7, 'plans')
  ) as s(stage_index, stage_key)
)
select
  stages.stage_index,
  stages.stage_key,
  count(distinct reached.session_id) as sessions,
  round(
    100.0 * count(distinct reached.session_id)
    / nullif(max(count(distinct reached.session_id)) over (), 0),
    1
  ) as percent_of_reached_sessions
from stages
left join reached
  on reached.screen_index = stages.stage_index
group by stages.stage_index, stages.stage_key
order by stages.stage_index;
