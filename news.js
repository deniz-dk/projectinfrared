/* Specialty news (hosted build only).
   - A News tab on every specialty and subspecialty page: top stories with links, plus changes we made to that page.
   - My News in the profile: the same, for the specialties you've starred.
   Stories live in Supabase (news_items, site_updates, news_sweeps), added each week by the news check. */
const NEWS = { items: [], upd: [], sweep: null, ready: false, off: false };
const NEWS_KIND = { trend: "Trend", tech: "Technology", politics: "Politics", business: "Business & tax", policy: "Policy", match: "Match", pay: "Pay", jobs: "Jobs", opportunity: "Opportunity", research: "Research", news: "News" };
// Line icons for stories without a photo: each kind gets its own cover
const NEWS_ICO = {
  tech: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>',
  politics: '<path d="M4 21V4M4 4h12l-2 4 2 4H4"/>',
  business: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  policy: '<path d="M3 21h18M5 21V10m4 11V10m6 11V10m4 11V10M2 10l10-6 10 6z"/>',
  match: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  pay: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
  jobs: '<rect x="3" y="7.5" width="18" height="12" rx="2"/><path d="M9 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5.5v2M3 13h18"/>',
  opportunity: '<path d="M12 3l2.2 5.6L20 9.5l-4.5 3.8L17 19l-5-3.1L7 19l1.5-5.7L4 9.5l5.8-.9z"/>',
  research: '<path d="M9 3h6M10 3v6l-5.5 9.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7.5 15h9"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  news: '<rect x="3" y="4" width="15" height="16" rx="2"/><path d="M18 8h2a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2M7 8h7M7 12h7M7 16h4"/>',
};
const nCover = (x) => `<span class="nimg ngen" aria-hidden="true"><svg viewBox="0 0 24 24">${NEWS_ICO[x.kind] || NEWS_ICO.news}</svg><span class="nsrc">${nEsc(x.source)}</span></span>`;
const nBase = (k) => (/^sub-([a-z]+)-\d+$/.exec(k) || [, k])[1];
const nDate = (d) => new Date(String(d).slice(0, 10) + "T12:00:00").toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
const nEsc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const nUrl = (u) => (/^https:\/\//i.test(u || "") ? u : "");
// Does something tagged with these pages belong to page k? The page itself, its subspecialties, or (for a subspecialty) its parent.
const nTouches = (specs, k) => (specs || []).some((s) => s === k || nBase(s) === k || s === nBase(k));
const nName = (k) => {
  const L = typeof slLabel === "function" ? slLabel(k) : null;
  return L ? L.name : k;
};

async function newsLoad() {
  try {
    let items, upd, sweep;
    if (Acct.sb) {
      const [a, b, c] = await Promise.all([
        Acct.sb.from("news_items").select("id,published,specs,kind,title,summary,source,url,image,top").order("published", { ascending: false }).limit(600),
        Acct.sb.from("site_updates").select("id,day,specs,kind,title,body").order("day", { ascending: false }).limit(300),
        Acct.sb.from("news_sweeps").select("ran_at").order("ran_at", { ascending: false }).limit(1),
      ]);
      if (a.error || b.error) throw a.error || b.error;
      items = a.data;
      upd = b.data;
      sweep = c.data && c.data[0] ? c.data[0].ran_at : null;
    } else if (typeof ACCT_CFG !== "undefined" && !ACCT_CFG.url.startsWith("__")) {
      const get = (q) => fetch(`${ACCT_CFG.url}/rest/v1/${q}`, { headers: { apikey: ACCT_CFG.key } }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));
      [items, upd] = await Promise.all([get("news_items?select=*&order=published.desc&limit=600"), get("site_updates?select=*&order=day.desc&limit=300")]);
      const s = await get("news_sweeps?select=ran_at&order=ran_at.desc&limit=1").catch(() => []);
      sweep = s[0] ? s[0].ran_at : null;
    } else throw new Error("not configured");
    NEWS.items = items || [];
    NEWS.upd = upd || [];
    NEWS.sweep = sweep;
  } catch (e) {
    NEWS.off = true; // tables not set up yet, or offline: the tab says so
  }
  NEWS.ready = true;
  newsRefresh();
}

function newsRefresh() {
  const h = location.hash;
  if (/^#account/.test(h) && typeof renderAccount === "function") {
    const y = scrollY;
    renderAccount();
    afterRender();
    scrollTo(0, y);
    return;
  }
  const sel = document.querySelector('.path button[aria-selected="true"]');
  if (sel && sel.textContent === "News") sel.click();
}

