-- Project Infrared: reminder emails. Run once in Supabase → SQL Editor → New query → Run.
-- Safe to run again.

-- 1. A private token per member, used only in "unsubscribe" links so nobody has to log in to stop emails.
alter table public.user_prefs
  add column if not exists email_token uuid not null default gen_random_uuid();

-- 2. A record of every reminder sent, so nobody ever gets the same one twice.
create table if not exists public.email_log (
  user_id  uuid not null references auth.users(id) on delete cascade,
  key      text not null,
  sent_at  timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.email_log enable row level security;  -- no policies: only the server-side function can touch it
revoke all on public.email_log from anon, authenticated;

-- 3. The tools Supabase uses to run something on a schedule.
create extension if not exists pg_cron;
create extension if not exists pg_net;
