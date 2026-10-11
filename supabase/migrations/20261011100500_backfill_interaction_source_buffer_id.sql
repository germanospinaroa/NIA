-- Deterministic data backfill, separate from the schema expansion.
-- Only one consumed buffer and one production daily interaction for the same
-- user/date are eligible. No body-text or fuzzy matching is used.
with candidates as (
  select i.id as interaction_id, b.id as buffer_id,
         count(*) over (partition by i.id) as candidate_count
  from public.interactions i
  join public.approved_intervention_buffer b
    on b.user_id = i.user_id
   and b.intended_local_date = i.local_date
   and b.status = 'consumed'
  where i.interaction_type = 'daily_message'
    and i.source_buffer_id is null
), unique_candidates as (
  select distinct interaction_id, buffer_id
  from candidates
  where candidate_count = 1
)
update public.interactions i
set source_buffer_id = c.buffer_id
from unique_candidates c
where i.id = c.interaction_id
  and i.source_buffer_id is null;