function newsCard(x, tag) {
  const url = nUrl(x.url), img = nUrl(x.image);
  return `<a class="ncard k-${nEsc(x.kind)}" href="${nEsc(url)}" target="_blank" rel="noopener">
    ${img ? `<span class="nimg" aria-hidden="true"><img src="${nEsc(img)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.outerHTML=this.parentNode.dataset.cover" data-x></span>`.replace("data-x", `data-cover="${nEsc(nCover(x))}"`) : nCover(x)}
    <span class="nbody"><span class="nmeta"><b class="nk k-${nEsc(x.kind)}">${NEWS_KIND[x.kind] || "News"}</b><span>${nDate(x.published)} · ${nEsc(x.source)}</span>${tag ? `<span class="ntag">${nEsc(tag)}</span>` : ""}</span>
    <b class="nt">${nEsc(x.title)}</b><span class="ns">${nEsc(x.summary)}</span></span></a>`;
}
function newsChanges(list, withPage) {
  return `<ul class="nchg">${list
    .map((u) => `<li><span class="nchgd">${nDate(u.day)}</span><span><b>${nEsc(u.title)}.</b> ${nEsc(u.body)}${withPage ? ` <span class="ntag">${nEsc(withPage(u))}</span>` : ""}</span></li>`)
    .join("")}</ul>`;
}
const newsChecked = () =>
  NEWS.sweep ? `Last checked ${nDate(NEWS.sweep)}. ` : "";

/* The News tab. key is the page ("obgyn" or "sub-obgyn-2"); parent is set on subspecialty pages. */
function newsTab(key, parent) {
  if (!NEWS.ready) return `<div class="nempty">Loading news…</div>`;
  if (NEWS.off) return `<div class="nempty"><b>News is on its way.</b> Stories about this specialty will appear here once our weekly news check starts.</div>`;
  const own = NEWS.items.filter((x) => (x.specs || []).some((s) => s === key || (!parent && nBase(s) === key)));
  const more = parent ? NEWS.items.filter((x) => !own.includes(x) && (x.specs || []).includes(parent)) : [];
  const chg = NEWS.upd.filter((u) => u.kind === "data" && (parent ? (u.specs || []).some((s) => s === key || s === parent) : nTouches(u.specs, key)));
  const subTag = (x) => {
    const s = (x.specs || []).find((s) => s !== key && nBase(s) === key);
    return !parent && s && !(x.specs || []).includes(key) ? nName(s) : "";
  };
  // Recent stories show up front (trends stay a year); older ones go into an Archive grouped by month
  const fresh = (x) => Date.now() - new Date(x.published + "T12:00:00") < (x.kind === "trend" ? 365 : 183) * 864e5;
  const list = (all, tagger) => {
    const arr = all.filter(fresh), old = all.filter((x) => !fresh(x));
    const first = arr.slice(0, 8), rest = arr.slice(8);
    const months = {};
    old.forEach((x) => (months[x.published.slice(0, 7)] = months[x.published.slice(0, 7)] || []).push(x));
    return `${first.length ? `<div class="ngrid">${first.map((x, i) => newsCard(x, tagger && tagger(x)).replace('class="ncard ', i === 0 && nUrl(x.image) ? 'class="ncard nlead ' : 'class="ncard ')).join("")}</div>` : `<div class="nempty">No stories in the last six months.</div>`}${
      rest.length ? `<details class="nmore"><summary>${rest.length} more from the last six months</summary><div class="ngrid">${rest.map((x) => newsCard(x, tagger && tagger(x))).join("")}</div></details>` : ""
    }${
      old.length ? `<details class="nmore narch"><summary>Archive · ${old.length} older ${old.length === 1 ? "story" : "stories"}</summary>${Object.keys(months).sort().reverse().map((m) => `<h4 class="narchm">${new Date(m + "-15T12:00:00").toLocaleDateString("en-CA", { month: "long", year: "numeric" })}</h4><div class="ngrid">${months[m].map((x) => newsCard(x, tagger && tagger(x))).join("")}</div>`).join("")}</details>` : ""
    }`;
  };
  const name = nName(key);
  return `${NEWS.sweep ? `<p class="nlede">${newsChecked().trim()}</p>` : ""}
  <h3>Top stories</h3>${own.length ? list(own, subTag) : `<div class="nempty">No ${nEsc(name)} stories yet. ${NEWS.sweep ? "Nothing new turned up in recent checks." : "The first weekly check hasn’t run yet."}</div>`}
  ${more.length ? `<h3>More ${nEsc(nName(parent))} news</h3>${list(more)}` : ""}
  <h3>Changes on this page</h3>${chg.length ? newsChanges(chg) : `<div class="nempty">No changes to this page have been logged yet.</div>`}`;
}
EXTRA_TABS.push({ name: "News", html: newsTab });
// The page was drawn before this tab existed: redraw once so the tab shows (and #page/news links open it)
if (document.querySelector(".path")) {
  render();
  afterRender();
}

