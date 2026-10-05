create table if not exists public.approved_intervention_buffer (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  intended_local_date date not null,
  plan jsonb not null,
  message text not null,
  status text not null check (status in ('approved', 'buffered', 'consumed', 'invalidated')),
  normalized_message_hash text not null,
  intervention_signature text not null,
  context_version text not null,
  created_at timestamptz not null default now(),
  consumed_at timestamptz,
  invalidated_at timestamptz,
  unique (user_id, intended_local_date),
  unique (user_id, normalized_message_hash),
  unique (user_id, intervention_signature)
);

create index if not exists approved_intervention_buffer_due_idx
  on public.approved_intervention_buffer(user_id, intended_local_date, status);

alter table public.approved_intervention_buffer enable row level security;

drop policy if exists approved_intervention_buffer_owner_read on public.approved_intervention_buffer;
create policy approved_intervention_buffer_owner_read on public.approved_intervention_buffer
  for select to authenticated using (auth.uid() = user_id);

alter table public.interventions add column if not exists normalized_message_hash text;
create unique index if not exists interventions_user_message_hash_once
  on public.interventions(user_id, normalized_message_hash)
  where normalized_message_hash is not null;
