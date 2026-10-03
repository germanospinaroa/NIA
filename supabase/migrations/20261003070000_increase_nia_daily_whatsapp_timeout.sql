-- Give the daily WhatsApp endpoint enough time to complete its intervention generation/audit pipeline.
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
      'Authorization', 'Bearer ' || cron_secret
    ),
    timeout_milliseconds := 55000
  );
end;
$$;
