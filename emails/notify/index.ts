// Project Infrared: daily reminder emails (Supabase Edge Function "notify").
// Runs once a day from a schedule. Sends, only to members who turned the switch on:
//  - CaRMS deadline reminders: 7 days before and the day before each deadline in their match year
//  - Interview reminders: the day before any interview date they entered in Residency prep
//  - The Sunday newsletter (on Sundays, Toronto time): news and page changes for each member's favorites,
//    top stories from across Canada, and site news for those who want it
// Also handles one-click unsubscribe links (GET ?u=<token>&t=remind|weekly|news).
// Test: POST {"preview_to":"you@example.com"} with the secret sends that account this week's newsletter now (not logged).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SITE = "https://projectinfrared.org";
const FROM = "Project Infrared <noreply@projectinfrared.org>";
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const RESEND = Deno.env.get("RESEND_API_KEY")!;
const CRON = Deno.env.get("CRON_SECRET")!;
const SELF = Deno.env.get("SUPABASE_URL")! + "/functions/v1/notify";

// Keep in step with PREP_TL in the site (prep.js). Dated steps only.
const TL: Record<string, { id: string; t: string; n: string; d: string }[]> = {
  "2027": [
    { id: "refs", t: "Reference letters due", n: "Referees submit in CaRMS Online by 9 p.m. ET.", d: "2026-11-25" },
    { id: "file", t: "File review opens", n: "Programs start reading applications.", d: "2026-11-26" },
    { id: "int", t: "National interview period starts", n: "Runs to February 7. Most interviews are virtual.", d: "2027-01-16" },
    { id: "rol", t: "Rank order lists due", n: "Check CaRMS Online for your exact deadline.", d: "2027-02-11" },
    { id: "match", t: "Match day", n: "Results in CaRMS Online at noon ET.", d: "2027-03-02" },
  ],
  "2028": [
    { id: "open", t: "Applications open", n: "CaRMS Online opens for the 2028 match.", d: "2027-09-08" },
    { id: "refs", t: "Reference letters due", n: "Referees submit in CaRMS Online by 9 p.m. ET.", d: "2027-11-24" },
    { id: "file", t: "File review opens", n: "Programs start reading applications.", d: "2027-11-25" },
  ],
};

const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const torontoToday = () => new Date(new Date().toLocaleString("en-US", { timeZone: "America/Toronto" }).split(",")[0]);
const daysUntil = (iso: string) => Math.round((new Date(iso + "T00:00:00").getTime() - torontoToday().getTime()) / 864e5);
const nice = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });

function page(title: string, msg: string) {
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><body style="margin:0;background:#f4f4f5;font-family:Helvetica,Arial,sans-serif;color:#141416"><div style="max-width:460px;margin:60px auto;background:#fff;border:1px solid #dddde1;border-radius:16px;padding:28px"><p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#c8102e">Project Infrared</p><h1 style="margin:0 0 12px;font-size:24px">${title}</h1><p style="margin:0 0 20px;line-height:1.5;color:#3d4047">${msg}</p><a href="${SITE}/#account" style="display:inline-block;background:#c8102e;color:#fff;text-decoration:none;font-weight:700;padding:11px 18px;border-radius:10px">Email settings</a></div></body>`, { headers: { "content-type": "text/html; charset=utf-8" } });
}

