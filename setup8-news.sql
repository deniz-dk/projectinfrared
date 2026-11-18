-- Project Infrared: specialty news, page-change notes and the Sunday newsletter.
-- Run once in Supabase → SQL Editor → New query → Run. Safe to run again.
-- No new schedule is needed: the daily 8 a.m. job also sends the newsletter when it's Sunday.

-- 1. News stories, one row per story. "specs" lists the pages it belongs to,
--    using the site's page keys: "obgyn", "ophthalmology", or "sub-obgyn-2" for a subspecialty.
create table if not exists public.news_items (
  id         uuid primary key default gen_random_uuid(),
  published  date not null,                 -- the story's own date
  added_at   timestamptz not null default now(),
  specs      text[] not null default '{}',
  kind       text not null default 'news',  -- news, policy, match, pay, jobs, opportunity, research
  title      text not null,
  summary    text not null,                 -- our own one-to-two sentence summary
  source     text not null,                 -- e.g. "CaRMS", "Ontario Medical Association"
  url        text not null unique,
  image      text,                          -- optional: the story's own preview image
  top        boolean not null default false -- shown to everyone in "Across Canada"
);
create index if not exists news_items_specs on public.news_items using gin (specs);
create index if not exists news_items_published on public.news_items (published desc);

-- 2. Changes we make to the site's own pages (ratings, numbers, new sections), plus site news.
create table if not exists public.site_updates (
  id        uuid primary key default gen_random_uuid(),
  day       date not null default current_date,
  specs     text[] not null default '{}',
  kind      text not null default 'data',   -- data = a page changed; site = site-wide news
  title     text not null,
  body      text not null
);
create index if not exists site_updates_specs on public.site_updates using gin (specs);

-- 3. A log of each weekly news check, so pages can say "Last checked ...".
create table if not exists public.news_sweeps (
  id       uuid primary key default gen_random_uuid(),
  ran_at   timestamptz not null default now(),
  checked  int,
  found    int,
  note     text
);

-- Anyone can read these (they're shown on public pages); only you, from this SQL editor, can add or change them.
alter table public.news_items  enable row level security;
alter table public.site_updates enable row level security;
alter table public.news_sweeps  enable row level security;
drop policy if exists "public read" on public.news_items;
drop policy if exists "public read" on public.site_updates;
drop policy if exists "public read" on public.news_sweeps;
create policy "public read" on public.news_items  for select to anon, authenticated using (true);
create policy "public read" on public.site_updates for select to anon, authenticated using (true);
create policy "public read" on public.news_sweeps  for select to anon, authenticated using (true);
revoke insert, update, delete on public.news_items, public.site_updates, public.news_sweeps from anon, authenticated;
grant select on public.news_items, public.site_updates, public.news_sweeps to anon, authenticated;

-- 4. This week's page changes, so the first newsletter has something real in it.
insert into public.site_updates (day, specs, kind, title, body)
select * from (values
  (date '2026-11-18', array['obgyn'], 'data', 'Income and work-life ratings lowered',
   'Fertility (IVF) clinic earnings now count only on the fertility subspecialty page, since only the few who finish that fellowship can earn them. Income rating 5 → 4 stars, work-life balance 3 → 2 (the heaviest on-call load on the site). Now Tier 2.'),
  (date '2026-11-18', array['ent'], 'data', 'Income rating lowered',
   'Cash facial plastics now count only for those with the extra fellowship training. Income rating 5 → 4 stars.'),
  (date '2026-11-18', array['ophthalmology'], 'data', 'Private income recalculated',
   'Cosmetic eyelid surgery now counts only for those with oculoplastics fellowship training.'),
  (date '2026-11-18', array['respirology'], 'data', 'Private income recalculated',
   'Sleep lab income now counts only for those with the extra sleep medicine training.'),
  (date '2026-11-18', array['pain'], 'data', 'Income rating lowered', 'Income rating 4 → 3 stars after private income was reweighted by how easy each source is to get into.'),
  (date '2026-11-18', array['anesthesia','neurosurgery','neurology'], 'data', 'Work-life rating lowered',
   'Work-life balance down one star. Ties now round down for specialties with heavy on-call.'),
  (date '2026-11-18', array[]::text[], 'site', 'Specialty news and the Sunday newsletter',
   'Every specialty page now has a News tab, your profile has My News for the specialties you’ve starred, and a newsletter arrives Sunday mornings. Amounts of $1 million or more now show as $x.xxM.')
) v(day, specs, kind, title, body)
where not exists (select 1 from public.site_updates where day = date '2026-11-18');
