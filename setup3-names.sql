-- Project Infrared: display names don't need to be unique. Run once in Supabase → SQL Editor.
drop index if exists public.user_prefs_username_unique;
alter table public.user_prefs drop constraint if exists username_format;
alter table public.user_prefs add constraint username_format
  check (username is null or char_length(btrim(username)) between 1 and 30);