function email(heading: string, kicker: string, items: { t: string; when: string; n: string }[], unsub: string) {
  const rows = items
    .map((i) => `<tr><td style="padding:12px 0;border-bottom:1px solid #ececef"><b style="font-size:16px;color:#141416">${esc(i.t)}</b><br><span style="font-size:14px;color:#c8102e;font-weight:700">${esc(i.when)}</span><br><span style="font-size:14px;color:#5e6168;line-height:1.5">${esc(i.n)}</span></td></tr>`)
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head><body style="margin:0;padding:0;background:#f4f4f5">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #dddde1;border-radius:16px;overflow:hidden;font-family:'Public Sans',Helvetica,Arial,sans-serif;color:#141416">
<tr><td style="background:#0b0b0d;padding:22px 28px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td><img src="${SITE}/icon-192.png" width="36" height="36" alt="" style="display:block;border:0;border-radius:9px"></td><td style="padding-left:12px;font-family:'Archivo Narrow','Arial Narrow',Arial,sans-serif;font-weight:800;font-size:19px;letter-spacing:.5px;text-transform:uppercase;color:#fff">Project Infrared</td></tr></table></td></tr>
<tr><td style="padding:30px 28px 8px"><p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#c8102e">${esc(kicker)}</p>
<h1 style="margin:0 0 14px;font-family:'Archivo Narrow','Arial Narrow',Arial,sans-serif;font-weight:800;font-size:30px;line-height:1.05;text-transform:uppercase">${esc(heading)}</h1>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px"><tr><td style="border-radius:10px;background:#c8102e"><a href="${SITE}/#prep" style="display:inline-block;padding:13px 22px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;border-radius:10px">Open my residency prep</a></td></tr></table></td></tr>
<tr><td style="padding:22px 28px 26px"><p style="margin:0;padding-top:16px;border-top:1px solid #ececef;font-size:12px;line-height:1.6;color:#8a8d94">You’re getting this because CaRMS deadline reminders are on in your Project Infrared settings. Dates come from CaRMS’s published timeline; always confirm in CaRMS Online.<br><a href="${unsub}" style="color:#8a8d94">Unsubscribe from deadline reminders</a> · <a href="${SITE}/#account/notifications" style="color:#8a8d94">Email settings</a><br>Project Infrared · London, Ontario, Canada</p></td></tr>
</table></td></tr></table></body></html>`;
}

async function send(to: string, subject: string, html: string, unsub: string) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html, headers: { "List-Unsubscribe": `<${unsub}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}


const UNSUB_MSG: Record<string, [string, string]> = {
  remind: ["remind", "You won’t get CaRMS deadline reminders any more."],
  weekly: ["changes", "You won’t get the Sunday newsletter any more."],
  news: ["news", "You won’t get site news emails any more."],
  all: ["email", "You won’t get any more emails from Project Infrared, apart from account emails like password resets."],
};
async function unsubscribe(token: string, t: string) {
  const { data } = await sb.from("user_prefs").select("user_id, prep").eq("email_token", token).maybeSingle();
  if (!data) return false;
  const prep = { ...(data.prep || {}) };
  if (t === "remind") prep.remind = false;
  else prep.notify = { ...(prep.notify || {}), [UNSUB_MSG[t][0]]: false };
  await sb.from("user_prefs").update({ prep }).eq("user_id", data.user_id);
  return true;
}

// Consent: send nothing unless the member turned email on in Notifications, or ticked the box at sign-up.
const emailOk = (prep: any, meta: any) => {
  const e = prep && prep.notify ? prep.notify.email : undefined;
  return e === true || (e == null && !!meta && meta.email_ok === true);
};

/* ---------- Daily: CaRMS deadline and interview reminders ---------- */
async function runReminders() {
  const { data: rows, error } = await sb.from("user_prefs").select("user_id, prep, email_token").not("prep", "is", null);
  if (error) throw new Error(error.message);
  let sent = 0;
  const log: string[] = [];
  for (const r of rows || []) {
    const P = r.prep || {};
    if (P.applying === false || P.remind === false) continue;
    const year = String(P.year || "2027");
    const due: { key: string; t: string; when: string; n: string }[] = [];
    for (const s of TL[year] || []) {
      const d = daysUntil(s.d);
      if (d === 7 || d === 1) due.push({ key: `${year}-${s.id}-${d}`, t: s.t, when: d === 1 ? `Tomorrow, ${nice(s.d)}` : `In one week, ${nice(s.d)}`, n: s.n });
    }
    for (const p of P.progs || []) {
      if (p.date && daysUntil(p.date) === 1 && p.status !== "no") due.push({ key: `int-${p.k}-${p.date}`, t: "Interview tomorrow", when: nice(p.date), n: "Good luck. Your program details are in Residency prep." });
    }
    if (!due.length) continue;
    // Skip anything already sent
    const { data: done } = await sb.from("email_log").select("key").eq("user_id", r.user_id).in("key", due.map((x) => x.key));
    const fresh = due.filter((x) => !(done || []).some((d) => d.key === x.key));
    if (!fresh.length) continue;
    const { data: au } = await sb.auth.admin.getUserById(r.user_id);
    const to = au?.user?.email;
    if (!to || !emailOk(P, au?.user?.user_metadata)) continue;
    const unsub = `${SELF}?u=${r.email_token}&t=remind`;
    const subject = fresh.length === 1 ? `${fresh[0].t}: ${fresh[0].when.split(",")[0].toLowerCase()}` : `${fresh.length} CaRMS dates coming up`;
    try {
      await send(to, subject.charAt(0).toUpperCase() + subject.slice(1), email(fresh.length === 1 ? fresh[0].t : "Coming up", `${year} match reminder`, fresh, unsub), unsub);
      await sb.from("email_log").insert(fresh.map((x) => ({ user_id: r.user_id, key: x.key })));
      sent++;
    } catch (e) {
      log.push(String(e));
    }
  }
  return { sent, errors: log };
}

