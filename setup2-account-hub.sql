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
