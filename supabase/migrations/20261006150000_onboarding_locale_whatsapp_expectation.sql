alter table public.profiles
  add column if not exists country_code text;

alter table public.profiles
  drop constraint if exists profiles_country_code_iso_check;

alter table public.profiles
  add constraint profiles_country_code_iso_check
  check (country_code is null or country_code ~ '^[A-Z]{2}$');

alter table public.whatsapp_link_tokens
  add column if not exists expected_phone text;
