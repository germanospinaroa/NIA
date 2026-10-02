-- NIA cleanup: remove accidental Elite Focus schema contamination.
drop function if exists public.handle_new_user();
drop function if exists public.is_admin();
drop function if exists public.set_journey_state(text, jsonb);

drop table if exists public.user_roles;
drop type if exists public.user_role;

drop policy if exists "users read created profiles" on public.profiles;

drop index if exists public.profiles_username_uidx;
drop index if exists public.profiles_zilis_id_uidx;

alter table public.profiles
  drop constraint if exists profiles_advisor_id_fkey,
  drop constraint if exists profiles_created_by_user_id_fkey,
  drop constraint if exists profiles_sponsor_id_fkey,
  drop constraint if exists profiles_experience_type_check,
  drop constraint if exists profiles_platform_role_check;

alter table public.profiles
  drop column if exists email,
  drop column if exists full_name,
  drop column if exists last_name,
  drop column if exists onboarding_completed,
  drop column if exists onboarding_complete,
  drop column if exists onboarding_data,
  drop column if exists country,
  drop column if exists market,
  drop column if exists preferred_channel,
  drop column if exists experience_level,
  drop column if exists weekly_time,
  drop column if exists starting_preference,
  drop column if exists primary_goal,
  drop column if exists current_stage,
  drop column if exists username,
  drop column if exists zilis_id,
  drop column if exists experience_type,
  drop column if exists platform_role,
  drop column if exists leadership_enabled,
  drop column if exists must_change_password,
  drop column if exists created_by_user_id,
  drop column if exists sponsor_id,
  drop column if exists advisor_id,
  drop column if exists phone;

comment on table public.profiles is null;

drop extension if exists "uuid-ossp";
