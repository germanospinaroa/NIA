-- Additive provider usage fields for prompt/input cache accounting.
alter table public.execution_provider_calls
  add column if not exists cached_input_tokens integer,
  add column if not exists cache_write_tokens integer;

alter table public.execution_provider_calls
  drop constraint if exists execution_provider_calls_cache_tokens_nonnegative;

alter table public.execution_provider_calls
  add constraint execution_provider_calls_cache_tokens_nonnegative
  check (coalesce(cached_input_tokens, 0) >= 0 and coalesce(cache_write_tokens, 0) >= 0);

create index if not exists execution_provider_calls_cache_usage
  on public.execution_provider_calls(cached_input_tokens, cache_write_tokens)
  where cached_input_tokens is not null or cache_write_tokens is not null;
