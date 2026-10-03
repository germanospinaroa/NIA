-- Scheduler for the protected NIA daily WhatsApp endpoint.
-- The secret is intentionally not stored in this migration. Before applying:
--   select vault.create_secret('<CRON_SECRET>', 'nia-cron-secret');
-- Run that statement only in the Supabase SQL editor or another secure channel.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

create or replace function public.nia_daily_whatsapp_cron()
returns void
language plpgsql
security definer
set search_path = public, extensions, vault, pg_catalog
as $$
declare
  cron_secret text;
begin
  select decrypted_secret
    into cron_secret
    from vault.decrypted_secrets
   where name = 'nia-cron-secret'
   limit 1;

  if cron_secret is null or length(cron_secret) = 0 then
    raise exception 'nia-cron-secret is not configured in Supabase Vault';
  end if;

  perform net.http_get(
    url := 'https://nia.gritlab.pro/api/cron/daily-whatsapp',
    params := '{}'::jsonb,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || cron_secret,
      'Content-Type', 'application/json'
    ),
    timeout_milliseconds := 5000
  );
end;
$$;

revoke all on function public.nia_daily_whatsapp_cron() from public;
grant execute on function public.nia_daily_whatsapp_cron() to postgres;

do $$
declare
  existing_job record;
  has_secret boolean;
begin
  select exists(
    select 1 from vault.decrypted_secrets where name = 'nia-cron-secret'
  ) into has_secret;

  if not has_secret then
    raise exception 'Configure Vault secret nia-cron-secret before enabling the NIA scheduler';
  end if;

  for existing_job in select jobid from cron.job where jobname = 'nia-daily-whatsapp' loop
    perform cron.unschedule(existing_job.jobid);
  end loop;

  perform cron.schedule(
    'nia-daily-whatsapp',
    '*/15 * * * *',
    $job$select public.nia_daily_whatsapp_cron();$job$
  );
end;
$$;