/* ---------- Sunday newsletter ---------- */
// Page names, generated from the site's data by build.py. Keys match the site's favorites: "obgyn", "sub-obgyn-2".
const NAMES: Record<string, string> = /*NAMES*/ {};
const baseOf = (k: string) => (/^sub-([a-z]+)-\d+$/.exec(k) || [, k])[1] as string;
const pageHref = (k: string) => {
  const m = /^sub-([a-z]+)-(\d+)$/.exec(k);
  return `${SITE}/#${m ? `sub-${m[1]}-${m[2]}` : k}/news`;
};
const short = (k: string) => (NAMES[k] || k).replace(/ \(.*\)$/, "");
const KIND: Record<string, [string, string]> = {
  policy: ["Policy", "#6fb1ff"], match: ["Match", "#ff5a6a"], pay: ["Pay", "#3ecf8e"], jobs: ["Jobs", "#f5b942"],
  opportunity: ["Opportunity", "#c69bff"], research: ["Research", "#4dd4d4"], news: ["News", "#a4a6ad"],
};
const torontoDay = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" }); // YYYY-MM-DD
const isSundayToronto = () => new Date().toLocaleDateString("en-US", { timeZone: "America/Toronto", weekday: "short" }) === "Sun";
const shortDate = (iso: string) => new Date(iso.slice(0, 10) + "T12:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric" });

type News = { id: string; published: string; specs: string[]; kind: string; title: string; summary: string; source: string; url: string; image: string | null; top: boolean };
type Upd = { id: string; day: string; specs: string[]; kind: string; title: string; body: string };

async function weekData() {
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const [n, u] = await Promise.all([
    sb.from("news_items").select("*").gte("added_at", since).order("published", { ascending: false }).limit(400),
    sb.from("site_updates").select("*").gte("day", since.slice(0, 10)).order("day", { ascending: false }).limit(200),
  ]);
  if (n.error) throw new Error("news_items: " + n.error.message);
  if (u.error) throw new Error("site_updates: " + u.error.message);
  return { news: (n.data || []) as News[], upd: (u.data || []) as Upd[] };
}

// Does a story or change tagged with "specs" belong to favorite f? Exact page, a subspecialty of a starred
// specialty, or the parent specialty of a starred subspecialty.
const touches = (specs: string[], f: string) => specs.some((s) => s === f || baseOf(s) === f || s === baseOf(f));

const C = { bg: "#050506", card: "#0f0f12", line: "#24242a", ink: "#f1f1f3", mute: "#a9abb2", dim: "#7c7e86", red: "#ff4a5c", brand: "#c8102e" };
const F = "font-family:'Public Sans',Helvetica,Arial,sans-serif";
const NARROW = "font-family:'Archivo Narrow','Arial Narrow',Arial,sans-serif;font-weight:800;text-transform:uppercase";

