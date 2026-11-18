# Project Infrared

projectinfrared.org: Canadian and Ontario medical specialties, from CaRMS to practice.

- `src/site.html`: the whole public site (data, pages, styles). Also published as the Claude preview artifact.
- `accounts*.js/css`, `prep.*`, `news.*`: accounts, profile, residency prep and specialty news (hosted site only).
- `build.py`: builds `deploy/` (Netlify runs it on every push) and writes the copy-paste email functions in `emails/`.
- `emails/notify`: daily CaRMS reminders and the Sunday newsletter. `emails/news-publish`: receives the weekly news check.
- `setup*.sql`: database setup, run once each in Supabase, in order.

No secrets live in this repo. The Supabase key in build.py is the public "publishable" key.
<!-- deploy check 2146 -->
