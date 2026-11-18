/* ============================================================
   RESIDENCY PREP (#prep): members only.
   CaRMS timeline with countdown, a saved checklist, the programs you're
   considering (from CaRMS program descriptions), interview dates and a
   private draft rank list. Saved in user_prefs.prep.
   ============================================================ */
const PREP_TL = {
  // Dates from CaRMS's published R-1 timelines. "manual" steps have no fixed date and are ticked by the student.
  2027: [
    { id: "elect", t: "Electives booked", n: "Through the AFMC Student Portal. Windows vary by host school.", manual: true },
    { id: "pd", t: "Program descriptions reviewed", n: "Shortlist programs below in My programs.", manual: true },
    { id: "open", t: "Applications open", n: "CaRMS Online opens for the 2027 match.", d: "2026-09-09" },
    { id: "trans", t: "Reference translation requests", n: "Only if you need a letter translated.", d: "2026-10-05" },
    { id: "refs", t: "Reference letters due", n: "Referees submit in CaRMS Online by 9 p.m. ET.", d: "2026-11-25" },
    { id: "file", t: "File review opens", n: "Programs start reading applications.", d: "2026-11-26" },
    { id: "int", t: "National interview period", n: "Most interviews are virtual. Add yours in My programs.", d: "2027-01-16", end: "2027-02-07" },
    { id: "rol", t: "Rank order lists due", n: "Programs submit by Feb 11. Check CaRMS Online for your own deadline.", d: "2027-02-11" },
    { id: "match", t: "Match day", n: "Results in CaRMS Online at noon ET.", d: "2027-03-02" },
    { id: "iter2", t: "Second iteration match day", n: "Only if you go unmatched in the first iteration.", d: "2027-04-20" },
  ],
  2028: [
    { id: "elect", t: "Electives booked", n: "Through the AFMC Student Portal. Windows vary by host school.", manual: true },
    { id: "pd", t: "Program descriptions reviewed", n: "Shortlist programs below in My programs.", manual: true },
    { id: "open", t: "Applications open", n: "CaRMS Online opens for the 2028 match.", d: "2027-09-08" },
    { id: "trans", t: "Reference translation requests", n: "Only if you need a letter translated.", d: "2027-10-04" },
    { id: "refs", t: "Reference letters due", n: "Referees submit in CaRMS Online by 9 p.m. ET.", d: "2027-11-24" },
    { id: "file", t: "File review opens", n: "Programs start reading applications.", d: "2027-11-25" },
    { id: "int", t: "National interview period", n: "CaRMS hasn’t published these dates yet.", tba: true },
    { id: "rol", t: "Rank order lists due", n: "CaRMS hasn’t published this date yet.", tba: true },
    { id: "match", t: "Match day", n: "CaRMS hasn’t published this date yet.", tba: true },
  ],
};
const PREP_SRC = "https://www.carms.ca/match/r-1-main-residency-match/applicant/r-1-future-matches-applicant-timeline/";
const PREP_TODO = [
  ["cv", "Update your CV in CaRMS"],
  ["letters", "Write your personal letters"],
  ["refask", "Ask your referees"],
  ["refremind", "Remind referees before the deadline"],
  ["photo", "Add a photo and supporting documents"],
  ["interview", "Practise interview questions"],
  ["travel", "Plan interview travel or set up for virtual interviews"],
  ["rank", "Draft your rank list"],
];
const PREP_STATUS = [
  ["considering", "Considering"],
  ["applied", "Applied"],
  ["invited", "Invited"],
  ["interviewed", "Interviewed"],
  ["ranked", "Ranked"],
  ["no", "Not applying"],
];
const prepIco = {
  cal: '<rect x="4" y="5.5" width="16" height="14.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  up: '<path d="M6 14l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  down: '<path d="M6 10l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  x: '<path d="M7 7l10 10M17 7 7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>',
};
const pIco = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${prepIco[k]}</svg>`;

function prepState() {
  const P = (Acct.prefs.prep = Acct.prefs.prep && typeof Acct.prefs.prep === "object" ? Acct.prefs.prep : {});
  const now = new Date();
  // Default match year: the cycle whose match day is still ahead
  if (!PREP_TL[P.year]) P.year = now < new Date("2027-03-02") ? 2027 : 2028;
  P.steps = P.steps || {};
  P.todo = P.todo || {};
  P.custom = Array.isArray(P.custom) ? P.custom : [];
  P.progs = Array.isArray(P.progs) ? P.progs.filter((p) => prepProg(p.k)) : [];
  P.rank = Array.isArray(P.rank) ? P.rank.filter((k) => P.progs.some((p) => p.k === k)) : [];
  if (P.remind == null) P.remind = true;
  return P;
}
function prepSave() {
  acctPush();
}
function prepProg(k) {
  const [sid, i] = String(k || "").split("|");
  const d = CPD2[sid];
  const pr = d && d.programs && d.programs[+i];
  const sp = S.find((x) => x.id === sid);
  return pr ? { sid, sp, pr, name: sp ? sp.name : sid === "fmem" ? "Emergency Medicine (CCFP-EM)" : sid } : null;
}
const prepDay = (s) => new Date(s + "T12:00:00");
const prepFmt = (s, o) => prepDay(s).toLocaleDateString("en-CA", o || { month: "short", day: "numeric" });
function prepSteps(P) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let nextFound = false;
  return PREP_TL[P.year].map((s) => {
    let st;
    if (s.manual) st = P.steps[s.id] ? "done" : "todo";
    else if (s.tba) st = "tba";
    else {
      const last = prepDay(s.end || s.d);
      if (last < today) st = "done";
      else if (!nextFound) {
        st = "now";
        nextFound = true;
      } else st = "next";
    }
    return Object.assign({}, s, { st });
  });
}
function renderPrep(into) {
  const main = $("#main");
  const crumb = `<p class="crumb"><a href="#home">Home</a> / <a href="#account">Profile</a> / Residency prep</p>`;
  if (!Acct.on || !Acct.user) {
    main.innerHTML = `${crumb}<h1>Residency prep</h1>
    <div class="preplock"><div class="preplockbg" aria-hidden="true"><div></div><span></span><span></span><span></span><span></span></div>
    <div class="preplockcard">${pIco("lock")}<h2>Your match, step by step</h2>
    <p>Every CaRMS deadline for your match year with a countdown, a checklist that saves, the programs you’re considering side by side, your interview dates and a draft rank list. Free with an account.</p>
    ${Acct.on ? `<div class="hubrow"><button type="button" class="btn" data-pl="signup">Create a free account</button><button type="button" class="tbtn" data-pl="login">Log in</button></div>` : `<p class="note">Accounts work on projectinfrared.org.</p>`}</div></div>`;
    main.querySelectorAll("[data-pl]").forEach((b) => (b.onclick = () => openAcct(b.dataset.pl, b.dataset.pl === "login" ? "Log in to open your residency prep page." : "")));
    return;
  }
  const P = prepState();
  const steps = prepSteps(P);
  const next = steps.find((s) => s.st === "now");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = next ? Math.round((prepDay(next.d) - today) / 864e5) : null;
  const doneCount = steps.filter((s) => s.st === "done").length;
  const todoAll = PREP_TODO.map(([id, t]) => ({ id, t, done: !!P.todo[id], own: false })).concat(P.custom.map((c) => ({ id: c.id, t: c.t, done: !!c.done, own: true })));
  const todoDone = todoAll.filter((t) => t.done).length;
  const ints = P.progs.filter((p) => p.date).sort((a, b) => a.date.localeCompare(b.date));
  const active = P.progs.filter((p) => p.status !== "no");
  const favs = shortlist().filter((k) => S.find((x) => x.id === k));

  const hero = next
    ? `<section class="prephero"><div class="prephl"><span class="prepkick">Next deadline</span><h2>${next.t}</h2>
      <p>${prepFmt(next.d, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}${next.end ? ` to ${prepFmt(next.end, { month: "long", day: "numeric" })}` : ""}. ${next.n}</p>
      <div class="hubrow"><a class="btn" href="${prepIcs(next)}" download="${next.id}.ics">${pIco("cal")}Add to calendar</a></div></div>
      <div class="prephr"><div class="prepcount"><b>${days <= 0 ? "Today" : days}</b><span>${days <= 0 ? "" : days === 1 ? "day left" : "days left"}</span></div>
      <ul class="prepmini"><li><i></i>${doneCount} of ${steps.length} steps done</li><li><i></i>${active.length} program${active.length === 1 ? "" : "s"} tracked</li><li><i class="${ints.length ? "" : "off"}"></i>${ints.length} interview${ints.length === 1 ? "" : "s"} scheduled</li></ul></div></section>`
    : `<section class="prephero"><div class="prephl"><span class="prepkick">${P.year} match</span><h2>${steps.every((s) => s.st === "done" || s.st === "todo") ? "All deadlines have passed" : "Dates coming soon"}</h2><p>Switch the match year above to plan the next cycle.</p></div></section>`;

  const tl = `<section class="prepcard"><div class="prephead"><h2>${P.year} R-1 match, first iteration</h2><span>${doneCount} of ${steps.length} done</span></div>
    <ol class="preptl">${steps
      .map(
        (s) => `<li class="st-${s.st}"><span class="ptdot">${s.st === "done" ? pIco("check") : s.st === "now" ? "!" : ""}</span>
      <span class="ptbody"><b>${s.t}</b><small>${s.n}</small>${s.manual ? `<label class="ptmanual"><input type="checkbox" data-step="${s.id}"${P.steps[s.id] ? " checked" : ""}> Done</label>` : ""}</span>
      <span class="ptdate">${s.manual ? "" : s.tba ? "TBA" : prepFmt(s.d) + (s.end ? " – " + prepFmt(s.end) : "")}</span></li>`,
      )
      .join("")}</ol>
    <p class="note">Dates from <a href="${PREP_SRC}" target="_blank" rel="noopener">CaRMS’s published R-1 timeline ↗</a>. CaRMS says they can change; we update this page when they do.</p></section>`;

  const todo = `<section class="prepcard"><div class="prephead"><h2>My checklist</h2><span>${todoDone} of ${todoAll.length}</span></div>
    <div class="preptodo">${todoAll
      .map((t) => `<label class="${t.done ? "done" : ""}"><input type="checkbox" data-todo="${t.id}"${t.own ? ' data-own="1"' : ""}${t.done ? " checked" : ""}><span>${acctEsc(t.t)}</span>${t.own ? `<button type="button" class="prepx" data-deltodo="${t.id}" aria-label="Remove ${acctEsc(t.t)}">${pIco("x")}</button>` : ""}</label>`)
      .join("")}</div>
    <form class="prepadd" data-addtodo><label class="sr" for="p_todo">Add your own item</label><input id="p_todo" type="text" maxlength="80" placeholder="Add your own item"><button class="tbtn" type="submit">Add</button></form></section>`;

  const intCard = `<section class="prepcard"><div class="prephead"><h2>My interviews</h2><span>${ints.length}</span></div>${
    ints.length
      ? `<ul class="prepints">${ints
          .map((p) => {
            const g = prepProg(p.k);
            return `<li><span class="pidate"><b>${prepFmt(p.date, { day: "numeric" })}</b><small>${prepFmt(p.date, { month: "short" })}</small></span><span><b>${acctEsc(g.name)}</b><small>${prepWhere(g.pr)}</small></span></li>`;
          })
          .join("")}</ul>`
      : `<p class="note">When an invite comes in, set the program to Invited and add the date in My programs.</p>`
  }</section>`;

  const favCard = favs.length
    ? `<section class="prepcard prepfav"><h2>For your favorites</h2>${favs
        .slice(0, 4)
        .map((k) => {
          const sp = S.find((x) => x.id === k);
          const n = (CPD2[k] && CPD2[k].programs || []).length;
          const bits = [sp.pos != null ? `${sp.pos} seats in 2026` : "", sp.ratio ? `${fmtRatio(sp.ratio)} seats per first-choice applicant` : "", n ? `${n} program streams` : ""].filter(Boolean);
          return `<p><b>${sp.name}</b> · ${bits.join(" · ")}${sp.ratio && sp.ratio < 0.8 ? ". Competitive: plan a backup before you rank." : "."}</p>`;
        })
        .join("")}<a href="#account">Edit favorites →</a></section>`
    : "";

  const remind = `<section class="prepcard prepremind"><span><b>Email reminders</b><small>A week before and the day before each deadline, plus the day before any interview you add.</small></span>
    <label class="prepswitch"><input type="checkbox" data-remind${P.remind ? " checked" : ""}><span aria-hidden="true"></span><span class="sr">Email reminders</span></label></section>`;

  // My programs
  const pick = P.pick && CPD2[P.pick] ? P.pick : favs.find((k) => CPD2[k]) || "ophthalmology";
  const specOpts = Object.keys(CPD2)
    .filter((k) => !k.startsWith("sub:"))
    .map((k) => [k, (S.find((x) => x.id === k) || {}).name || (k === "fmem" ? "Emergency Medicine (CCFP-EM)" : k)])
    .sort((a, b) => (favs.includes(b[0]) - favs.includes(a[0])) || a[1].localeCompare(b[1]));
  const progList = (CPD2[pick].programs || []).map((pr, i) => {
    const k = pick + "|" + i, on = P.progs.some((p) => p.k === k);
    return `<label class="pplrow${on ? " on" : ""}"><input type="checkbox" data-addprog="${k}"${on ? " checked" : ""}><span><b>${acctEsc(pr.school)}</b>${prepStream(pr.stream) ? `<small>${acctEsc(prepStream(pr.stream))}</small>` : ""}</span><span class="pplnum"><b>${pr.quota ?? "—"}</b><small>seats</small></span><span class="pplnum"><b>${acctEsc(pr.invite || "—")}</b><small>invited</small></span></label>`;
  });
  const rows = P.progs
    .map((p) => {
      const g = prepProg(p.k), pr = g.pr;
      return `<tr data-k="${p.k}"><td><b>${acctEsc(g.name)}</b><small>${prepWhere(pr)}</small></td>
      <td data-l="Seats">${pr.quota ?? "—"}</td><td data-l="Applicants">${acctEsc(pr.apps || "—")}</td><td data-l="Invited">${acctEsc(pr.invite || "—")}${/^0–25/.test(pr.invite || "") ? ' <span class="pflag">Selective</span>' : ""}</td>
      <td data-l="Onsite elective">${prepOnsite(pr.onsite)}</td>
      <td data-l="Status"><select data-status aria-label="Status">${PREP_STATUS.map(([v, l]) => `<option value="${v}"${(p.status || "considering") === v ? " selected" : ""}>${l}</option>`).join("")}</select></td>
      <td data-l="Interview"><input type="date" data-date value="${p.date || ""}" aria-label="Interview date"></td>
      <td><button type="button" class="prepx" data-rmprog aria-label="Remove">${pIco("x")}</button></td></tr>`;
    })
    .join("");
  const progs = `<section class="prepcard prepwide"><div class="prephead"><h2>My programs</h2><span>${active.length} tracked</span></div>
    <div class="ppick"><label>Specialty <select data-pick>${specOpts.map(([k, n]) => `<option value="${k}"${k === pick ? " selected" : ""}>${favs.includes(k) ? "★ " : ""}${acctEsc(n)}</option>`).join("")}</select></label>
    <p class="note">Tick the programs you’re considering. Numbers come from each program’s CaRMS description.</p></div>
    <div class="ppl">${progList.join("") || `<p class="note">No program list for this specialty yet.</p>`}</div>
    ${rows ? `<div class="tw prepttw"><table class="preptable"><thead><tr><th>Program</th><th>Seats</th><th>Applicants</th><th>Invited</th><th>Onsite elective</th><th>Status</th><th>Interview</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>` : `<p class="prepempty">No programs yet. Pick a specialty and tick a few programs above.</p>`}</section>`;

  // Draft rank list
  const rankable = P.progs.filter((p) => ["applied", "invited", "interviewed", "ranked"].includes(p.status));
  rankable.forEach((p) => !P.rank.includes(p.k) && P.rank.push(p.k));
  const order = P.rank.filter((k) => rankable.some((p) => p.k === k));
  const rank = `<section class="prepcard prepwide"><div class="prephead"><h2>Draft rank list</h2><span>${order.length}</span></div>${
    order.length
      ? `<ol class="preprank">${order
          .map((k, i) => {
            const g = prepProg(k);
            return `<li data-k="${k}"><span class="prnum">${i + 1}</span><span><b>${acctEsc(g.name)}</b><small>${prepWhere(g.pr)}</small></span><span class="prctl"><button type="button" data-rk="-1" aria-label="Move up"${i ? "" : " disabled"}>${pIco("up")}</button><button type="button" data-rk="1" aria-label="Move down"${i < order.length - 1 ? "" : " disabled"}>${pIco("down")}</button></span></li>`;
          })
          .join("")}</ol><p class="note">A private draft only. Your real list is submitted in CaRMS Online.</p>`
      : `<p class="prepempty">Programs appear here once you mark them Applied, Invited or Interviewed.</p>`
  }</section>`;

  const yearSel = `<label class="prepyear">Match year <select data-year>${Object.keys(PREP_TL).map((y) => `<option value="${y}"${+y === P.year ? " selected" : ""}>${y} R-1</option>`).join("")}</select></label>`;
  const body = `${hero}<div class="prepgrid"><div class="prepcol">${tl}</div><div class="prepcol">${todo}${intCard}${favCard}${into ? "" : remind}</div></div>${progs}${rank}`;
  // Inside the profile's Residency tab: hand the page back instead of drawing it
  if (into) return `<div class="prepintab"><div class="prepinbar"><span class="prepinsub">${P.year} R-1 match · saves to your account</span>${yearSel}</div>${body}</div>`;
  main.innerHTML = `${crumb}<div class="spechead"><h1>Residency prep</h1>${yearSel}</div>${body}`;
  wirePrep(P);
}
const prepWhere = (pr) => acctEsc([pr.school, prepStream(pr.stream)].filter(Boolean).join(" · "));
const prepStream = (s) => String(s || "").replace(/\s+for\s+(CMG|IMG)$/i, "");
function prepOnsite(t) {
  t = String(t || "");
  if (!t || /unknown|not (stated|specified)/i.test(t)) return "Not stated";
  if (/do not require|not required|no requirement|not necessary/i.test(t)) return "Not required";
  if (/strongly|recommend|encourag/i.test(t)) return "Recommended";
  if (/require/i.test(t)) return "Required";
  return "See description";
}
function prepIcs(s) {
  const d = (x) => x.replace(/-/g, "");
  const end = new Date(prepDay(s.end || s.d).getTime() + 864e5).toISOString().slice(0, 10).replace(/-/g, "");
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Project Infrared//Residency prep//EN", "BEGIN:VEVENT", `UID:${s.id}-${d(s.d)}@projectinfrared.org`, `DTSTART;VALUE=DATE:${d(s.d)}`, `DTEND;VALUE=DATE:${end}`, `SUMMARY:CaRMS: ${s.t}`, `DESCRIPTION:${s.n}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(body);
}
function wirePrep(P) {
  const main = $("#main");
  const redraw = () => {
    const y = scrollY;
    prepSave();
    if (hashParts()[0] === "account") renderAccount(); // the prep page lives in the profile's Residency tab
    else renderPrep();
    afterRender();
    scrollTo(0, y);
  };
  main.querySelector("[data-year]").onchange = (e) => ((P.year = +e.target.value), redraw());
  main.querySelectorAll("[data-step]").forEach((c) => (c.onchange = () => ((P.steps[c.dataset.step] = c.checked), redraw())));
  main.querySelectorAll("[data-todo]").forEach(
    (c) =>
      (c.onchange = () => {
        if (c.dataset.own) {
          const it = P.custom.find((x) => x.id === c.dataset.todo);
          if (it) it.done = c.checked;
        } else P.todo[c.dataset.todo] = c.checked;
        redraw();
      }),
  );
  main.querySelectorAll("[data-deltodo]").forEach((b) => (b.onclick = (e) => (e.preventDefault(), (P.custom = P.custom.filter((x) => x.id !== b.dataset.deltodo)), redraw())));
  const af = main.querySelector("[data-addtodo]");
  af.onsubmit = (e) => {
    e.preventDefault();
    const v = af.querySelector("input").value.trim();
    if (!v || P.custom.length >= 30) return;
    P.custom.push({ id: "c" + Date.now().toString(36), t: v.slice(0, 80), done: false });
    redraw();
  };
  const rm = main.querySelector("[data-remind]");
  if (rm) rm.onchange = () => ((P.remind = rm.checked), prepSave());
  main.querySelector("[data-pick]").onchange = (e) => ((P.pick = e.target.value), redraw());
  main.querySelectorAll("[data-addprog]").forEach(
    (c) =>
      (c.onchange = () => {
        const k = c.dataset.addprog;
        if (c.checked) {
          if (P.progs.length < 60 && !P.progs.some((p) => p.k === k)) P.progs.push({ k, status: "considering", date: "" });
        } else {
          P.progs = P.progs.filter((p) => p.k !== k);
          P.rank = P.rank.filter((x) => x !== k);
        }
        redraw();
      }),
  );
  main.querySelectorAll(".preptable tr[data-k]").forEach((tr) => {
    const p = P.progs.find((x) => x.k === tr.dataset.k);
    tr.querySelector("[data-status]").onchange = (e) => {
      p.status = e.target.value;
      if (p.status === "no") P.rank = P.rank.filter((x) => x !== p.k);
      redraw();
    };
    tr.querySelector("[data-date]").onchange = (e) => {
      p.date = e.target.value;
      if (p.date && ["considering", "applied"].includes(p.status)) p.status = "invited";
      redraw();
    };
    tr.querySelector("[data-rmprog]").onclick = () => {
      P.progs = P.progs.filter((x) => x.k !== p.k);
      P.rank = P.rank.filter((x) => x !== p.k);
      redraw();
    };
  });
  main.querySelectorAll(".preprank li").forEach((li) =>
    li.querySelectorAll("[data-rk]").forEach(
      (b) =>
        (b.onclick = () => {
          const i = P.rank.indexOf(li.dataset.k), j = i + +b.dataset.rk;
          const vis = [...main.querySelectorAll(".preprank li")].map((x) => x.dataset.k);
          const vi = vis.indexOf(li.dataset.k), other = vis[vi + +b.dataset.rk];
          if (i < 0 || !other) return;
          const oj = P.rank.indexOf(other);
          [P.rank[i], P.rank[oj]] = [P.rank[oj], P.rank[i]];
          redraw();
        }),
    ),
  );
}
