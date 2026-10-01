-- NIA Cost Ledger: versioned provider pricing and immutable call cost snapshots.

create table if not exists public.provider_pricing (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  model text not null,
  operation_type text not null check (operation_type in ('generation', 'embedding', 'semantic_judge', 'llm_audit')),
  pricing_unit text not null default 'per_1m_tokens' check (pricing_unit = 'per_1m_tokens'),
  input_price_per_1m numeric(18,10) not null default 0,
  cached_input_price_per_1m numeric(18,10),
  cache_write_price_per_1m numeric(18,10),
  output_price_per_1m numeric(18,10),
  effective_from timestamptz not null,
  effective_to timestamptz,
  currency text not null default 'USD' check (length(currency) = 3),
  source text not null,
  source_reference text not null,
  created_at timestamptz not null default now(),
  check (effective_to is null or effective_to > effective_from),
  check (input_price_per_1m >= 0 and coalesce(cached_input_price_per_1m, 0) >= 0 and coalesce(cache_write_price_per_1m, 0) >= 0 and coalesce(output_price_per_1m, 0) >= 0)
);
create index if not exists provider_pricing_lookup on public.provider_pricing(provider, model, operation_type, effective_from desc);

create table if not exists public.provider_call_costs (
  id uuid primary key default gen_random_uuid(),
  provider_call_id uuid not null unique references public.execution_provider_calls(id) on delete cascade,
  pricing_id uuid references public.provider_pricing(id) on delete restrict,
  cost_status text not null check (cost_status in ('available', 'unavailable')),
  cost_reason text,
  input_cost numeric(18,10),
  cached_input_cost numeric(18,10),
  cache_write_cost numeric(18,10),
  output_cost numeric(18,10),
  total_cost numeric(18,10),
  currency text,
  calculated_at timestamptz not null default now(),
  check (cost_status = 'unavailable' or (total_cost is not null and total_cost >= 0)),
  check (cost_status = 'available' or total_cost is null)
);
create index if not exists provider_call_costs_pricing_idx on public.provider_call_costs(pricing_id);
create index if not exists provider_call_costs_status_idx on public.provider_call_costs(cost_status, calculated_at desc);

alter table public.provider_pricing enable row level security;
alter table public.provider_call_costs enable row level security;

-- These tables are server-side operational data. No authenticated user policy is intentional.

insert into public.provider_pricing (provider, model, operation_type, input_price_per_1m, output_price_per_1m, effective_from, currency, source, source_reference)
select 'openai', 'gpt-6-luna', operation_type, 0.10, 0.50, '2026-10-01T00:00:00Z', 'USD', 'NIA Phase 4E pricing brief', 'User-provided pricing, effective 2026-10-01'
from (values ('generation'), ('semantic_judge'), ('llm_audit')) as operations(operation_type)
where not exists (
  select 1 from public.provider_pricing pricing
  where pricing.provider = 'openai' and pricing.model = 'gpt-6-luna' and pricing.operation_type = operations.operation_type and pricing.effective_from = '2026-10-01T00:00:00Z'
);

insert into public.provider_pricing (provider, model, operation_type, input_price_per_1m, output_price_per_1m, effective_from, currency, source, source_reference)
select 'openai', 'text-embedding-3-small', 'embedding', 0.02, 0, '2026-10-01T00:00:00Z', 'USD', 'NIA Phase 4E pricing brief', 'User-provided pricing, effective 2026-10-01'
where not exists (
  select 1 from public.provider_pricing pricing
  where pricing.provider = 'openai' and pricing.model = 'text-embedding-3-small' and pricing.operation_type = 'embedding' and pricing.effective_from = '2026-10-01T00:00:00Z'
);
