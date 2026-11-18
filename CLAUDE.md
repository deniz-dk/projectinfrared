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
Every Saturday a scheduled task publishes the week's news through the `news-publish` Supabase function. When news shows that site data is out of date, it opens a pull request here (branch `news-YYYY-MM-DD`) with the fix. Nali approves it by merging. On merge, `.github/workflows/page-notes.yml` posts the notes found between `<!--notes-->` and `<!--/notes-->` in the PR description, using the repo secret NEWS_SECRET.

## Common requests from Nali
- **"Run the news" / "news check":** start the scheduled task "Project Infrared news check" now (list the scheduled tasks to find it, then fire it). It searches, publishes and opens a pull request for page fixes. If scheduled tasks aren't available, do the same steps by hand: the task's instructions are its prompt.
- **"Push it live" / "merge it":** review the open `news-*` pull request, then merge it with the REST API: `gh api -X PUT repos/deniz-dk/projectinfrared/pulls/<n>/merge -f merge_method=squash`. GraphQL commands like `gh pr create`, `gh pr list` and `gh pr merge` are blocked here; use `gh api repos/deniz-dk/projectinfrared/pulls…` instead.
- **"Send me the newsletter" / preview:** POST `{"preview_to":"<her account email>"}` to `https://bazqlqgoqamqofgzoioq.supabase.co/functions/v1/notify` with header `x-cron-secret`. Ask Nali for the secret, or ask her to run it, if this chat doesn't have it. It sends only to that account and isn't logged, so Sunday's email still goes out.
- **Site changes:** edit, run `python3 build.py`, check the page, commit, push to `main`. Netlify deploys it.

## Rules
- Never commit secrets: no Resend key, no service-role key, no CRON_SECRET or NEWS_SECRET. The `sb_publishable_…` key in build.py is public and fine.
- Commit messages: plain English about what changed for visitors.
- `old/` and `deploy/` are ignored. Don't commit zips.
