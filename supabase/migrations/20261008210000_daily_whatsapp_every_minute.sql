-- Delivery is lightweight and must check every minute. Refill remains the
-- expensive, model-backed process and intentionally stays on a 15-minute
-- cadence. Re-running this migration replaces only the named jobs.
do $$
declare existing_job record;
begin
  if to_regnamespace('cron') is null then raise exception 'pg_cron is not available'; end if;
  if to_regprocedure('public.nia_welcome_dispatch_cron()') is null then raise exception 'welcome cron function is missing'; end if;
  if to_regprocedure('public.nia_daily_whatsapp_cron()') is null then raise exception 'daily cron function is missing'; end if;
  if to_regprocedure('public.nia_buffer_refill_cron()') is null then raise exception 'buffer refill cron function is missing'; end if;

  for existing_job in select jobid from cron.job where jobname in ('nia-welcome-dispatch', 'nia-daily-whatsapp', 'nia-buffer-refill') loop
    perform cron.unschedule(existing_job.jobid);
  end loop;

  perform cron.schedule('nia-welcome-dispatch', '* * * * *', $job$select public.nia_welcome_dispatch_cron();$job$);
  perform cron.schedule('nia-daily-whatsapp', '* * * * *', $job$select public.nia_daily_whatsapp_cron();$job$);
  perform cron.schedule('nia-buffer-refill', '*/15 * * * *', $job$select public.nia_buffer_refill_cron();$job$);
end;
$$;

do $$
begin
  if not exists (select 1 from cron.job where jobname = 'nia-welcome-dispatch' and schedule = '* * * * *') then raise exception 'welcome dispatch schedule is not configured'; end if;
  if not exists (select 1 from cron.job where jobname = 'nia-daily-whatsapp' and schedule = '* * * * *') then raise exception 'daily whatsapp schedule is not configured'; end if;
  if not exists (select 1 from cron.job where jobname = 'nia-buffer-refill' and schedule = '*/15 * * * *') then raise exception 'buffer refill schedule is not configured'; end if;
end;
$$;
