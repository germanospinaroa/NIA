-- Feedback updates the legacy interaction row before writing the detailed
-- intervention_feedback and learning_signals records. Keep the update scoped
-- to the authenticated owner and protect both sides of the row transition.
alter table public.interactions enable row level security;
drop policy if exists interactions_update_own on public.interactions;
create policy interactions_update_own
  on public.interactions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
