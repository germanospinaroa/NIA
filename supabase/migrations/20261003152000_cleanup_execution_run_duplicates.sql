-- Controlled cleanup of seven previously verified failed execution-run duplicates.
-- This migration is intentionally explicit and aborts before any DELETE if the
-- live rows no longer match the approved cleanup scope.

do $$
declare
  target_count integer;
  deleted_count integer;
begin
  if exists (
    with expected(id, user_id, idempotency_key) as (
      values
        ('dd31664f-7441-4026-9b8a-2e9321a25c0b'::uuid, '6f97c383-4882-4b52-a362-183641ed505e'::uuid, 'daily:2026-10-01'),
        ('d4a864a4-114d-471b-978c-3c512263cef0'::uuid, '6f97c383-4882-4b52-a362-183641ed505e'::uuid, 'daily:2026-10-01'),
        ('2e6b89b7-f0f8-4700-bb58-9eafe716c1fb'::uuid, '6f97c383-4882-4b52-a362-183641ed505e'::uuid, 'daily:2026-10-01'),
        ('dcc270d9-dc80-48b2-b122-10beefb38475'::uuid, '6f97c383-4882-4b52-a362-183641ed505e'::uuid, 'daily:2026-10-01'),
        ('6e5a6d34-b1f3-4ae4-9fa3-a62c48555d3e'::uuid, '6f97c383-4882-4b52-a362-183641ed505e'::uuid, 'daily:2026-10-01'),
        ('d1884811-1695-4b70-9a31-f66572b736b6'::uuid, '6f97c383-4882-4b52-a362-183641ed505e'::uuid, 'daily:2026-10-01'),
        ('04918106-a007-438b-9884-53679ce52925'::uuid, '6f97c383-4882-4b52-a362-183641ed505e'::uuid, 'daily:2026-10-02')
    )
    select 1
    from expected e
    left join public.execution_runs r on r.id = e.id
    where r.id is null
       or r.user_id is distinct from e.user_id
       or r.idempotency_key is distinct from e.idempotency_key
  ) then
    raise exception 'execution_run_cleanup_precondition_identity_failed';
  end if;

  select count(*) into target_count
  from public.execution_runs
  where id in (
    'dd31664f-7441-4026-9b8a-2e9321a25c0b'::uuid,
    'd4a864a4-114d-471b-978c-3c512263cef0'::uuid,
    '2e6b89b7-f0f8-4700-bb58-9eafe716c1fb'::uuid,
    'dcc270d9-dc80-48b2-b122-10beefb38475'::uuid,
    '6e5a6d34-b1f3-4ae4-9fa3-a62c48555d3e'::uuid,
    'd1884811-1695-4b70-9a31-f66572b736b6'::uuid,
    '04918106-a007-438b-9884-53679ce52925'::uuid
  )
  and (
    status is distinct from 'failed'
    or intervention_id is not null
    or candidate_count is distinct from 0
    or retry_count is distinct from 0
  );

  if target_count <> 0 then
    raise exception 'execution_run_cleanup_precondition_state_failed';
  end if;

  if exists (
    select 1
    from public.generation_attempts
    where execution_run_id in (
      'dd31664f-7441-4026-9b8a-2e9321a25c0b'::uuid,
      'd4a864a4-114d-471b-978c-3c512263cef0'::uuid,
      '2e6b89b7-f0f8-4700-bb58-9eafe716c1fb'::uuid,
      'dcc270d9-dc80-48b2-b122-10beefb38475'::uuid,
      '6e5a6d34-b1f3-4ae4-9fa3-a62c48555d3e'::uuid,
      'd1884811-1695-4b70-9a31-f66572b736b6'::uuid,
      '04918106-a007-438b-9884-53679ce52925'::uuid
    )
  ) then
    raise exception 'execution_run_cleanup_precondition_generation_attempt_failed';
  end if;

  if exists (
    select 1
    from public.execution_provider_calls
    where execution_run_id in (
      'dd31664f-7441-4026-9b8a-2e9321a25c0b'::uuid,
      'd4a864a4-114d-471b-978c-3c512263cef0'::uuid,
      '2e6b89b7-f0f8-4700-bb58-9eafe716c1fb'::uuid,
      'dcc270d9-dc80-48b2-b122-10beefb38475'::uuid,
      '6e5a6d34-b1f3-4ae4-9fa3-a62c48555d3e'::uuid,
      'd1884811-1695-4b70-9a31-f66572b736b6'::uuid,
      '04918106-a007-438b-9884-53679ce52925'::uuid
    )
  ) then
    raise exception 'execution_run_cleanup_precondition_provider_call_failed';
  end if;

  -- execution_runs has no direct delivery foreign key. The verified
  -- intervention_id IS NULL state guarantees these runs cannot own an
  -- interaction-backed delivery; the delivery association is indirect.
  delete from public.execution_runs
  where id in (
    'dd31664f-7441-4026-9b8a-2e9321a25c0b'::uuid,
    'd4a864a4-114d-471b-978c-3c512263cef0'::uuid,
    '2e6b89b7-f0f8-4700-bb58-9eafe716c1fb'::uuid,
    'dcc270d9-dc80-48b2-b122-10beefb38475'::uuid,
    '6e5a6d34-b1f3-4ae4-9fa3-a62c48555d3e'::uuid,
    'd1884811-1695-4b70-9a31-f66572b736b6'::uuid,
    '04918106-a007-438b-9884-53679ce52925'::uuid
  );
  get diagnostics deleted_count = row_count;

  if deleted_count <> 7 then
    raise exception 'execution_run_cleanup_deleted_unexpected_count: %', deleted_count;
  end if;

  create unique index if not exists execution_runs_user_idempotency_key
    on public.execution_runs(user_id, idempotency_key)
    where idempotency_key is not null;
end;
$$;
