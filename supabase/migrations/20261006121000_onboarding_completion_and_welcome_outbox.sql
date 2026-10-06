alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz;

-- Durable, idempotent WhatsApp delivery for the administrative activation welcome.
-- This is deliberately separate from whatsapp_daily_deliveries so welcome traffic
-- never changes psychological daily-message metrics or uniqueness.
create table if not exists public.whatsapp_welcome_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  interaction_id uuid not null references public.interactions(id) on delete cascade,
  due_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','claimed','sent','failed')),
  attempt_count integer not null default 0,
  provider_message_id text,
  sent_at timestamptz,
  last_error text,
  locked_until timestamptz,
  claim_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists whatsapp_welcome_deliveries_user_once
  on public.whatsapp_welcome_deliveries(user_id);
create unique index if not exists whatsapp_welcome_deliveries_interaction_once
  on public.whatsapp_welcome_deliveries(interaction_id);
create index if not exists whatsapp_welcome_deliveries_due
  on public.whatsapp_welcome_deliveries(status, due_at, locked_until);

drop trigger if exists whatsapp_welcome_deliveries_touch on public.whatsapp_welcome_deliveries;
create trigger whatsapp_welcome_deliveries_touch
  before update on public.whatsapp_welcome_deliveries
  for each row execute function public.touch_updated_at();

alter table public.whatsapp_welcome_deliveries enable row level security;
revoke all on public.whatsapp_welcome_deliveries from anon, authenticated;
