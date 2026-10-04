-- Idempotent inbox for Evolution inbound messages. Server-side service role writes;
-- authenticated users can only read their own rows.
create table if not exists public.whatsapp_inbound_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  provider text not null,
  provider_message_id text not null,
  wa_id text not null,
  remote_jid text,
  text text,
  from_me boolean not null default false,
  status text not null default 'received' check (status in ('received','processing','completed','unresolved','failed','no_approved_intervention','ignored')),
  execution_run_id uuid references public.execution_runs(id) on delete set null,
  response_provider_message_id text,
  error_code text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists whatsapp_inbound_messages_provider_id
  on public.whatsapp_inbound_messages(provider, provider_message_id)
  where provider_message_id is not null;
create index if not exists whatsapp_inbound_messages_user_received
  on public.whatsapp_inbound_messages(user_id, received_at desc);
create index if not exists whatsapp_inbound_messages_execution
  on public.whatsapp_inbound_messages(execution_run_id);

alter table public.whatsapp_inbound_messages enable row level security;
drop policy if exists whatsapp_inbound_messages_select_own on public.whatsapp_inbound_messages;
create policy whatsapp_inbound_messages_select_own on public.whatsapp_inbound_messages
  for select to authenticated using ((select auth.uid()) = user_id);
