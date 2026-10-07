create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  message text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists support_requests_user_created on public.support_requests(user_id, created_at desc);
alter table public.support_requests enable row level security;
revoke all on public.support_requests from anon, authenticated;
drop policy if exists support_requests_select_own on public.support_requests;
create policy support_requests_select_own on public.support_requests for select to authenticated using ((select auth.uid()) = user_id);
