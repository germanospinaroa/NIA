-- A daily WhatsApp schedule can contain two distinct interventions.
-- Keep historical web/onboarding rows with slot NULL, while new scheduled
-- deliveries are unique by user + local date + slot.
alter table public.interactions
  add column if not exists slot text;

drop index if exists public.interactions_daily_once;

create unique index if not exists interactions_daily_slot_once
  on public.interactions(user_id, local_date, slot)
  where interaction_type = 'daily_message'
    and local_date is not null
    and slot is not null;

create index if not exists interactions_daily_user_date_slot
  on public.interactions(user_id, local_date, slot);
