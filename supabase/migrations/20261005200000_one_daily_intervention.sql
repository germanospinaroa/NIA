-- Preserve legacy daily-message duplicates while enforcing one future
-- psychological daily interaction per user and local date.
--
-- The nullable phase is intentional: every row that already exists is marked
-- historical before the default is changed. New inserts then inherit true
-- without requiring application code to know about this migration.
alter table public.interactions
  add column if not exists daily_unique_enforced boolean;

update public.interactions
   set daily_unique_enforced = false
 where daily_unique_enforced is null;

alter table public.interactions
  alter column daily_unique_enforced set default true,
  alter column daily_unique_enforced set not null;

drop index if exists public.interactions_daily_one_per_day_after_cutoff;

create unique index if not exists interactions_daily_one_per_day_enforced
  on public.interactions(user_id, local_date)
  where interaction_type = 'daily_message'
    and local_date is not null
    and daily_unique_enforced = true;

-- One interaction may be delivered at most once. This is compatible with
-- nia_welcome because welcome has its own interaction_type and is allowed one
-- delivery record through this same interaction-level invariant.
create unique index if not exists whatsapp_daily_deliveries_interaction_once
  on public.whatsapp_daily_deliveries(interaction_id);

-- Keep the historical slot-based transport index. It remains useful for
-- legacy rows and is intentionally not removed or rewritten here.
