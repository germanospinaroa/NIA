-- Make execution-run idempotency atomic without changing the UUID request_id contract.
create unique index if not exists execution_runs_user_idempotency_key
  on public.execution_runs(user_id, idempotency_key)
  where idempotency_key is not null;
