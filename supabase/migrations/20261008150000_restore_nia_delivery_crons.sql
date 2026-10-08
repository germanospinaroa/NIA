-- Restore the production delivery and refill schedulers without changing the
-- already executed welcome scheduler migration.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

do $$
begin
  if to_regnamespace('cron') is null then raise exception 'pg_cron is not available'; end if;
  if to_regnamespace('net') is null then raise exception 'pg_net is not available'; end if;
  if to_regnamespace('vault') is null then raise exception 'Supabase Vault is not available'; end if;
  if not exists (select 1 from vault.decrypted_secrets where name = 'nia-cron-secret') then
    raise exception 'Configure Vault secret nia-cron-secret before enabling delivery schedulers';
  end if;
end;
$$;

create or replace function public.nia_daily_whatsapp_cron()
returns void
language plpgsql
security definer
set search_path = public, extensions, vault, pg_catalog
as $$
declare cron_secret text;
begin
  select decrypted_secret into cron_secret from vault.decrypted_secrets where name = 'nia-cron-secret' limit 1;
  if cron_secret is null or length(cron_secret) = 0 then raise exception 'nia-cron-secret is not configured in Supabase Vault'; end if;
  perform net.http_get(
    url := 'https://nia.gritlab.pro/api/cron/daily-whatsapp',
    params := '{}'::jsonb,
    headers := jsonb_build_object('Authorization', 'Bearer ' || cron_secret, 'Content-Type', 'application/json'),
    timeout_milliseconds := 55000
  );
end;
$$;

create or replace function public.nia_buffer_refill_cron()
returns void
language plpgsql
security definer
set search_path = public, extensions, vault, pg_catalog
as $$
declare cron_secret text;
begin
  select decrypted_secret into cron_secret from vault.decrypted_secrets where name = 'nia-cron-secret' limit 1;
  if cron_secret is null or length(cron_secret) = 0 then raise exception 'nia-cron-secret is not configured in Supabase Vault'; end if;
  perform net.http_get(
    url := 'https://nia.gritlab.pro/api/cron/refill-buffer',
    params := '{}'::jsonb,
    headers := jsonb_build_object('Authorization', 'Bearer ' || cron_secret, 'Content-Type', 'application/json'),
    timeout_milliseconds := 55000
  );
end;
$$;

revoke all on function public.nia_daily_whatsapp_cron() from public;
revoke all on function public.nia_buffer_refill_cron() from public;
grant execute on function public.nia_daily_whatsapp_cron() to postgres;
grant execute on function public.nia_buffer_refill_cron() to postgres;

do $$
declare existing_job record;
begin
  if not exists (select 1 from cron.job where jobname = 'nia-welcome-dispatch') then
    raise exception 'Existing nia-welcome-dispatch job is missing';
  end if;
  for existing_job in select jobid from cron.job where jobname in ('nia-daily-whatsapp', 'nia-buffer-refill') loop
    perform cron.unschedule(existing_job.jobid);
  end loop;
  perform cron.schedule('nia-daily-whatsapp', '*/15 * * * *', $job$select public.nia_daily_whatsapp_cron();$job$);
  perform cron.schedule('nia-buffer-refill', '*/15 * * * *', $job$select public.nia_buffer_refill_cron();$job$);
end;
$$;

do $$
begin
  if to_regprocedure('public.nia_daily_whatsapp_cron()') is null then raise exception 'daily cron function was not created'; end if;
  if to_regprocedure('public.nia_buffer_refill_cron()') is null then raise exception 'buffer refill cron function was not created'; end if;
end;
$$;
