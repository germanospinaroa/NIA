-- WhatsApp connection lifecycle. The provider remains optional: without its
-- credentials the product must show an honest unavailable state.
create table if not exists public.whatsapp_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'meta',
  wa_id text,
  phone_number text,
  status text not null default 'connected' check (status in ('connected','disconnected')),
  connected_at timestamptz,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists whatsapp_connections_user_provider on public.whatsapp_connections(user_id, provider);
create unique index if not exists whatsapp_connections_provider_wa_id on public.whatsapp_connections(provider, wa_id) where status = 'connected' and wa_id is not null;
create index if not exists whatsapp_connections_user_status on public.whatsapp_connections(user_id, status);

create table if not exists public.whatsapp_link_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  status text not null default 'pending' check (status in ('pending','used','rejected')),
  expires_at timestamptz not null,
  used_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);
create index if not exists whatsapp_link_tokens_user_created on public.whatsapp_link_tokens(user_id, created_at desc);
create index if not exists whatsapp_link_tokens_pending_lookup on public.whatsapp_link_tokens(token_hash, status, expires_at);

drop trigger if exists whatsapp_connections_touch on public.whatsapp_connections;
create trigger whatsapp_connections_touch before update on public.whatsapp_connections for each row execute function public.touch_updated_at();

alter table public.whatsapp_connections enable row level security;
alter table public.whatsapp_link_tokens enable row level security;
drop policy if exists whatsapp_connections_select_own on public.whatsapp_connections;
create policy whatsapp_connections_select_own on public.whatsapp_connections for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists whatsapp_connections_update_own on public.whatsapp_connections;
create policy whatsapp_connections_update_own on public.whatsapp_connections for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists whatsapp_link_tokens_select_own on public.whatsapp_link_tokens;
create policy whatsapp_link_tokens_select_own on public.whatsapp_link_tokens for select to authenticated using ((select auth.uid()) = user_id);
