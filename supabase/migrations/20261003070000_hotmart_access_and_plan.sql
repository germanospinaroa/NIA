-- Hotmart access lifecycle and account activation state.
alter table public.profiles
  add column if not exists account_status text not null default 'active',
  add column if not exists must_set_password boolean not null default false,
  add column if not exists first_activated_at timestamptz;

create table if not exists public.hotmart_entitlements (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'hotmart',
  provider_entitlement_id text not null,
  buyer_email text not null,
  first_name text,
  user_id uuid references auth.users(id) on delete set null,
  plan_key text,
  plan_name text,
  status text not null default 'pending_activation',
  activation_sent_at timestamptz,
  activated_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists hotmart_entitlements_provider_id
  on public.hotmart_entitlements(provider, provider_entitlement_id);
create index if not exists hotmart_entitlements_email on public.hotmart_entitlements(lower(buyer_email));

create table if not exists public.hotmart_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  status text not null default 'received',
  error text,
  payload jsonb not null default '{}'::jsonb
);

alter table public.subscriptions
  add column if not exists provider_product_id text,
  add column if not exists provider_product_name text,
  add column if not exists provider_plan_id text,
  add column if not exists plan_name text,
  add column if not exists trial boolean,
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists current_period_start timestamptz,
  add column if not exists next_billing_at timestamptz,
  add column if not exists canceled_at timestamptz,
  add column if not exists cancel_requested_at timestamptz,
  add column if not exists access_until timestamptz,
  add column if not exists subscriber_code text,
  add column if not exists purchase_transaction text,
  add column if not exists purchase_status text,
  add column if not exists currency text,
  add column if not exists amount numeric;
create unique index if not exists subscriptions_provider_subscription_once
  on public.subscriptions(provider, provider_subscription_id)
  where provider_subscription_id is not null;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists hotmart_entitlements_touch on public.hotmart_entitlements;
create trigger hotmart_entitlements_touch before update on public.hotmart_entitlements for each row execute function public.touch_updated_at();

alter table public.hotmart_entitlements enable row level security;
alter table public.hotmart_webhook_events enable row level security;
drop policy if exists hotmart_entitlements_select_own on public.hotmart_entitlements;
create policy hotmart_entitlements_select_own on public.hotmart_entitlements for select to authenticated using ((select auth.uid()) = user_id);
