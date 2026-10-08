create table if not exists public.subscription_cancellation_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid null references public.subscriptions(id) on delete set null,
  provider text not null default 'hotmart',
  reason_code text not null check (reason_code in (
    'not_using_enough', 'not_enough_value', 'not_personalized_enough',
    'expected_something_different', 'technical_problems', 'price',
    'just_testing', 'no_longer_needed', 'other', 'prefer_not_to_say'
  )),
  reason_text text null check (reason_text is null or char_length(reason_text) <= 2000),
  improvement_text text null check (improvement_text is null or char_length(improvement_text) <= 2000),
  cancellation_attempt_id uuid not null,
  feedback_submitted_at timestamptz not null default now(),
  cancellation_requested_at timestamptz null,
  cancellation_confirmed_at timestamptz null,
  cancellation_failed_at timestamptz null,
  cancellation_error_code text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscription_cancellation_feedback_attempt_unique unique (user_id, cancellation_attempt_id)
);

create index if not exists subscription_cancellation_feedback_user_created
  on public.subscription_cancellation_feedback(user_id, created_at desc);

alter table public.subscription_cancellation_feedback enable row level security;

drop policy if exists subscription_cancellation_feedback_select_own on public.subscription_cancellation_feedback;
create policy subscription_cancellation_feedback_select_own
  on public.subscription_cancellation_feedback for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists subscription_cancellation_feedback_insert_own on public.subscription_cancellation_feedback;
create policy subscription_cancellation_feedback_insert_own
  on public.subscription_cancellation_feedback for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists subscription_cancellation_feedback_update_own on public.subscription_cancellation_feedback;
create policy subscription_cancellation_feedback_update_own
  on public.subscription_cancellation_feedback for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop trigger if exists subscription_cancellation_feedback_touch on public.subscription_cancellation_feedback;
create trigger subscription_cancellation_feedback_touch
  before update on public.subscription_cancellation_feedback
  for each row execute function public.touch_updated_at();