function storyHtml(x: News, tag?: string) {
  const [kl, kc] = KIND[x.kind] || KIND.news;
  const img = x.image ? `<td width="104" valign="top" style="padding-right:14px"><a href="${esc(x.url)}"><img src="${esc(x.image)}" width="104" height="74" alt="" style="display:block;width:104px;height:74px;object-fit:cover;border-radius:8px;border:1px solid ${C.line}"></a></td>` : "";
  return `<tr><td style="padding:14px 0;border-top:1px solid ${C.line}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${img}<td valign="top">
<p style="margin:0 0 5px;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${kc}">${kl}<span style="color:${C.dim};font-weight:600;letter-spacing:.4px;text-transform:none"> · ${esc(shortDate(x.published))} · ${esc(x.source)}${tag ? ` · ${esc(tag)}` : ""}</span></p>
<a href="${esc(x.url)}" style="font-size:16px;line-height:1.3;font-weight:700;color:${C.ink};text-decoration:none">${esc(x.title)}</a>
<p style="margin:5px 0 0;font-size:14px;line-height:1.5;color:${C.mute}">${esc(x.summary)}</p></td></tr></table></td></tr>`;
}
function changesHtml(list: Upd[]) {
  if (!list.length) return "";
  return `<tr><td style="padding:12px 14px;background:#16161a;border:1px solid ${C.line};border-radius:10px">
<p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${C.dim}">Changed on our page</p>
${list.map((c) => `<p style="margin:0 0 6px;font-size:14px;line-height:1.5;color:${C.mute}"><b style="color:${C.ink}">${esc(c.title)}.</b> ${esc(c.body)}</p>`).join("")}</td></tr><tr><td style="height:6px"></td></tr>`;
}
function sectionHead(title: string, link?: string, linkText = "Open page →") {
  return `<tr><td style="padding:30px 28px 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="${NARROW};font-size:22px;line-height:1.05;color:${C.ink}">${esc(title)}</td>
${link ? `<td align="right" style="white-space:nowrap;padding-left:10px"><a href="${link}" style="font-size:13px;font-weight:700;color:${C.red};text-decoration:none">${linkText}</a></td>` : ""}</tr></table></td></tr>`;
}

