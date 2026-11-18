/* Specialty news (hosted build only).
   - A News tab on every specialty and subspecialty page: top stories with links, plus changes we made to that page.
   - My News in the profile: the same, for the specialties you've starred.
   Stories live in Supabase (news_items, site_updates, news_sweeps), added each week by the news check. */
const NEWS = { items: [], upd: [], sweep: null, ready: false, off: false };
const NEWS_KIND = { policy: "Policy", match: "Match", pay: "Pay", jobs: "Jobs", opportunity: "Opportunity", research: "Research", news: "News" };
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
  return `<a class="ncard k-${nEsc(x.kind)}${img ? "" : " noimg"}" href="${nEsc(url)}" target="_blank" rel="noopener">
    ${img ? `<span class="nimg" aria-hidden="true"><img src="${nEsc(img)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.parentNode.classList.add('noimg');this.parentNode.remove()"></span>` : ""}
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
  const list = (arr, tagger) => {
    const first = arr.slice(0, 8), rest = arr.slice(8);
    return `<div class="ngrid">${first.map((x, i) => newsCard(x, tagger && tagger(x)).replace('class="ncard ', i === 0 && nUrl(x.image) ? 'class="ncard nlead ' : 'class="ncard ')).join("")}</div>${
      rest.length ? `<details class="nmore"><summary>${rest.length} older ${rest.length === 1 ? "story" : "stories"}</summary><div class="ngrid">${rest.map((x) => newsCard(x, tagger && tagger(x))).join("")}</div></details>` : ""
    }`;
  };
  const name = nName(key);
  return `<p class="nlede">${newsChecked()}Each week we check CaRMS, the colleges, the OMA, specialty societies, hospitals and the news for anything that affects ${nEsc(name)}: match and training changes, pay and fee updates, jobs, policy and opportunities. Summaries are ours; follow each link for the full story.</p>
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
  const items = NEWS.items.filter((x) => favs.some((k) => nTouches(x.specs, k)));
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
  return `<section class="hubcard hubwide hubnews">${head}<p class="hubsub">${newsChecked()}Stories and page changes for your ${favs.length} favorite${favs.length === 1 ? "" : "s"}. The best of each week also comes in your Sunday newsletter.</p>
    ${items.length ? `<div class="ngrid">${first.map((x) => newsCard(x, tagOf(x.specs))).join("")}</div>${rest.length ? `<details class="nmore"><summary>${rest.length} more ${rest.length === 1 ? "story" : "stories"}</summary><div class="ngrid">${rest.map((x) => newsCard(x, tagOf(x.specs))).join("")}</div></details>` : ""}` : `<div class="hubempty">No stories for your favorites yet. ${NEWS.sweep ? "We check every week." : "The first weekly check hasn’t run yet."}</div>`}
    ${chg.length ? `<h3 class="nsub">Changed on their pages</h3>${newsChanges(chg, (u) => tagOf(u.specs))}` : ""}
    ${quiet.length && items.length ? `<p class="hubsub nquiet">No news yet for ${quiet.slice(0, 4).map((k) => `<a href="#${nEsc(k)}/news">${nEsc(nName(k))}</a>`).join(", ")}${quiet.length > 4 ? ` and ${quiet.length - 4} more` : ""}.</p>` : ""}
  </section>`;
}

newsLoad();
