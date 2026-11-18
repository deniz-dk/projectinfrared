-- Project Infrared: everything the accounts need, in one go.
-- Safe to run even if you've already run some of the earlier files: each step only adds what's missing.
-- Supabase → SQL Editor → New query → paste all of this → Run.

-- ===== from setup.sql =====
-- Project Infrared: account data. Run once in Supabase → SQL Editor → New query → Run.

-- 1. Each user's saved shortlist, tier weights and sidebar sort.
create table if not exists public.user_prefs (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  shortlist  jsonb not null default '[]'::jsonb,
  weights    jsonb,
  sort       text,
  updated_at timestamptz not null default now(),
  constraint shortlist_is_array check (jsonb_typeof(shortlist) = 'array'),
  constraint shortlist_small check (jsonb_array_length(shortlist) <= 300)
);
alter table public.user_prefs enable row level security;

drop policy if exists "read own prefs" on public.user_prefs;
create policy "read own prefs" on public.user_prefs
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "insert own prefs" on public.user_prefs;
create policy "insert own prefs" on public.user_prefs
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "update own prefs" on public.user_prefs;
create policy "update own prefs" on public.user_prefs
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 2. Feedback and error reports. Signed-in users can send; nobody can read them back through the site.
--    You read them in Supabase → Table Editor → feedback.
create table if not exists public.feedback (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete set null,
  email      text,
  page       text check (char_length(page) <= 200),
  kind       text not null check (kind in ('error', 'data', 'idea', 'other')),
  message    text not null check (char_length(message) between 5 and 4000),
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;

drop policy if exists "send feedback" on public.feedback;
create policy "send feedback" on public.feedback
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- Only the two tables above are exposed to the site, and only through these rules.
revoke all on public.user_prefs from anon;
revoke all on public.feedback from anon;
grant select, insert, update on public.user_prefs to authenticated;
grant insert on public.feedback to authenticated;

-- ===== from setup2-account-hub.sql =====
-- Project Infrared: account hub upgrade. Run once in Supabase → SQL Editor → New query → Run.
-- Safe to run again; it only adds what's missing.

-- 1. More saved data per user: username, ranked top picks, private notes, saved comparisons, quiz results.
alter table public.user_prefs
  add column if not exists username    text,
  add column if not exists top_picks   jsonb not null default '[]'::jsonb,
  add column if not exists notes       jsonb not null default '{}'::jsonb,
  add column if not exists comparisons jsonb not null default '[]'::jsonb,
  add column if not exists quiz        jsonb,
  add column if not exists created_at  timestamptz not null default now();

alter table public.user_prefs drop constraint if exists username_format;
alter table public.user_prefs add constraint username_format
  check (username is null or char_length(btrim(username)) between 1 and 30);
alter table public.user_prefs drop constraint if exists top_picks_small;
alter table public.user_prefs add constraint top_picks_small
  check (jsonb_typeof(top_picks) = 'array' and jsonb_array_length(top_picks) <= 5);
alter table public.user_prefs drop constraint if exists comparisons_small;
alter table public.user_prefs add constraint comparisons_small
  check (jsonb_typeof(comparisons) = 'array' and jsonb_array_length(comparisons) <= 20);
alter table public.user_prefs drop constraint if exists notes_small;
alter table public.user_prefs add constraint notes_small
  check (jsonb_typeof(notes) = 'object' and pg_column_size(notes) < 100000);

-- Display names don't need to be unique.
drop index if exists public.user_prefs_username_unique;

-- 2. Feedback: users can see their own reports and your status/reply on each.
--    You set status and reply in Table Editor → feedback. Users can't change them.
alter table public.feedback
  add column if not exists status text not null default 'new',
  add column if not exists reply  text;
alter table public.feedback drop constraint if exists feedback_status;
alter table public.feedback add constraint feedback_status
  check (status in ('new', 'reviewing', 'fixed', 'wont_fix'));
alter table public.feedback alter column user_id drop not null;  -- keep reports if an account is deleted

drop policy if exists "read own feedback" on public.feedback;
create policy "read own feedback" on public.feedback
  for select to authenticated using ((select auth.uid()) = user_id);
grant select on public.feedback to authenticated;

-- 3. Self-service account deletion. Deletes only the signed-in user's own account;
--    their saved data goes with it, and their feedback stays (without their id).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ===== from setup3-names.sql =====
-- Project Infrared: display names don't need to be unique. Run once in Supabase → SQL Editor.
drop index if exists public.user_prefs_username_unique;
alter table public.user_prefs drop constraint if exists username_format;
alter table public.user_prefs add constraint username_format
  check (username is null or char_length(btrim(username)) between 1 and 30);

-- ===== from setup4-privacy.sql =====
-- Project Infrared: privacy policy follow-up (run once in Supabase → SQL Editor)
-- When someone deletes their account, also strip their email from any feedback
-- they sent, so the feedback that's kept can't be tied back to them.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  update public.feedback set email = null where user_id = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ===== from setup5-prep.sql =====
-- Residency prep page: one column holding each member's timeline ticks, checklist,
-- tracked programs, interview dates and draft rank list. Private to that member
-- (the existing row-level security on user_prefs already covers it).
alter table public.user_prefs
  add column if not exists prep jsonb;
alter table public.user_prefs
  drop constraint if exists prep_small;
alter table public.user_prefs
  add constraint prep_small check (prep is null or pg_column_size(prep) < 200000);
