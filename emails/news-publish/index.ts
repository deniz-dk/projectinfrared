// Project Infrared: publishes the weekly news check (Supabase Edge Function "news-publish").
// Called by the weekly news run with the NEWS_SECRET header. It can only ADD news stories, page-change notes and a
// "last checked" row: it can't edit or delete anything, and it checks every field before saving.
// Body: { items: [...], updates: [...], sweep: { checked, found, note } }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("NEWS_SECRET")!;
// Page keys, generated from the site's data by build.py
const NAMES: Record<string, string> = /*NAMES*/ {};
const KINDS = ["trend", "policy", "match", "pay", "jobs", "opportunity", "research", "news"];

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const https = (v: unknown) => {
  const s = str(v, 600);
  try {
    return new URL(s).protocol === "https:" ? s : "";
  } catch {
    return "";
  }
};
const day = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)) ? v : "");
const keys = (v: unknown) => (Array.isArray(v) ? [...new Set(v.filter((k) => typeof k === "string" && NAMES[k]))].slice(0, 12) : []);

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });
  if (!SECRET || req.headers.get("x-news-secret") !== SECRET) return new Response("forbidden", { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body) return new Response("bad json", { status: 400 });
  const skipped: string[] = [];
  const today = new Date().toISOString().slice(0, 10);

  const items = (Array.isArray(body.items) ? body.items : []).slice(0, 200).flatMap((x: any, i: number) => {
    const row = {
      published: day(x.published),
      specs: keys(x.specs),
      kind: KINDS.includes(x.kind) ? x.kind : "news",
      title: str(x.title, 200),
      summary: str(x.summary, 600),
      source: str(x.source, 100),
      url: https(x.url),
      image: https(x.image) || null,
      top: x.top === true,
    };
    const bad = !row.published ? "date" : row.published > today ? "future date" : !row.title ? "title" : !row.summary ? "summary" : !row.source ? "source" : !row.url ? "url" : "";
    if (bad) {
      skipped.push(`item ${i + 1}: ${bad}`);
      return [];
    }
    return [row];
  });
  const updates = (Array.isArray(body.updates) ? body.updates : []).slice(0, 50).flatMap((u: any, i: number) => {
    const row = { day: day(u.day) || today, specs: keys(u.specs), kind: u.kind === "site" ? "site" : "data", title: str(u.title, 160), body: str(u.body, 800) };
    if (!row.title || !row.body || (row.kind === "data" && !row.specs.length)) {
      skipped.push(`update ${i + 1}`);
      return [];
    }
    return [row];
  });

  let added = 0;
  if (items.length) {
    const { data, error } = await sb.from("news_items").upsert(items, { onConflict: "url", ignoreDuplicates: true }).select("id");
    if (error) return Response.json({ error: "news_items: " + error.message }, { status: 500 });
    added = (data || []).length;
  }
  if (updates.length) {
    const { error } = await sb.from("site_updates").insert(updates);
    if (error) return Response.json({ error: "site_updates: " + error.message }, { status: 500 });
  }
  // Only the weekly news check sends "sweep"; page-change notes posted after a merge don't count as a check
  if (body.sweep) {
    const s = body.sweep;
    await sb.from("news_sweeps").insert({ checked: Number.isFinite(s.checked) ? s.checked : null, found: added, note: str(s.note, 300) || null });
  }
  return Response.json({ added, duplicates: items.length - added, updates: updates.length, skipped });
});
