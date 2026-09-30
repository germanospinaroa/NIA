create extension if not exists pgcrypto;

create table if not exists public.onboarding_drafts (
  id uuid primary key default gen_random_uuid(), first_name text not null, email text not null,
  direction_key text, direction_text text, voice_style text, message_frequency smallint default 0 check (message_frequency between 0 and 2),
  message_time_1 text, message_time_2 text, timezone text, whatsapp_enabled boolean not null default false,
  whatsapp_phone text, first_feedback text, status text not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade, first_name text not null, direction_key text, direction_text text,
  voice_style text, message_frequency smallint not null default 0 check (message_frequency between 0 and 2), message_time_1 text,
  message_time_2 text, timezone text, whatsapp_enabled boolean not null default false, whatsapp_phone text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  interaction_type text not null check (interaction_type in ('daily_message','nia_point')), context_key text, direction_key text,
  content text not null, feedback_type text, local_date date, created_at timestamptz not null default now()
);
create unique index if not exists interactions_daily_once on public.interactions(user_id, local_date) where interaction_type = 'daily_message' and local_date is not null;
create index if not exists interactions_user_created on public.interactions(user_id, created_at desc);
create table if not exists public.evidence_entries (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  direction_key text, evidence_key text, evidence_text text not null, created_at timestamptz not null default now()
);
create index if not exists evidence_user_created on public.evidence_entries(user_id, created_at desc);
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null, provider_customer_id text, provider_subscription_id text, plan_key text, status text not null,
  current_period_end timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists profiles_touch on public.profiles; create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
drop trigger if exists drafts_touch on public.onboarding_drafts; create trigger drafts_touch before update on public.onboarding_drafts for each row execute function public.touch_updated_at();
drop trigger if exists subscriptions_touch on public.subscriptions; create trigger subscriptions_touch before update on public.subscriptions for each row execute function public.touch_updated_at();

alter table public.onboarding_drafts enable row level security;
alter table public.profiles enable row level security;
alter table public.interactions enable row level security;
alter table public.evidence_entries enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists profiles_select_own on public.profiles; create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists profiles_update_own on public.profiles; create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists profiles_insert_own on public.profiles; create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists interactions_select_own on public.interactions; create policy interactions_select_own on public.interactions for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists interactions_insert_own on public.interactions; create policy interactions_insert_own on public.interactions for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists evidence_select_own on public.evidence_entries; create policy evidence_select_own on public.evidence_entries for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists evidence_insert_own on public.evidence_entries; create policy evidence_insert_own on public.evidence_entries for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists evidence_delete_own on public.evidence_entries; create policy evidence_delete_own on public.evidence_entries for delete to authenticated using ((select auth.uid()) = user_id);
drop policy if exists subscriptions_select_own on public.subscriptions; create policy subscriptions_select_own on public.subscriptions for select to authenticated using ((select auth.uid()) = user_id);
