-- Residency prep page: one column holding each member's timeline ticks, checklist,
-- tracked programs, interview dates and draft rank list. Private to that member
-- (the existing row-level security on user_prefs already covers it).
alter table public.user_prefs
  add column if not exists prep jsonb;
alter table public.user_prefs
  drop constraint if exists prep_small;
alter table public.user_prefs
  add constraint prep_small check (prep is null or pg_column_size(prep) < 200000);