/* My News card in the profile */
function myNewsCard(preview) {
  // preview: a short version for the profile Overview tab, linking to the full News tab
  const favs = shortlist();
  const head = `<h2>${hsvg("star")}My News</h2>`;
  if (!NEWS.ready) return `<section class="hubcard hubwide hubnews">${head}<div class="hubempty">Loading news…</div></section>`;
  if (NEWS.off) return `<section class="hubcard hubwide hubnews">${head}<p class="hubsub">News and page changes for the specialties you’ve starred.</p><div class="hubempty">News is on its way. Stories for your favorites will show up here once our weekly news check starts.</div></section>`;
  if (!favs.length) return `<section class="hubcard hubwide hubnews">${head}<p class="hubsub">News and page changes for the specialties you’ve starred.</p><div class="hubempty">Star a specialty with <b>Save</b> on its page and its news will collect here, and in your Sunday newsletter.</div></section>`;
  const tagOf = (specs) => {
    const f = favs.find((k) => (specs || []).includes(k)) || favs.find((k) => nTouches(specs, k));
    return f ? nName(f) : "";
  };
  // Stories for your favorites, plus the broad ones tagged for everyone (politics, tax, technology and so on)
  const itemsAll = NEWS.items.filter((x) => !(x.specs || []).length || favs.some((k) => nTouches(x.specs, k)));
  const F = NEWS_F;
  const items = preview ? itemsAll : itemsAll.filter((x) => (!F.kinds.size || F.kinds.has(x.kind)) && (!F.specs.size || (F.specs.has("_all") && !(x.specs || []).length) || [...F.specs].some((k) => k !== "_all" && nTouches(x.specs, k))));
  const since = Date.now() - 45 * 864e5;
  const chg = NEWS.upd.filter((u) => u.kind === "data" && new Date(u.day + "T12:00:00") >= since && favs.some((k) => nTouches(u.specs, k)));
  const quiet = favs.filter((k) => !items.some((x) => nTouches(x.specs, k)));
  if (preview) {
    if (!items.length && !chg.length) return "";
    return `<section class="hubcard hubwide hubnews"><div class="hubnewshead">${head}<a class="tbtn" href="#account/news" data-gotab="news">All my news</a></div>
    ${items.length ? `<div class="ngrid">${items.slice(0, preview).map((x) => newsCard(x, tagOf(x.specs))).join("")}</div>` : ""}
    ${chg.length ? newsChanges(chg.slice(0, 2), (u) => tagOf(u.specs)) : ""}</section>`;
  }
  const first = items.slice(0, 6), rest = items.slice(6, 30);
  const kindsHere = Object.keys(NEWS_KIND).filter((k) => itemsAll.some((x) => x.kind === k));
  const chip = (attr, val, label, on) => `<button type="button" class="nfchip${on ? " on" : ""}" ${attr}="${nEsc(val)}" aria-pressed="${on}">${label}</button>`;
  const filters = `<div class="nfilters">
    <div class="nfrow"><span class="nflab">Topics</span>${chip("data-nfk", "", "All", !F.kinds.size)}${kindsHere.map((k) => chip("data-nfk", k, `<i class="nfdot k-${k}"></i>${NEWS_KIND[k]}`, F.kinds.has(k))).join("")}</div>
    <div class="nfrow"><span class="nflab">Specialties</span>${chip("data-nfs", "", "All", !F.specs.size)}${chip("data-nfs", "_all", "Across medicine", F.specs.has("_all"))}${favs.map((k) => chip("data-nfs", k, nEsc(nName(k)), F.specs.has(k))).join("")}</div></div>`;
  return `<section class="hubcard hubwide hubnews">${head}<p class="hubsub">${newsChecked()}Stories and page changes for your ${favs.length} favorite${favs.length === 1 ? "" : "s"}, plus news that matters across medicine. The best of each week also comes in your Sunday newsletter.</p>${filters}
    ${items.length ? `<div class="ngrid">${first.map((x) => newsCard(x, tagOf(x.specs))).join("")}</div>${rest.length ? `<details class="nmore"><summary>${rest.length} more ${rest.length === 1 ? "story" : "stories"}</summary><div class="ngrid">${rest.map((x) => newsCard(x, tagOf(x.specs))).join("")}</div></details>` : ""}` : `<div class="hubempty">${F.kinds.size || F.specs.size ? "No stories match these filters." : `No stories for your favorites yet. ${NEWS.sweep ? "We check every week." : "The first weekly check hasn’t run yet."}`}</div>`}
    ${chg.length ? `<h3 class="nsub">Changed on their pages</h3>${newsChanges(chg, (u) => tagOf(u.specs))}` : ""}
    ${quiet.length && items.length ? `<p class="hubsub nquiet">No news yet for ${quiet.slice(0, 4).map((k) => `<a href="#${nEsc(k)}/news">${nEsc(nName(k))}</a>`).join(", ")}${quiet.length > 4 ? ` and ${quiet.length - 4} more` : ""}.</p>` : ""}
  </section>`;
}

// My News filters (kept for this visit): pick topics and favorites; none picked means all
const NEWS_F = { kinds: new Set(), specs: new Set() };
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-nfk],[data-nfs]");
  if (!b) return;
  const set = b.hasAttribute("data-nfk") ? NEWS_F.kinds : NEWS_F.specs;
  const v = b.getAttribute(b.hasAttribute("data-nfk") ? "data-nfk" : "data-nfs");
  if (!v) set.clear();
  else set.has(v) ? set.delete(v) : set.add(v);
  newsRefresh();
});

newsLoad();
