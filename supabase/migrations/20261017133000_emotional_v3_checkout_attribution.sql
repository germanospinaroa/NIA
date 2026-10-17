-- Opaque, non-PII bridge between an emotional_v3 checkout and the Hotmart webhook.
create table if not exists public.funnel_checkout_attempts (
  id uuid primary key default gen_random_uuid(),
  correlation_id uuid not null unique,
  session_id uuid not null,
  funnel_version text not null check (funnel_version = 'emotional_v3'),
  plan text not null check (plan in ('monthly', 'annual')),
  offer_code text not null check (offer_code in ('r7w7emsp', '3z4a0vad')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  provider_transaction text,
  provider_event_id text
);

create index if not exists funnel_checkout_attempts_session_created
  on public.funnel_checkout_attempts(session_id, created_at desc);
create unique index if not exists funnel_checkout_attempts_transaction_once
  on public.funnel_checkout_attempts(provider_transaction)
  where provider_transaction is not null;
create unique index if not exists funnel_checkout_attempts_event_once
  on public.funnel_checkout_attempts(provider_event_id)
  where provider_event_id is not null;

alter table public.funnel_checkout_attempts enable row level security;
revoke all on public.funnel_checkout_attempts from anon, authenticated;

-- The webhook calls this function through the service-role client. The row lock
-- makes PURCHASE_APPROVED + PURCHASE_COMPLETE produce one funnel event.
create or replace function public.confirm_funnel_v3_purchase(
  p_correlation_id uuid,
  p_plan text,
  p_offer_code text,
  p_provider_transaction text,
  p_provider_event_id text,
  p_confirmed_at timestamptz default now()
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  attempt public.funnel_checkout_attempts%rowtype;
begin
  select * into attempt
  from public.funnel_checkout_attempts
  where correlation_id = p_correlation_id
  for update;

  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;
  if attempt.funnel_version <> 'emotional_v3' or attempt.plan <> p_plan or attempt.offer_code <> p_offer_code then
    return jsonb_build_object('status', 'mismatch');
  end if;
  if attempt.confirmed_at is not null then
    return jsonb_build_object('status', 'already_confirmed', 'session_id', attempt.session_id);
  end if;

  update public.funnel_checkout_attempts
  set confirmed_at = coalesce(p_confirmed_at, now()),
      provider_transaction = p_provider_transaction,
      provider_event_id = p_provider_event_id
  where id = attempt.id;

  insert into public.funnel_events (session_id, event_name, funnel_version, screen_index, screen_key, pathname)
  values (attempt.session_id, 'purchase_confirmed', 'emotional_v3', 7, 'plans', '/descubre/v3/planes');

  return jsonb_build_object('status', 'confirmed', 'session_id', attempt.session_id);
end;
$$;

revoke all on function public.confirm_funnel_v3_purchase(uuid, text, text, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.confirm_funnel_v3_purchase(uuid, text, text, text, text, timestamptz) to service_role;
