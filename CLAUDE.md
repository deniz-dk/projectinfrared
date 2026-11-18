# Project Infrared: how to work on this repo

The site at projectinfrared.org is built by Netlify from `main`. A push to `main` goes live in about a minute, so check your work before pushing.

## Making changes
- The whole public site (data, pages, styles, scripts) is `src/site.html`. Specialty data is the `const S = [` array. Ratings, tiers and income logic live in the same file.
- Account, profile, residency prep and news code: `accounts.js`, `accounts-hub.js`, `prep.js`, `news.js`, plus their `.css` files. These only exist on the hosted site.
- Build and check with `python3 build.py`. It must print `built …` with no errors. It also rewrites `emails/notify-function.txt` and `emails/news-publish-function.txt`, the copy-paste versions of the Supabase functions.
- Look at what you changed: open `deploy/index.html` in Playwright at 1280px and 390px wide, on the page you touched.
- Money of $1M or more shows as `$x.xxM`. Tier 1 is the best tier.
- When a data change alters what a specialty page says (ratings, seats, fees, income), add a page-change note so it appears on that page's News tab and in the Sunday newsletter. Post it to the news-publish function as an `updates` entry: `{"day":"YYYY-MM-DD","specs":["obgyn"],"kind":"data","title":"…","body":"…"}`. The URL and secret are in the weekly news task. Or give Nali the SQL insert for `public.site_updates`.
- The Claude preview artifact (https://claude.ai/artifact/8abffwyV9Z8E99B7XLBTi8) shows `src/site.html` without accounts. Republish it after site changes if this session can.

## Weekly news
Every Saturday a scheduled task publishes the week's news through the `news-publish` Supabase function. When news shows that site data is out of date, it opens a pull request here with the fix. Nali approves it by merging.

## Rules
- Never commit secrets: no Resend key, no service-role key, no CRON_SECRET or NEWS_SECRET. The `sb_publishable_…` key in build.py is public and fine.
- Commit messages: plain English about what changed for visitors.
- `old/` and `deploy/` are ignored. Don't commit zips.