function weeklyHtml(o: { name: string; dateLine: string; summary: string; favBlocks: string; top: News[]; site: Upd[]; deadline: string; noFavs: boolean; unsub: string }) {
  const block = (inner: string) => `<tr><td style="padding:0 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${inner}</table></td></tr>`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"></head>
<body style="margin:0;padding:0;background:${C.bg}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:28px 10px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${C.card};border:1px solid ${C.line};border-radius:18px;overflow:hidden;${F};color:${C.ink}">
<tr><td style="padding:22px 28px;border-bottom:1px solid ${C.line}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td><table role="presentation" cellpadding="0" cellspacing="0"><tr><td><img src="${SITE}/icon-192.png" width="34" height="34" alt="" style="display:block;border:0;border-radius:9px"></td><td style="padding-left:12px;${NARROW};font-size:18px;letter-spacing:.5px;color:#fff">Project Infrared</td></tr></table></td>
<td align="right" style="font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${C.dim}">The Sunday</td></tr></table></td></tr>
<tr><td style="padding:30px 28px 6px;background:linear-gradient(160deg,#2a0a10 0%,${C.card} 60%)">
<p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${C.red}">${esc(o.dateLine)}</p>
<h1 style="margin:0 0 12px;${NARROW};font-size:34px;line-height:1;color:#fff">${o.name ? `${esc(o.name)}, here’s your week` : "Your week in Canadian medicine"}</h1>
<p style="margin:0 0 22px;font-size:15px;line-height:1.55;color:${C.mute}">${esc(o.summary)}</p></td></tr>
${o.deadline ? `<tr><td style="padding:0 28px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.brand};border-radius:12px"><tr><td style="padding:12px 16px;font-size:14px;line-height:1.5;color:${C.ink}"><b style="color:${C.red}">CaRMS · </b>${o.deadline} <a href="${SITE}/#prep" style="color:${C.red};font-weight:700;text-decoration:none;white-space:nowrap">Residency prep →</a></td></tr></table></td></tr>` : ""}
${o.noFavs ? `<tr><td style="padding:18px 28px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#16161a;border:1px solid ${C.line};border-radius:12px"><tr><td style="padding:16px 18px;font-size:14px;line-height:1.55;color:${C.mute}"><b style="color:${C.ink}">Make this newsletter yours.</b> Star the specialties you’re considering and each Sunday you’ll get their news, opportunities and any changes to their pages here. <a href="${SITE}/#home" style="color:${C.red};font-weight:700;text-decoration:none">Browse specialties →</a></td></tr></table></td></tr>` : ""}
${o.favBlocks}
${o.top.length ? sectionHead("Across Canada", `${SITE}/#account`, "My News →") + block(o.top.map((x) => storyHtml(x, x.specs.length ? short(x.specs[0]) : "")).join("")) : ""}
${o.site.length ? sectionHead("On Project Infrared") + block(changesHtml(o.site).replace("Changed on our page", "Site news")) : ""}
<tr><td style="padding:28px 28px 6px" align="center"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:${C.brand};box-shadow:0 3px 10px rgba(200,16,46,.45)"><a href="${SITE}/#account" style="display:inline-block;padding:13px 24px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;border-radius:10px">Open My News</a></td></tr></table></td></tr>
<tr><td style="padding:22px 28px 26px"><p style="margin:0;padding-top:16px;border-top:1px solid ${C.line};font-size:12px;line-height:1.6;color:${C.dim}">You’re getting this because the Sunday newsletter is on in your Project Infrared settings. Summaries are ours; follow each link for the full story and confirm details with the source.<br><a href="${o.unsub}" style="color:${C.dim}">Unsubscribe from the newsletter</a> · <a href="${o.unsub.replace("t=weekly", "t=all")}" style="color:${C.dim}">Stop all emails</a> · <a href="${SITE}/#account/notifications" style="color:${C.dim}">Email settings</a><br>Project Infrared · London, Ontario, Canada</p></td></tr>
</table></td></tr></table></body></html>`;
}

type Row = { user_id: string; prep: any; email_token: string; shortlist: string[]; username: string | null };
function buildWeekly(r: Row, W: { news: News[]; upd: Upd[] }) {
  const P = r.prep || {}, N = P.notify || {};
  const favs = (Array.isArray(r.shortlist) ? r.shortlist : []).filter((k) => NAMES[k]);
  const used = new Set<string>();
  let nStories = 0, nChanges = 0;
  const withNews: string[] = [];
  const blocks = favs
    .map((f) => {
      const st = W.news.filter((x) => !used.has(x.id) && touches(x.specs, f)).slice(0, 4);
      const ch = W.upd.filter((u) => u.kind === "data" && touches(u.specs, f));
      if (!st.length && !ch.length) return "";
      st.forEach((x) => used.add(x.id));
      nStories += st.length;
      nChanges += ch.length;
      withNews.push(short(f));
      return sectionHead(NAMES[f], pageHref(f)) + `<tr><td style="padding:0 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${changesHtml(ch)}${st.map((x) => storyHtml(x)).join("")}</table></td></tr>`;
    })
    .join("");
  const top = W.news.filter((x) => x.top && !used.has(x.id)).slice(0, favs.length ? 3 : 5);
  const site = N.news ? W.upd.filter((u) => u.kind === "site") : [];
  if (!blocks && !top.length && !site.length) return null;

  const quiet = favs.filter((f) => !withNews.includes(short(f))).length;
  const parts: string[] = [];
  if (nStories) parts.push(`${nStories} ${nStories === 1 ? "story" : "stories"}`);
  if (nChanges) parts.push(`${nChanges} page ${nChanges === 1 ? "change" : "changes"}`);
  const summary = !favs.length
    ? "The week’s top stories for medical students and residents across Canada."
    : parts.length
      ? `${parts.join(" and ")} for ${withNews.slice(0, 3).join(", ")}${withNews.length > 3 ? ` and ${withNews.length - 3} more` : ""}.${quiet ? ` Nothing new this week for your ${quiet === 1 ? "other favorite" : `other ${quiet} favorites`}.` : ""}`
      : `A quiet week for your ${favs.length} favorite${favs.length === 1 ? "" : "s"}. Here’s what mattered across Canada.`;

  let deadline = "";
  if (P.applying !== false && P.year) {
    const nx = (TL[String(P.year)] || []).find((s) => daysUntil(s.d) >= 0);
    if (nx) {
      const d = daysUntil(nx.d);
      deadline = `<b>${esc(nx.t)}</b> ${d === 0 ? "today" : d === 1 ? "tomorrow" : `in ${d} days`}, ${esc(nice(nx.d))}.`;
    }
  }
  const unsub = `${SELF}?u=${r.email_token}&t=weekly`;
  const dateLine = new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto", weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const html = weeklyHtml({ name: (r.username || "").trim(), dateLine, summary, favBlocks: blocks, top, site, deadline, noFavs: !favs.length, unsub });
  const subject = withNews.length
    ? `${withNews.slice(0, 2).join(", ")}${withNews.length > 2 ? ` +${withNews.length - 2}` : ""}: your week in medicine`
    : "Your week in Canadian medicine";
  return { html, subject, unsub };
}

