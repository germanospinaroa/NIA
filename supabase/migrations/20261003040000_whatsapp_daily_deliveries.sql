create table if not exists public.whatsapp_daily_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  interaction_id uuid not null references public.interactions(id) on delete cascade,
  local_date date not null,
  slot text not null,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  provider_message_id text,
  attempt_count integer not null default 0,
  claim_token text,
  locked_until timestamptz,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists whatsapp_daily_deliveries_once on public.whatsapp_daily_deliveries(user_id, local_date, slot);
create index if not exists whatsapp_daily_deliveries_status on public.whatsapp_daily_deliveries(status, locked_until);
drop trigger if exists whatsapp_daily_deliveries_touch on public.whatsapp_daily_deliveries;
create trigger whatsapp_daily_deliveries_touch before update on public.whatsapp_daily_deliveries for each row execute function public.touch_updated_at();
alter table public.whatsapp_daily_deliveries enable row level security;
drop policy if exists whatsapp_daily_deliveries_select_own on public.whatsapp_daily_deliveries;
create policy whatsapp_daily_deliveries_select_own on public.whatsapp_daily_deliveries for select to authenticated using ((select auth.uid()) = user_id);
