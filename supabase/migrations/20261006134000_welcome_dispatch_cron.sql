-- Durable scheduler for the activation welcome only.
-- The bearer value is intentionally stored only in Supabase Vault under
-- nia_welcome_cron_secret and is read at execution time.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

do $$
begin
  if to_regnamespace('cron') is null then
    raise exception 'pg_cron is not available';
  end if;
  if to_regnamespace('net') is null then
    raise exception 'pg_net is not available';
  end if;
end;
$$;

create or replace function public.nia_welcome_dispatch_cron()
returns void
language plpgsql
security definer
set search_path = public, extensions, vault, pg_catalog
as $$
declare
  welcome_cron_secret text;
begin
  select decrypted_secret
    into welcome_cron_secret
    from vault.decrypted_secrets
   where name = 'nia_welcome_cron_secret'
   limit 1;

  if welcome_cron_secret is null or length(welcome_cron_secret) = 0 then
    raise exception 'nia_welcome_cron_secret is not configured in Supabase Vault';
  end if;

  perform net.http_get(
    url := 'https://nia.gritlab.pro/api/cron/welcome',
    params := '{}'::jsonb,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || welcome_cron_secret,
      'Content-Type', 'application/json'
    ),
    timeout_milliseconds := 10000
  );
end;
$$;

revoke all on function public.nia_welcome_dispatch_cron() from public;
grant execute on function public.nia_welcome_dispatch_cron() to postgres;

do $$
declare
  existing_job record;
  has_secret boolean;
begin
  select exists(
    select 1
      from vault.decrypted_secrets
     where name = 'nia_welcome_cron_secret'
  ) into has_secret;

  if not has_secret then
    raise exception 'Configure Vault secret nia_welcome_cron_secret before enabling the welcome scheduler';
  end if;

  for existing_job in select jobid from cron.job where jobname = 'nia-welcome-dispatch' loop
    perform cron.unschedule(existing_job.jobid);
  end loop;

  perform cron.schedule(
    'nia-welcome-dispatch',
    '* * * * *',
    $job$select public.nia_welcome_dispatch_cron();$job$
  );
end;
$$;