async function runWeekly(onlyEmail?: string) {
  const W = await weekData();
  const key = "weekly-" + torontoDay();
  const { data: rows, error } = await sb.from("user_prefs").select("user_id, prep, email_token, shortlist, username");
  if (error) throw new Error(error.message);
  let sent = 0;
  const log: string[] = [];
  for (const r of (rows || []) as Row[]) {
    const N = (r.prep && r.prep.notify) || {};
    if (!onlyEmail && N.changes === false) continue;
    const { data: au } = await sb.auth.admin.getUserById(r.user_id);
    const to = au?.user?.email;
    if (!to || (onlyEmail && to.toLowerCase() !== onlyEmail.toLowerCase())) continue;
    if (!onlyEmail && !emailOk(r.prep, au?.user?.user_metadata)) continue;
    if (!onlyEmail) {
      const { data: done } = await sb.from("email_log").select("key").eq("user_id", r.user_id).eq("key", key);
      if (done && done.length) continue;
    }
    const m = buildWeekly(r, W);
    if (!m) {
      if (onlyEmail) log.push("Nothing to send this week for that account yet (no news, page changes or top stories in the last 7 days).");
      continue;
    }
    try {
      await send(to, m.subject, m.html, m.unsub);
      if (!onlyEmail) await sb.from("email_log").insert({ user_id: r.user_id, key });
      sent++;
    } catch (e) {
      log.push(String(e));
    }
  }
  if (onlyEmail && !sent && !log.length) log.push("No account with that email has saved settings yet. Log in on the site and star a specialty first.");
  return { sent, errors: log, stories: W.news.length, changes: W.upd.length };
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  // One-click unsubscribe (from the link, or from the mail app's built-in unsubscribe button)
  const u = url.searchParams.get("u");
  if (u) {
    const t = UNSUB_MSG[url.searchParams.get("t") || ""] ? url.searchParams.get("t")! : "remind";
    const ok = /^[0-9a-f-]{36}$/i.test(u) && (await unsubscribe(u, t));
    if (req.method === "POST") return new Response(ok ? "ok" : "not found", { status: ok ? 200 : 404 });
    return ok ? page("You’re unsubscribed", UNSUB_MSG[t][1] + " You can turn it back on any time in your settings.") : page("Link not recognised", "This unsubscribe link didn’t match an account. You can change your emails in your settings.");
  }
  // Sending: only the schedule (which knows the secret) can trigger it
  if (req.headers.get("x-cron-secret") !== CRON) return new Response("forbidden", { status: 403 });
  const body = await req.json().catch(() => ({}));
  const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
  try {
    if (body.preview_to) return json({ weekly: await runWeekly(String(body.preview_to)) });
    const out: Record<string, unknown> = { reminders: await runReminders() };
    if (body.job === "weekly" || isSundayToronto()) out.weekly = await runWeekly();
    return json(out);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
