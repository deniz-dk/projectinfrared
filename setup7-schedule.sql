-- Project Infrared: run the "notify" email function every morning at 8:00 a.m. Toronto time (13:00 UTC).
-- BEFORE RUNNING: replace PASTE_YOUR_CRON_SECRET below with the same secret you saved as CRON_SECRET.
select cron.unschedule('notify-daily') where exists (select 1 from cron.job where jobname = 'notify-daily');
select cron.schedule(
  'notify-daily',
  '0 13 * * *',
  $$
  select net.http_post(
    url := 'https://bazqlqgoqamqofgzoioq.supabase.co/functions/v1/notify',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', 'PASTE_YOUR_CRON_SECRET'),
    body := '{}'::jsonb
  );
  $$
);
