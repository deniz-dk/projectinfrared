# Project Infrared accounts: setup steps

1. Supabase → SQL Editor → New query → paste all of setup.sql → Run. ("Success. No rows returned" is right.)
2. Supabase → Authentication → Sign In / Providers → Email: keep "Confirm email" on. Set minimum password length to 8.
3. Host the site: Cloudflare dashboard → Workers & Pages → Create → Pages → "Upload assets".
   Name it (e.g. project-infrared), drag in the *contents* of the deploy folder (index.html and _headers), Deploy.
   You get an address like https://project-infrared.pages.dev
4. Supabase → Authentication → URL Configuration:
   Site URL = your address from step 3 (e.g. https://project-infrared.pages.dev)
   Redirect URLs: add the same address followed by /** (e.g. https://project-infrared.pages.dev/**)
   Add your own domain later the same way.
5. Test: create an account with the same email you used to sign up for Supabase (see note), confirm, save a specialty, log in on your phone.

Note on emails: Supabase's built-in email only delivers to members of your Supabase organization and only a few per hour.
Before real users sign up, connect a sender (Resend has a free tier): Supabase → Authentication → Emails → SMTP Settings.

Reading feedback: Supabase → Table Editor → feedback.
