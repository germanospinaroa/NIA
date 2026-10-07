alter table public.profiles
  alter column first_name drop not null,
  add column if not exists last_name text,
  add column if not exists preferred_name text;
