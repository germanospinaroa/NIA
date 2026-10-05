-- Invalidated buffer rows are retained for audit, but they were never
-- delivered and must not reserve a future date, message hash, or signature.
-- Approved, buffered, and consumed rows remain protected: consumed rows have
-- already been materialized for that local day and must not be replaced by a
-- second candidate after a transport retry/failure.

alter table public.approved_intervention_buffer
  drop constraint if exists approved_intervention_buffer_user_id_intended_local_date_key,
  drop constraint if exists approved_intervention_buffer_user_id_intervention_signature_key,
  drop constraint if exists approved_intervention_buffer_user_id_normalized_message_has_key;

create unique index if not exists approved_intervention_buffer_active_user_date_key
  on public.approved_intervention_buffer(user_id, intended_local_date)
  where status <> 'invalidated';

create unique index if not exists approved_intervention_buffer_active_signature_key
  on public.approved_intervention_buffer(user_id, intervention_signature)
  where status <> 'invalidated';

create unique index if not exists approved_intervention_buffer_active_message_hash_key
  on public.approved_intervention_buffer(user_id, normalized_message_hash)
  where status <> 'invalidated';
