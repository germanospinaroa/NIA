-- The slot-based daily interaction index allowed legacy schedules to create
-- two psychological interventions for one user and local date. Historical
-- duplicates are preserved; this cutoff protects only rows created after the
-- delivery invariant was introduced.
-- nia_welcome rows are intentionally excluded by interaction_type.
create unique index if not exists interactions_daily_one_per_day_after_cutoff
  on public.interactions(user_id, local_date)
  where interaction_type = 'daily_message'
    and local_date is not null
    and created_at >= timestamptz '2026-10-05 20:00:00+00';

-- A second legacy schedule slot must not create a second psychological
-- WhatsApp delivery after the same cutoff. Welcome and inbound slots remain
-- distinct lifecycle messages and are intentionally excluded.
create unique index if not exists whatsapp_daily_psychological_one_per_day_after_cutoff
  on public.whatsapp_daily_deliveries(user_id, local_date)
  where slot in ('1', '2')
    and created_at >= timestamptz '2026-10-05 20:00:00+00';
