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
