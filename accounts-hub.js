/* ============================================================
   ACCOUNT HUB (#account): profile and username, top picks, shortlist with private notes,
   quiz results, your tiers, your reports, and account security (password, email,
   sign out everywhere, export, delete).
   ============================================================ */
const HUB_STATUS = { new: ["Received", ""], reviewing: ["Reviewing", "rev"], fixed: ["Fixed", "fix"], wont_fix: ["Won’t change", "wont"] };
const HUB_KIND = { error: "Correction", data: "Data suggestion", idea: "Idea", other: "Other" };
const hubIco = {
  compass: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  user: '<circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  cols: '<path d="M4 5h16v14H4zM9.5 5v14M14.5 5v14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  sliders: '<path d="M5 6h9M18 6h1M5 12h3M12 12h7M5 18h11M20 18h-1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="16" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="10" cy="12" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="18" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  note: '<path d="M6 3.5h9l3.5 3.5v13.5H6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 11h6M9 14.5h6M9 18h3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  up: '<path d="M6 14l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  down: '<path d="M6 10l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  x: '<path d="M7 7l10 10M17 7 7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
};
const hsvg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${hubIco[k]}</svg>`;
const hubName = () => (Acct.prefs.username ? Acct.prefs.username : Acct.user ? Acct.user.email.split("@")[0] : "");
const hubDate = (d) => new Date(d).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
const keyHref = (k) => "#" + k;
const validKeys = (a) => (Array.isArray(a) ? a.filter((k) => slLabel(k)) : []);

let HUB_TAB = 0;
function renderAccount() {
  const main = $("#main");
  if (!Acct.on) {
    main.innerHTML = `<p class="crumb"><a href="#home">Home</a> / Profile</p><h1>Profile</h1><div class="nodata"><b>Accounts aren’t available here.</b> Open the site at projectinfrared.org to sign in.</div>`;
    return;
  }
  if (!Acct.user) {
    main.innerHTML = `<p class="crumb"><a href="#home">Home</a> / Profile</p>
    <section class="hubout"><div><p class="qzkicker">Profile</p><h1>Your profile</h1>
    <p class="hubouttext">Log in to see your quiz results, favorites, notes, tiers and replies to your feedback. A free account keeps them on every device.</p>
    <div class="hubrow"><button type="button" class="btn" data-hub="login">Log in</button><button type="button" class="tbtn" data-hub="signup">Create a free account</button></div></div>
    <ul class="huboutlist">${[["compass", "Specialty match quiz"], ["trophy", "Top picks"], ["star", "Favorites and notes"], ["sliders", "Your own tiers"]].map(([i, t]) => `<li>${hsvg(i)}<span>${t}</span></li>`).join("")}</ul></section>`;
    main.querySelectorAll("[data-hub]").forEach((b) => (b.onclick = () => openAcct(b.dataset.hub)));
    return;
  }
  const P = Acct.prefs;
  const sl = shortlist();
  const picks = validKeys(P.top_picks).filter((k) => sl.includes(k));
  const notes = P.notes || {};
  const nNotes = Object.keys(notes).filter((k) => (notes[k] || "").trim()).length;
  const qz = P.quiz && P.quiz.a && P.quiz.v === QZ_VER ? qzResults(P.quiz.a) : null;
  const reports = Acct.reports || [];
  const label = (k) => {
    const L = slLabel(k);
    return L ? `${acctEsc(L.name)}${L.parent ? `<small>${acctEsc(L.parent)}</small>` : ""}` : acctEsc(k);
  };
  const tierOfKey = (k) => (S.find((x) => x.id === k) ? tierDots(tierOf(k)) : `<span class="hubtag">Fellowship</span>`);

  // --- profile header
  const head = `<div class="hubcard hubhead"><button type="button" class="hublogout" data-hub-logout>Log out</button>
    <div class="hubavatar" aria-hidden="true">${acctEsc(hubName()[0].toUpperCase())}</div>
    <div class="hubwho"><div class="hubname"><span>${acctEsc(hubName())}</span><button type="button" class="hubedit" data-name-edit aria-expanded="false">${P.username ? "Edit name" : "Set your name"}</button></div>
      <div class="hubmail">${acctEsc(Acct.user.email)}</div>
      <form class="hubuser" data-f="username" hidden><label for="h_user" class="sr">Name</label><input id="h_user" type="text" maxlength="30" placeholder="What should we call you?" value="${acctEsc(P.username || "")}" autocomplete="nickname" spellcheck="false"><button class="btn" type="submit">Save</button><button class="tbtn" type="button" data-name-cancel>Cancel</button><span class="hubmsg" role="status"></span></form></div>
    <div class="hubstats">${[
      [sl.length, "Favorites"],
      [picks.length, "Top picks"],
      [nNotes, "Notes"],
      [qz ? qz.list[0].pct + "%" : "–", "Top match"],
      [reports.length, "Reports"],
    ]
      .map(([n, t]) => `<div><b>${n}</b><span>${t}</span></div>`)
      .join("")}</div></div>`;

  // --- top picks
  const pickRows = picks
    .map(
      (k, i) => `<li class="hubpick"><span class="hubrank">${i + 1}</span><a href="${keyHref(k)}" class="hubpname">${label(k)}</a>${tierOfKey(k)}
      <span class="hubctl"><button type="button" data-pick-up="${k}" aria-label="Move up"${i ? "" : " disabled"}>${hsvg("up")}</button><button type="button" data-pick-down="${k}" aria-label="Move down"${i < picks.length - 1 ? "" : " disabled"}>${hsvg("down")}</button><button type="button" data-pick-rm="${k}" aria-label="Remove from top picks">${hsvg("x")}</button></span></li>`,
    )
    .join("");
  const topCard = `<section class="hubcard hubwide"><h2>${hsvg("trophy")}Your top picks</h2><p class="hubsub">Rank up to five specialties or fellowships from your favorites.</p>
    ${picks.length ? `<ol class="hubpicks">${pickRows}</ol>` : `<div class="hubempty">${sl.length ? "Pick from your favorites below with “Add to top picks”." : "Save specialties with the star button on any page, then rank your favourites here."}</div>`}
    ${picks.filter((k) => S.find((x) => x.id === k)).length >= 2 ? `<a class="tbtn" href="#vs-${picks.filter((k) => S.find((x) => x.id === k)).slice(0, 4).join("-")}">${hsvg("cols")}Compare your top picks</a>` : ""}</section>`;

  // --- shortlist with notes
  const slRows = sl
    .map((k) => {
      const n = (notes[k] || "").trim();
      const isPick = picks.includes(k);
      return `<li class="hubsl"><div class="hubslrow"><a href="${keyHref(k)}" class="hubpname">${label(k)}</a>${tierOfKey(k)}
        <span class="hubctl">${isPick ? `<span class="hubtag good">Top pick #${picks.indexOf(k) + 1}</span>` : picks.length < 5 ? `<button type="button" class="hubtext" data-pick-add="${k}">Add to top picks</button>` : ""}<button type="button" class="hubtext" data-note="${k}">${n ? "Edit note" : "Add note"}</button><button type="button" data-sl-rm="${k}" aria-label="Remove from favorites">${hsvg("x")}</button></span></div>
        ${n ? `<p class="hubnote">${hsvg("note")}<span>${acctEsc(n).replace(/\n/g, "<br>")}</span></p>` : ""}</li>`;
    })
    .join("");
  const slCard = `<section class="hubcard"><h2>${hsvg("star")}Favorites</h2><p class="hubsub">Everything you’ve starred, with private notes only you can see.</p>
    ${sl.length ? `<ul class="hublist">${slRows}</ul>` : `<div class="hubempty">Nothing saved yet. Open any specialty or fellowship and press <b>Save to favorites</b>.</div>`}</section>`;

  // --- quiz: "take the quiz" until it's done, then "our picks for you"
  let quizCard;
  if (qz) {
    const arch = qzArch(qz.u);
    quizCard = `<section class="hubcard hubwide hubquiz"><div class="hubquizhead"><div><h2>${hsvg("compass")}Our picks for you</h2><p class="hubsub">From your quiz on ${hubDate(P.quiz.at)} · You’re <b>${acctEsc(arch.name)}</b></p></div>
      <div class="hubrow"><a class="tbtn" href="#quiz">Full breakdown</a><a class="tbtn" href="#quiz/retake">Retake quiz</a></div></div>
      <ol class="hubqz">${qz.list
        .slice(0, 5)
        .map(
          (x, i) => `<li><a href="#quiz/${x.id}" class="hubqzrow"><span class="hubrank">${i + 1}</span><span class="hubqzname"><b>${acctEsc(x.name)}</b>${x.best ? `<small>Best fit: ${acctEsc(x.best.name)} · ${x.best.pct}%</small>` : ""}</span><span class="hubqzbar"><i style="width:${x.pct}%"></i></span><span class="hubqzpct">${x.pct}%</span><span class="hubqzgo" aria-hidden="true">Why →</span></a></li>`,
        )
        .join("")}</ol></section>`;
  } else {
    const d = QZ.draft();
    const n = d && d.a ? Object.keys(d.a).length : 0;
    quizCard = `<section class="hubcard hubwide hubquiz hubquizcta"><div class="hubquizcopy"><h2>${hsvg("compass")}Find your specialty match</h2>
      <p>${QZ_Q.length} questions about how you think, work, handle pressure and want to live. Some are about the work itself; most are about you. You’ll get your top five matches with a percentage for each, why they fit, and the best-fit fellowship inside each.</p>
      <div class="hubrow">${n ? `<a class="btn" href="#quiz/resume">Resume quiz</a><span class="hubsub">${n} of ${QZ_Q.length} answered</span>` : `<a class="btn" href="#quiz/start">Take the quiz</a><span class="hubsub">About 10 minutes</span>`}</div></div>
      <div class="qzintroart" aria-hidden="true">${[94, 88, 83].map((p, i) => `<div class="qzghost" style="--d:${i}">${qzRing(p, 42)}<span><i></i><i></i></span></div>`).join("")}</div></section>`;
  }

  // --- tiers
  const w = MYW.w,
    sum = w.reduce((a, b) => a + b, 0) || 1;
  const mine = tierRank(w);
  const top5 = S.slice().sort((a, b) => mine[a.id].k - mine[b.id].k).slice(0, 5);
  const tierCard = `<section class="hubcard"><h2>${hsvg("sliders")}Your tiers</h2><p class="hubsub">${MYW.on ? "Your weights are on across the site." : "You’re seeing the site’s default tiers."}</p>
    <div class="mywbar">${TIER_F.map(([n, c], i) => (w[i] ? `<i style="flex:${w[i]};background:${c}" title="${n} ${Math.round((w[i] / sum) * 100)}%"></i>` : "")).join("")}</div>
    <div class="hubweights">${TIER_F.map(([n, c], i) => (w[i] ? `<span><i style="background:${c}"></i>${n} ${Math.round((w[i] / sum) * 100)}%</span>` : "")).join("")}</div>
    <p class="hubsub" style="margin-top:12px">Top five with your weights</p><ol class="hubmini">${top5.map((s) => `<li><a href="#${s.id}">${acctEsc(s.name)}</a></li>`).join("")}</ol>
    <div class="hubrow"><label class="vstoggle"><input type="checkbox" id="hubwon"${MYW.on ? " checked" : ""}> Use my weights across the site</label><a class="tbtn" href="#tiers">Edit weights</a></div></section>`;

  // --- reports
  const repCard = `<section class="hubcard hubwide hubreps"><h2>${hsvg("chat")}Your reports</h2><p class="hubsub">Corrections and ideas you’ve sent, and what happened to them.</p>
    ${
      Acct.reportsErr
        ? `<div class="hubempty">${acctEsc(Acct.reportsErr)}</div>`
        : reports.length
          ? `<ul class="hublist">${reports
              .map((r) => {
                const st = HUB_STATUS[r.status] || HUB_STATUS.new;
                return `<li class="hubrep"><div class="hubslrow"><span class="hubpname">${acctEsc(HUB_KIND[r.kind] || "Report")}<small>${acctEsc(r.page || "")} · ${hubDate(r.created_at)}</small></span><span class="hubstatus ${st[1]}">${st[0]}</span></div><p class="hubrepmsg">${acctEsc(r.message.length > 220 ? r.message.slice(0, 220) + "…" : r.message)}</p>${r.reply ? `<p class="hubreply"><b>Reply:</b> ${acctEsc(r.reply)}</p>` : ""}</li>`;
              })
              .join("")}</ul>`
          : `<div class="hubempty">No reports yet. Use <b>Report</b> on any page.</div>`
    }
    <button type="button" class="tbtn" data-hub="feedback">${hsvg("chat")}Send feedback</button></section>`;

  // --- security
  const secCard = `<section class="hubcard hubsec"><h2>${hsvg("lock")}Account and security</h2>
    <div class="hubactions">
      <button type="button" class="hubact" data-hub="password"><b>Change password</b><span>Pick a new password for this account.</span></button>
      <button type="button" class="hubact" data-hub="email"><b>Change email</b><span>We’ll send a link to confirm the new address.</span></button>
      <button type="button" class="hubact" data-hub-do="global"><b>Log out everywhere</b><span>Signs you out on every device, including this one.</span></button>
      <button type="button" class="hubact" data-hub-do="export"><b>Download your data</b><span>Everything saved to your account, as a file.</span></button>
      <button type="button" class="hubact danger" data-hub="delete"><b>Delete account</b><span>Permanently removes your account and saved data.</span></button>
    </div></section>`;

  const legacy = Acct.legacy ? `<div class="hubwarn"><b>One setup step left:</b> run <code>setup2-account-hub.sql</code> in Supabase to turn on usernames, top picks, notes, quiz results and report tracking. Your favorites and tiers already save.</div>` : "";

  // --- tabs, like the specialty pages
  const applying = prepState().applying !== false;
  const news = typeof myNewsCard === "function";
  const TABS = [
    ["Overview", () => `${emailNudge()}${applying ? prepCard() : ""}${news ? myNewsCard(3) : ""}${quizCard}`],
    ["Specialties", () => `${topCard}${slCard}${tierCard}`],
    ["Residency", () => residencyCards()],
    news ? ["News", () => myNewsCard()] : null,
    ["Notifications", () => emailCard()],
    ["Settings", () => `${youCard()}${repCard}${secCard}`],
  ].filter(Boolean);
  // The tab comes from the address (#account/news), so links, reloads and the back button all land on the right tab
  HUB_TAB = Math.max(0, TABS.map((t) => slugOf(t[0])).indexOf((location.hash.split("/")[1] || "").toLowerCase()));
  WANT_TAB = "";
  main.innerHTML = `<p class="crumb"><a href="#home">Home</a> / Profile</p>${legacy}${head}
  <div class="pathanchor"></div><div class="pathwrap"><div class="path hubtabs" role="tablist">${TABS.map((t, i) => `<button role="tab" aria-selected="${i === HUB_TAB}" data-hubtab="${i}">${t[0]}</button>`).join("")}</div></div>
  <div class="panel hubpanel" role="tabpanel"><div class="hubgrid">${TABS[HUB_TAB][1]()}</div></div>`;
  main.querySelectorAll("[data-hubtab]").forEach(
    (b) =>
      (b.onclick = () => {
        const keep = typeof tabsStuck === "function" && tabsStuck();
        HUB_TAB = +b.dataset.hubtab;
        setTabHash("account", HUB_TAB ? slugOf(TABS[HUB_TAB][0]) : "");
        renderAccount();
        afterRender();
        if (keep && typeof toTabs === "function") toTabs();
      }),
  );
  const selTab = main.querySelector('.hubtabs [aria-selected="true"]');
  if (selTab) selTab.parentNode.scrollLeft = Math.max(0, selTab.offsetLeft - 24); // keep the open tab in view on phones
  main.querySelectorAll("[data-gotab]").forEach(
    (a) =>
      (a.onclick = (e) => {
        e.preventDefault();
        const b = main.querySelector(`[data-hubtab="${TABS.map((t) => slugOf(t[0])).indexOf(a.dataset.gotab)}"]`);
        if (b) b.click();
      }),
  );
  wireSettings(main);
  const lo = main.querySelector("[data-hub-logout]");
  if (lo) lo.onclick = () => acctLogout();
  wireHub();
  if (typeof addSiteFoot === "function") addSiteFoot();
}

function hubSave(fields) {
  Object.assign(Acct.prefs, fields);
  acctPush();
  renderAccount();
  buildNav();
}
function wireHub() {
  const m = $("#main");
  const picks = () => validKeys(Acct.prefs.top_picks).filter((k) => shortlist().includes(k));
  m.querySelectorAll("[data-hub]").forEach((b) => (b.onclick = () => openAcct(b.dataset.hub)));
  m.querySelectorAll("[data-pick-add]").forEach((b) => (b.onclick = () => hubSave({ top_picks: picks().concat(b.dataset.pickAdd).slice(0, 5) })));
  m.querySelectorAll("[data-pick-rm]").forEach((b) => (b.onclick = () => hubSave({ top_picks: picks().filter((k) => k !== b.dataset.pickRm) })));
  const move = (k, d) => {
    const a = picks(),
      i = a.indexOf(k),
      j = i + d;
    if (i < 0 || j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    hubSave({ top_picks: a });
  };
  m.querySelectorAll("[data-pick-up]").forEach((b) => (b.onclick = () => move(b.dataset.pickUp, -1)));
  m.querySelectorAll("[data-pick-down]").forEach((b) => (b.onclick = () => move(b.dataset.pickDown, 1)));
  m.querySelectorAll("[data-sl-rm]").forEach(
    (b) =>
      (b.onclick = () => {
        const k = b.dataset.slRm;
        setShortlist(shortlist().filter((x) => x !== k));
        hubSave({ top_picks: picks().filter((x) => x !== k) });
      }),
  );
  m.querySelectorAll("[data-note]").forEach((b) => (b.onclick = () => openAcct("note", b.dataset.note)));
  const won = document.getElementById("hubwon");
  if (won)
    won.onchange = () => {
      MYW.on = won.checked;
      try { localStorage.setItem("ir-weights", JSON.stringify(MYW)); } catch (e) {}
      TIERS = null;
      hubSave({});
    };
  const uf = m.querySelector('form[data-f="username"]');
  const ne = m.querySelector("[data-name-edit]");
  if (uf && ne) {
    const show = (on) => {
      uf.hidden = !on;
      ne.hidden = on;
      ne.setAttribute("aria-expanded", on);
      if (on) {
        const i = uf.querySelector("input");
        i.focus();
        i.select();
      }
    };
    ne.onclick = () => show(true);
    uf.querySelector("[data-name-cancel]").onclick = () => show(false);
    uf.addEventListener("keydown", (e) => e.key === "Escape" && show(false));
  }
  if (uf)
    uf.onsubmit = async (e) => {
      e.preventDefault();
      const msg = uf.querySelector(".hubmsg"),
        v = uf.querySelector("input").value.trim();
      msg.className = "hubmsg";
      if (v.length < 1 || v.length > 30) {
        msg.textContent = "Use 1–30 characters.";
        msg.classList.add("err");
        return;
      }
      if (v === Acct.prefs.username) return renderAccount();
      msg.textContent = "Saving…";
      const { error } = await Acct.sb.from("user_prefs").update({ username: v }).eq("user_id", Acct.user.id);
      if (error) {
        msg.textContent = /column|schema/i.test(error.message) ? "Usernames turn on after the setup step above." : "Couldn’t save. Try again.";
        msg.classList.add("err");
        return;
      }
      Acct.prefs.username = v;
      renderAccount();
      acctBar();
    };
  m.querySelectorAll("[data-hub-do]").forEach(
    (b) =>
      (b.onclick = async () => {
        if (b.dataset.hubDo === "global") {
          await Acct.sb.auth.signOut({ scope: "global" });
          acctAfterSignOut();
        } else if (b.dataset.hubDo === "export") {
          const data = {
            exported: new Date().toISOString(),
            email: Acct.user.email,
            account_created: Acct.user.created_at,
            username: Acct.prefs.username || null,
            shortlist: shortlist(),
            top_picks: Acct.prefs.top_picks || [],
            notes: Acct.prefs.notes || {},
            tier_weights: MYW,
            quiz: Acct.prefs.quiz || null,
            reports: (Acct.reports || []).map(({ kind, page, message, status, reply, created_at }) => ({ kind, page, message, status, reply, created_at })),
          };
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
          a.download = "project-infrared-my-data.json";
          document.body.appendChild(a);
          a.click();
          setTimeout(() => (URL.revokeObjectURL(a.href), a.remove()), 500);
        }
      }),
  );
}
async function hubLoadReports() {
  Acct.reportsErr = null;
  const { data, error } = await Acct.sb.from("feedback").select("kind,page,message,status,reply,created_at").order("created_at", { ascending: false }).limit(50);
  if (error) {
    Acct.reports = [];
    Acct.reportsErr = /permission|column|status/i.test(error.message) ? "Report history turns on after the setup step above." : "Couldn’t load your reports.";
  } else Acct.reports = data || [];
  if (hashParts()[0] === "account") renderAccount();
}

/* ---------- extra dialog views used by the hub ---------- */
Object.assign(VIEWS, {
  note: (k) => {
    const L = slLabel(k) || { name: k };
    return `<h2 id="accttitle">Your note</h2><p class="acctnote">${acctEsc(L.name)}${L.parent ? " · " + acctEsc(L.parent) : ""}. Only you can see this.</p>
    <form data-f="note" data-key="${acctEsc(k)}"><label class="acctf"><span class="sr">Note</span><textarea id="a_note" rows="7" maxlength="2000" placeholder="What draws you to it, who to talk to, electives to book, questions to ask…">${acctEsc((Acct.prefs.notes || {})[k] || "")}</textarea></label>
    <p class="accterr" role="alert"></p><button class="btn acctgo" type="submit">Save note</button></form>`;
  },
  email: () => `<h2 id="accttitle">Change your email</h2><p class="acctnote">Currently <b>${acctEsc(Acct.user.email)}</b>. We’ll send confirmation links; the change takes effect once you confirm.</p>
    <form data-f="email"><label class="acctf"><span>New email</span><input id="a_email" type="email" autocomplete="email" required></label>
    <p class="accterr" role="alert"></p><button class="btn acctgo" type="submit">Send confirmation</button></form>`,
  delete: () => `<h2 id="accttitle">Delete your account?</h2><p class="acctnote">This permanently removes your account, quiz results, favorites, top picks, notes and tiers. Reports you sent are kept without your name so corrections can still be made. This can’t be undone.</p>
    <form data-f="delete"><label class="acctf"><span>Type DELETE to confirm</span><input id="a_confirm" type="text" autocomplete="off" required></label>
    <p class="accterr" role="alert"></p><button class="btn acctgo dangerbtn" type="submit">Delete my account</button></form>`,
});
const _submitAcct = submitAcct;
submitAcct = async function (kind, f) {
  if (!["note", "email", "delete"].includes(kind)) return _submitAcct(kind, f);
  const err = f.querySelector(".accterr"),
    go = f.querySelector(".acctgo");
  err.textContent = "";
  go.disabled = true;
  try {
    if (kind === "note") {
      const k = f.dataset.key,
        v = f.querySelector("#a_note").value.trim().slice(0, 2000);
      const n = Object.assign({}, Acct.prefs.notes || {});
      if (v) n[k] = v;
      else delete n[k];
      Acct.prefs.notes = n;
      acctPush();
      acctDialog().close();
      if (hashParts()[0] === "account") renderAccount();
      else addNoteBadge();
      return;
    }
    if (kind === "email") {
      const email = f.querySelector("#a_email").value.trim();
      const { error } = await Acct.sb.auth.updateUser({ email }, { emailRedirectTo: acctHome() + "?confirmed=1#account" });
      if (error) throw error;
      openAcct("msg", ["Check both inboxes", `We sent confirmation links to your current address and to <b>${acctEsc(email)}</b>. Your email changes once they’re confirmed.`]);
      return;
    }
    if (kind === "delete") {
      if (f.querySelector("#a_confirm").value.trim() !== "DELETE") throw new Error("Type DELETE in capitals to confirm.");
      const { error } = await Acct.sb.rpc("delete_my_account");
      if (error) throw new Error(/function|schema/i.test(error.message) ? "Account deletion turns on after the setup step on your profile page. Nothing was deleted." : error.message);
      await Acct.sb.auth.signOut({ scope: "local" });
      acctAfterSignOut();
      openAcct("msg", ["Your account is deleted", "Everything saved to it has been removed. Thanks for using Project Infrared."]);
      return;
    }
  } catch (e) {
    err.textContent = errText(e);
  }
  go.disabled = false;
};

/* ---------- small hooks elsewhere on the site ---------- */
// Notes button on every specialty and fellowship page
function addNoteBadge() {
  const bar = document.querySelector("#main .pagetools");
  const k = pageKey && pageKey();
  if (!bar || !k) return;
  let b = bar.querySelector('[data-act="note"]');
  const has = Acct.user && ((Acct.prefs.notes || {})[k] || "").trim();
  const html = `<svg viewBox="0 0 24 24" aria-hidden="true">${hubIco.note}</svg><span>Note</span>`;
  if (!b) {
    bar.querySelector('[data-act="link"]').insertAdjacentHTML("beforebegin", `<button type="button" class="ptool" data-act="note">${html}</button>`);
    b = bar.querySelector('[data-act="note"]');
    b.onclick = () => (Acct.user ? openAcct("note", k) : openAcct("login", "Log in to keep private notes on any specialty."));
  } else b.innerHTML = html;
  b.setAttribute("aria-pressed", has ? "true" : "false");
  b.setAttribute("aria-label", has ? "Your note on this page" : "Add a private note");
}

/* Profile card that leads to the residency prep page */
function prepCard() {
  const P = prepState();
  const steps = prepSteps(P), next = steps.find((s) => s.st === "now");
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const days = next ? Math.round((prepDay(next.d) - t) / 864e5) : null;
  const n = P.progs.filter((p) => p.status !== "no").length;
  return `<a class="hubcard hubwide hubprep" href="#prep"><span class="hpl"><span class="prepkick">Residency prep · ${P.year} match</span><b>${next ? next.t : "Plan your match"}</b><small>${next ? prepFmt(next.d, { weekday: "short", month: "short", day: "numeric" }) + " · " : ""}${n} program${n === 1 ? "" : "s"} tracked</small></span>${next ? `<span class="hpc"><b>${days <= 0 ? "Today" : days}</b><small>${days <= 0 ? "" : days === 1 ? "day" : "days"}</small></span>` : ""}<span class="btn hpgo">Open →</span></a>`;
}

/* Settings: where you are in training, whether you're preparing for CaRMS, and which emails you get */
const STAGES = ["Pre-med", "Medical school, year 1", "Medical school, year 2", "Medical school, year 3", "Medical school, year 4", "Resident", "Other"];
// Email consent: nothing is sent unless the member turned email on (at sign-up or here).
function emailOn() {
  const P = prepState();
  P.notify = P.notify || {};
  if (P.notify.email == null && Acct.user && Acct.user.user_metadata && Acct.user.user_metadata.email_ok === true) P.notify.email = true;
  return P.notify.email === true;
}
const hubSw = (key, on, label, sub, off) => `<label class="setrow${off ? " setoff" : ""}"><span><b>${label}</b><small>${sub}</small></span><span class="prepswitch"><input type="checkbox" data-set="${key}"${on ? " checked" : ""}${off ? " disabled" : ""}><span aria-hidden="true"></span><span class="sr">${label}</span></span></label>`;
function youCard() {
  const P = prepState();
  const applying = P.applying !== false;
  return `<section class="hubcard hubwide hubset"><h2>${hsvg("sliders")}You</h2>
  <div class="setgrid"><div class="setcol">
    <label class="setfield"><span>Where you are</span><select data-set="stage"><option value="">Choose</option>${STAGES.map((x) => `<option${P.stage === x ? " selected" : ""}>${x}</option>`).join("")}</select></label>
    ${applying ? `<label class="setfield"><span>Match year</span><select data-set="year">${Object.keys(PREP_TL).map((y) => `<option value="${y}"${+y === P.year ? " selected" : ""}>${y} R-1</option>`).join("")}</select></label>` : ""}</div>
  <div class="setcol">${hubSw("applying", applying, "Preparing for CaRMS", "Shows your residency prep page, countdown and Residency tab")}</div></div></section>`;
}
function emailCard() {
  const P = prepState();
  const N = P.notify;
  const on = emailOn(), applying = P.applying !== false;
  return `<section class="hubcard hubwide hubset hubmail2"><h2>${hsvg("chat")}Email notifications</h2>
  <div class="setmaster">${hubSw("email", on, "Email me from Project Infrared", on ? "Choose what you get below. Every email has a one-click unsubscribe link." : "Off: we won’t email you anything except account emails like password resets.")}</div>
  <div class="setkids${on ? "" : " dim"}">
    ${hubSw("remind", on && applying && P.remind !== false, "CaRMS deadline reminders", applying ? "A week before and the day before each deadline, and the day before interviews you’ve saved" : "Turn on Preparing for CaRMS in Settings first", !on || !applying)}
    ${hubSw("changes", on && N.changes !== false, "Sunday newsletter", "Sunday mornings: news, opportunities and page changes for the specialties you’ve starred", !on)}
    ${hubSw("news", on && !!N.news, "Site news", "New features and big data updates, a few times a year", !on)}
  </div></section>`;
}
function emailNudge() {
  if (emailOn()) return "";
  return `<a class="hubcard hubwide hubnudge" href="#account/notifications" data-gotab="notifications"><span><b>Get your Sunday newsletter</b><small>News for your favorite specialties and CaRMS deadline reminders, by email. Off until you turn it on.</small></span><span class="btn">Turn on</span></a>`;
}
function residencyCards() {
  const P = prepState();
  if (P.applying === false)
    return `<section class="hubcard hubwide"><h2>${hsvg("compass")}Residency prep</h2><div class="hubempty">Turn on <b>Preparing for CaRMS</b> in Settings to get a match timeline, checklist, program tracker and draft rank list.</div><a class="tbtn" href="#account/settings" data-gotab="settings">Open Settings</a></section>`;
  const steps = prepSteps(P).filter((s) => s.st === "now" || s.st === "next").slice(0, 5);
  const progs = P.progs.filter((p) => p.status !== "no");
  const lab = Object.fromEntries(PREP_STATUS);
  return `${prepCard()}<section class="hubcard"><h2>${hsvg("compass")}Coming up</h2><p class="hubsub">${P.year} match</p>
    ${steps.length ? `<ol class="hubdates">${steps.map((s) => `<li class="${s.st}"><span>${prepFmt(s.d, { month: "short", day: "numeric" })}</span><b>${acctEsc(s.t)}</b></li>`).join("")}</ol>` : `<div class="hubempty">No dated steps left for this match year.</div>`}
    <a class="tbtn" href="#prep">Full timeline</a></section>
  <section class="hubcard"><h2>${hsvg("star")}My programs</h2><p class="hubsub">${progs.length} tracked${P.rank.length ? ` · ${P.rank.length} on your draft rank list` : ""}</p>
    ${progs.length ? `<ul class="hubprogs">${progs.slice(0, 8).map((p) => { const x = prepProg(p.k); return `<li><span><b>${acctEsc(x.name)}</b><small>${prepWhere(x.pr)}</small></span><span class="hubtag">${acctEsc(lab[p.status || "considering"] || "")}</span></li>`; }).join("")}</ul>${progs.length > 8 ? `<p class="hubsub">and ${progs.length - 8} more</p>` : ""}` : `<div class="hubempty">Add the programs you’re considering on the prep page.</div>`}
    <a class="tbtn" href="#prep">Manage programs</a></section>`;
}
function wireSettings(main) {
  const P = prepState();
  P.notify = P.notify || {};
  const redraw = () => {
    const y = scrollY;
    acctPush();
    renderAccount();
    afterRender();
    scrollTo(0, y);
  };
  main.querySelectorAll("[data-set]").forEach((el) => {
    el.onchange = () => {
      const k = el.dataset.set, v = el.type === "checkbox" ? el.checked : el.value;
      if (k === "stage") {
        P.stage = v;
        if (P.applying == null) P.applying = /year (3|4)/.test(v);
      } else if (k === "applying") P.applying = v;
      else if (k === "year") P.year = +v;
      else if (k === "remind") P.remind = v;
      else if (k === "email") {
        P.notify.email = v;
        P.notify.email_at = new Date().toISOString();
      } else P.notify[k] = v;
      redraw();
    };
  });
  const r = main.querySelector('[data-set="remind"]');
  if (r && P.applying === false) r.disabled = true;
}
