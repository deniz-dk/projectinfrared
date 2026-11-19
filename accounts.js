/* ============================================================
   ACCOUNTS (hosted site only): email/password sign-in through Supabase,
   shortlist + tier weights + sidebar sort synced to the account, and a feedback form.
   Logged-out visitors can still browse everything; saving a shortlist, using custom
   tiers across the site and sending feedback ask them to log in.
   ============================================================ */
const ACCT_CFG = {
  url: "__SUPABASE_URL__",
  key: "__SUPABASE_KEY__",
};
const Acct = { sb: null, user: null, on: false, pulling: false, prefs: {}, legacy: false, reports: [], reportsErr: null };
const acctEsc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const acctHome = () => location.origin + location.pathname;

/* ---------- sync ---------- */
let acctPushTimer = null;
function acctPush() {
  if (!Acct.user || Acct.pulling) return;
  clearTimeout(acctPushTimer);
  acctPushTimer = setTimeout(async () => {
    const sb = $("#sortby");
    const row = {
      user_id: Acct.user.id,
      shortlist: shortlist(),
      weights: MYW,
      sort: sb ? sb.value : null,
      updated_at: new Date().toISOString(),
    };
    if (!Acct.legacy) {
      const sl = shortlist();
      Object.assign(row, {
        top_picks: (Acct.prefs.top_picks || []).filter((k) => sl.includes(k)).slice(0, 5),
        notes: Acct.prefs.notes || {},
        quiz: Acct.prefs.quiz || null,
      });
      if (!Acct.noPrep) row.prep = Acct.prefs.prep || null;
    }
    let { error } = await Acct.sb.from("user_prefs").upsert(row);
    if (error && "prep" in row && /prep/i.test(error.message)) {
      // The residency-prep database column hasn't been added yet: save everything else.
      Acct.noPrep = true;
      delete row.prep;
      ({ error } = await Acct.sb.from("user_prefs").upsert(row));
    }
    if (error && !Acct.legacy && /column|schema cache/i.test(error.message)) {
      // The account-hub database upgrade hasn't been run yet: keep saving the basics.
      Acct.legacy = true;
      ["top_picks", "notes", "quiz"].forEach((k) => delete row[k]);
      ({ error } = await Acct.sb.from("user_prefs").upsert(row));
      if (hashParts()[0] === "account") renderAccount();
    }
    if (error) console.warn("Couldn't save to your account:", error.message);
  }, 500);
}
window.acctPush = acctPush;
async function acctPull() {
  Acct.pulling = true;
  try {
    const { data, error } = await Acct.sb.from("user_prefs").select("*").eq("user_id", Acct.user.id).maybeSingle();
    if (error) throw error;
    if (data) Acct.legacy = !("top_picks" in data);
    Acct.prefs = {
      username: (data && data.username) || null,
      top_picks: (data && Array.isArray(data.top_picks) && data.top_picks) || [],
      notes: (data && data.notes && typeof data.notes === "object" && data.notes) || {},
      comparisons: (data && Array.isArray(data.comparisons) && data.comparisons) || [],
      quiz: (data && data.quiz) || null,
      prep: (data && data.prep && typeof data.prep === "object" && data.prep) || null,
      created_at: (data && data.created_at) || null,
    };
    const local = shortlist();
    const remote = data && Array.isArray(data.shortlist) ? data.shortlist : [];
    setShortlist([...new Set(remote.concat(local))].filter((k) => slLabel(k)));
    if (data && data.weights && Array.isArray(data.weights.w) && data.weights.w.length === TIER_DEF.length) MYW = { w: data.weights.w.map((v) => Math.max(0, Math.min(5, +v || 0))), on: !!data.weights.on };
    try { localStorage.setItem("ir-weights", JSON.stringify(MYW)); } catch (e) {}
    const sb = $("#sortby");
    if (data && data.sort && sb && [...sb.options].some((o) => o.value === data.sort)) {
      sb.value = data.sort;
      try { localStorage.setItem("ir-sort", data.sort); } catch (e) {}
    }
  } catch (e) {
    console.warn("Couldn't load your account data:", e.message || e);
  }
  Acct.pulling = false;
  TIERS = null;
  acctPush(); // writes the merged result back (creates the row on first sign-in)
  refreshAll();
  hubLoadReports();
}
function refreshAll() {
  const y = window.scrollY;
  buildNav();
  render();
  mark();
  window.scrollTo(0, y);
  acctBar();
}

/* ---------- sidebar account row ---------- */
function acctBar() {
  let el = document.querySelector(".acctbar");
  if (!el) {
    document.querySelector(".brand-sub").insertAdjacentHTML("afterend", '<div class="acctbar"></div>');
    el = document.querySelector(".acctbar");
  }
  if (!Acct.on) {
    el.remove();
    return;
  }
  el.classList.toggle("in", !!Acct.user);
  // Phone menu bar: show the user's initial once logged in, the generic icon otherwise
  const pb = document.querySelector(".profbtn");
  if (pb) {
    const ini = Acct.user ? (Acct.prefs.username || Acct.user.email || "?")[0].toUpperCase() : "";
    pb.classList.toggle("in", !!Acct.user);
    pb.innerHTML = Acct.user ? `<span class="profini">${acctEsc(ini)}</span>` : hsvg("user");
    pb.setAttribute("aria-label", Acct.user ? "Your profile" : "Log in or create an account");
  }
  const onProfile = hashParts()[0] === "account";
  el.innerHTML = Acct.user
    ? `<div class="acctglow" aria-hidden="true"></div><div class="acctwho"><span class="acctdot" aria-hidden="true">${acctEsc((Acct.prefs.username || Acct.user.email)[0].toUpperCase())}</span><span class="acctid"><span class="acctmail" title="${acctEsc(Acct.prefs.username || Acct.user.email)}">${acctEsc(Acct.prefs.username || Acct.user.email.split("@")[0])}</span><span class="acctsub">${shortlist().length} favorite${shortlist().length === 1 ? "" : "s"}</span></span></div><button type="button" class="acctprofile" data-a="account"${onProfile ? ' aria-current="page"' : ""}>${hsvg("user")}<span>Profile</span><svg class="acctarrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="acctlinks"><button type="button" data-a="feedback">Send feedback</button><button type="button" data-a="logout">Log out</button></div>`
    : `<div class="acctlinks out"><button type="button" class="acctprimary" data-a="signup">Create account</button><button type="button" data-a="login">Log in</button></div><p class="acctwhy">Free account: save favorites, keep notes, build your own tiers and send feedback.</p>`;
  el.querySelectorAll("button[data-a]").forEach(
    (b) =>
      (b.onclick = () => {
        const a = b.dataset.a;
        if (a === "logout") acctLogout();
        else if (a === "account") location.hash = "account";
        else openAcct(a);
      }),
  );
}

/* ---------- dialog ---------- */
function acctDialog() {
  let d = document.getElementById("acctdlg");
  if (!d) {
    document.body.insertAdjacentHTML("beforeend", '<dialog id="acctdlg" aria-labelledby="accttitle"><button type="button" class="acctx" aria-label="Close">✕</button><div class="acctbody"></div></dialog>');
    d = document.getElementById("acctdlg");
    d.querySelector(".acctx").onclick = () => d.close();
    d.addEventListener("click", (e) => {
      if (e.target === d) d.close();
    });
    window.addEventListener("hashchange", () => d.open && d.close());
  }
  return d;
}
const pwField = (id, label, auto) =>
  `<label class="acctf"><span>${label}</span><span class="pwwrap"><input id="${id}" type="password" autocomplete="${auto}" required minlength="8"><button type="button" class="pwshow" data-for="${id}">Show</button></span></label>`;
const VIEWS = {
  login: (why) => `<button type="button" class="acctnew" data-go="signup"><span><b>New here?</b> Create a free account</span><span aria-hidden="true">→</span></button><h2 id="accttitle">Log in</h2>${why ? `<p class="acctnote">${acctEsc(why)}</p>` : ""}
    <form data-f="login"><label class="acctf"><span>Email</span><input id="a_email" type="email" autocomplete="email" required></label>${pwField("a_pw", "Password", "current-password")}
    <p class="accterr" role="alert"></p><button class="btn acctgo" type="submit">Log in</button></form>
    <p class="acctalt"><button type="button" data-go="forgot">Forgot your password?</button> · <button type="button" data-go="signup">Create an account</button></p>`,
  signup: (why) => `<h2 id="accttitle">Create your account</h2><p class="acctnote">${why ? acctEsc(why) + " " : ""}Free. Your favorites, notes and tiers follow you to any device, and you can send feedback and corrections.</p>
    <form data-f="signup"><label class="acctf"><span>Email</span><input id="a_email" type="email" autocomplete="email" required></label>${pwField("a_pw", "Password (8+ characters)", "new-password")}
    <label class="acctcheck"><input id="a_terms" type="checkbox" required><span>I’m 16 or older and agree to the <a href="#terms" target="_blank" rel="noopener">Terms of Use</a> and <a href="#privacy" target="_blank" rel="noopener">Privacy Policy</a>. I understand this site gives general information, not career, financial or legal advice.</span></label>
    <label class="acctcheck"><input id="a_mail" type="checkbox"><span>Email me CaRMS deadline reminders and the Sunday newsletter with news for my favorite specialties. Optional; you can turn this off any time.</span></label>
    <p class="accterr" role="alert"></p><button class="btn acctgo" type="submit">Create account</button></form>
    <p class="acctalt">Already have one? <button type="button" data-go="login">Log in</button></p>`,
  forgot: () => `<h2 id="accttitle">Reset your password</h2><p class="acctnote">We’ll email you a link. Open it on this device and browser.</p>
    <form data-f="forgot"><label class="acctf"><span>Email</span><input id="a_email" type="email" autocomplete="email" required></label>
    <p class="accterr" role="alert"></p><button class="btn acctgo" type="submit">Send reset link</button></form>
    <p class="acctalt"><button type="button" data-go="login">Back to log in</button></p>`,
  password: (why) => `<h2 id="accttitle">${why === "reset" ? "Choose a new password" : "Change your password"}</h2>
    <form data-f="password">${pwField("a_pw", "New password (8+ characters)", "new-password")}${pwField("a_pw2", "Confirm new password", "new-password")}
    <p class="accterr" role="alert"></p><button class="btn acctgo" type="submit">Save password</button></form>`,
  feedback: () => `<h2 id="accttitle">Send feedback</h2><p class="acctnote">Spotted a wrong number, have data to share, or an idea? It goes straight to the team.</p>
    <form data-f="feedback"><label class="acctf"><span>What kind?</span><select id="a_kind"><option value="error">Something on the site is wrong</option><option value="data">I have data or a source to suggest</option><option value="idea">Feature idea</option><option value="other">Something else</option></select></label>
    <label class="acctf"><span>Page</span><input id="a_page" type="text" maxlength="200"></label>
    <label class="acctf"><span>Message</span><textarea id="a_msg" rows="6" minlength="5" maxlength="4000" required placeholder="What’s wrong, and what should it say? A link to a source helps."></textarea></label>
    <p class="accterr" role="alert"></p><button class="btn acctgo" type="submit">Send</button></form>`,
  verify: (email) => `<h2 id="accttitle">Check your email</h2><p class="acctnote">We sent an email to <b>${acctEsc(email)}</b>. Tap <b>Confirm my email</b> in it, or type the code from the email here. Check spam if it isn’t there.</p>
    <form data-f="verify" data-email="${acctEsc(email)}"><label class="acctf"><span>Code from the email</span><input id="a_code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9 ]{6,12}" maxlength="12" required></label>
    <p class="accterr" role="alert"></p><button class="btn acctgo" type="submit">Confirm</button></form>
    <p class="acctalt"><button type="button" data-resend>Send a new email</button> · <button type="button" data-go="signup">Use a different email</button></p>`,
  confirmlink: () => `<h2 id="accttitle">Confirm your email</h2><p class="acctnote">One more tap and your account is ready.</p>
    <form data-f="confirmlink"><p class="accterr" role="alert"></p><button class="btn acctgo" type="submit">Confirm my email</button></form>`,
  msg: (t) => `<h2 id="accttitle">${t[0]}</h2><p class="acctnote">${t[1]}</p><button type="button" class="btn acctgo" data-close>OK</button>`,
};
/* Left panel of the sign-up dialog: what an account unlocks */
function acctPerks() {
  const P = [
    ["compass", "Specialty match quiz", "Your top five matches, why they fit, and the best fellowship in each. Members only."],
    ["star", "Favorites and private notes", "Star specialties, rank your top picks and jot notes only you can see."],
    ["sliders", "Your own tiers, saved", "Weight income, lifestyle and the rest your way. It follows you to any device."],
    ["chat", "A direct line to us", "Flag a wrong number or suggest a source, and track what we fix."],
  ];
  const ring = typeof qzRing === "function" ? qzRing : (p) => `<b>${p}%</b>`;
  return `<div class="acctperks" role="complementary" aria-label="What you get with an account">
    <p class="perkkick">Free account</p>
    <h3 class="perkhead">See the whole picture</h3>
    <div class="perkart" aria-hidden="true">
      <div class="perkcard pc1">${ring(94, 44)}<span class="pbars"><i></i><i></i></span></div>
      <div class="perkcard pc2">${ring(88, 38)}<span class="pbars"><i></i><i></i></span></div>
      <div class="perkchip c1">★ Favorites</div><div class="perkchip c2">Tier 1</div>
    </div>
    <ul class="perklist">${P.map(([i, t, d]) => `<li><span class="perkico">${hsvg(i)}</span><span><b>${t}</b><small>${d}</small></span></li>`).join("")}</ul>
  </div>`;
}
function openAcct(view, arg) {
  if ((view === "feedback" || view === "password") && !Acct.user && arg !== "reset") {
    return openAcct("login", view === "feedback" ? "Log in to send feedback." : "");
  }
  const d = acctDialog();
  d.classList.toggle("acctwide", view === "signup");
  d.querySelector(".acctbody").innerHTML = view === "signup" ? `<div class="acctsplit">${acctPerks()}<div class="acctside">${VIEWS.signup(arg)}</div></div>` : VIEWS[view](arg);
  d.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => openAcct(b.dataset.go)));
  d.querySelectorAll("[data-close]").forEach((b) => (b.onclick = () => d.close()));
  d.querySelectorAll("[data-resend]").forEach(
    (b) =>
      (b.onclick = async () => {
        const vf = d.querySelector('form[data-f="verify"]'), err = vf && vf.querySelector(".accterr");
        if (!vf) return;
        b.disabled = true;
        const { error } = await Acct.sb.auth.resend({ type: "signup", email: vf.dataset.email, options: { emailRedirectTo: acctHome() + "?confirmed=1" } });
        if (err) err.textContent = error ? errText(error) : "Sent. Use the newest email; older codes stop working.";
        setTimeout(() => (b.disabled = false), 30000);
      }),
  );
  d.querySelectorAll(".pwshow").forEach(
    (b) =>
      (b.onclick = () => {
        const i = document.getElementById(b.dataset.for);
        i.type = i.type === "password" ? "text" : "password";
        b.textContent = i.type === "password" ? "Show" : "Hide";
      }),
  );
  const pg = d.querySelector("#a_page");
  if (pg) {
    const k = pageKey && pageKey();
    const L = k && slLabel(k);
    pg.value = (L ? L.name + (L.parent ? " (" + L.parent + ")" : "") + " · " : "") + "#" + hashParts().filter(Boolean).join("/");
  }
  const f = d.querySelector("form");
  if (f) f.onsubmit = (e) => (e.preventDefault(), submitAcct(f.dataset.f, f));
  if (!d.open) d.showModal();
  const first = d.querySelector("input:not([type=checkbox]),textarea,button.acctgo");
  // On phones, don't pop the keyboard open straight away; it would cover the dialog
  if (first && !matchMedia("(pointer: coarse)").matches) first.focus({ preventScroll: true });
  else if (first && first.tagName === "BUTTON") first.focus({ preventScroll: true });
  else { d.tabIndex = -1; d.focus({ preventScroll: true }); }
  d.scrollTop = 0;
  acctFitVV();
}
/* Keep the dialog inside the part of the screen the on-screen keyboard leaves visible */
function acctFitVV() {
  const d = document.getElementById("acctdlg"), vv = window.visualViewport;
  if (!d || !vv) return;
  const kb = window.innerHeight - vv.height > 120;
  if (d.open && kb) {
    d.style.margin = `${Math.round(vv.offsetTop + 8)}px auto auto`;
    d.style.maxHeight = `${Math.round(vv.height - 16)}px`;
    d.style.overflowY = "auto";
    const a = document.activeElement;
    if (a && d.contains(a) && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) a.scrollIntoView({ block: "center" });
  } else {
    d.style.margin = d.style.maxHeight = d.style.overflowY = "";
  }
}
if (window.visualViewport) {
  visualViewport.addEventListener("resize", acctFitVV);
  visualViewport.addEventListener("scroll", acctFitVV);
}
const ERRS = [
  [/invalid login credentials/i, "That email and password don’t match. Check both, or reset your password."],
  [/email not confirmed/i, "Confirm your email first: open the link we sent you. Check spam if it isn’t there."],
  [/otp_expired|token has expired|expired or is invalid|invalid.*(otp|token)|link is invalid/i, "That code or link has expired or was already used. Send yourself a new email and use the newest one."],
  [/rate limit|too many|security purposes/i, "Too many tries. Wait a minute and try again."],
  [/password should be|weak/i, "Choose a stronger password: at least 8 characters, ideally a short phrase."],
  [/same.*password|different from the old/i, "Your new password has to be different from the old one."],
  [/fetch|network/i, "Couldn’t reach the server. Check your connection and try again."],
];
const errText = (e) => (ERRS.find(([re]) => re.test((e && e.message) || "")) || [, (e && e.message) || "Something went wrong. Try again."])[1];
async function submitAcct(kind, f) {
  const err = f.querySelector(".accterr"),
    go = f.querySelector(".acctgo"),
    v = (id) => (f.querySelector("#" + id) || {}).value || "";
  err.textContent = "";
  go.disabled = true;
  const label = go.textContent;
  go.textContent = "Working…";
  const done = () => {
    go.disabled = false;
    go.textContent = label;
  };
  try {
    if (kind === "login") {
      const { error } = await Acct.sb.auth.signInWithPassword({ email: v("a_email").trim(), password: v("a_pw") });
      if (error) throw error;
      acctDialog().close();
    } else if (kind === "signup") {
      if (v("a_pw").length < 8) throw new Error("Password should be at least 8 characters.");
      const email = v("a_email").trim();
      if (!document.getElementById("a_terms").checked) throw new Error("Please agree to the Terms of Use and Privacy Policy to create an account.");
      const consent = { privacy_version: typeof PRIVACY_VERSION === "string" ? PRIVACY_VERSION : "", terms_version: typeof TERMS_VERSION === "string" ? TERMS_VERSION : "", privacy_accepted_at: new Date().toISOString(), email_ok: !!(document.getElementById("a_mail") || {}).checked, email_ok_at: new Date().toISOString() };
      const { data, error } = await Acct.sb.auth.signUp({ email, password: v("a_pw"), options: { emailRedirectTo: acctHome() + "?confirmed=1", data: consent } });
      if (error) throw error;
      if (data.session) acctDialog().close();
      else openAcct("verify", email);
    } else if (kind === "verify") {
      const token = v("a_code").replace(/\D/g, "");
      if (token.length < 6) throw new Error("Type the code from the email (6 digits).");
      const { error } = await Acct.sb.auth.verifyOtp({ email: f.dataset.email, token, type: "signup" });
      if (error) throw error;
      openAcct("msg", ["You’re in", "Your email is confirmed and you’re signed in. Save specialties with the star button and they’ll follow you to any device."]);
    } else if (kind === "confirmlink") {
      const q = new URLSearchParams(location.search);
      const { error } = await Acct.sb.auth.verifyOtp({ token_hash: q.get("token_hash"), type: q.get("type") || "signup" });
      try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) {}
      if (error) return openAcct("msg", ["That link didn’t work", "It has expired or was already used. Try logging in: if your email is confirmed, you’re all set. If not, sign up again with the same email to get a new code."]);
      openAcct("msg", ["You’re in", "Your email is confirmed and you’re signed in. Save specialties with the star button and they’ll follow you to any device."]);
    } else if (kind === "forgot") {
      const email = v("a_email").trim();
      const { error } = await Acct.sb.auth.resetPasswordForEmail(email, { redirectTo: acctHome() + "?reset=1" });
      if (error) throw error;
      openAcct("msg", ["Check your email", `If an account exists for <b>${acctEsc(email)}</b>, a reset link is on its way. Open it in this browser.`]);
    } else if (kind === "password") {
      if (v("a_pw").length < 8) throw new Error("Password should be at least 8 characters.");
      if (v("a_pw") !== v("a_pw2")) throw new Error("The two passwords don’t match.");
      const { error } = await Acct.sb.auth.updateUser({ password: v("a_pw") });
      if (error) throw error;
      openAcct("msg", ["Password saved", "Use your new password next time you log in."]);
    } else if (kind === "feedback") {
      const msg = v("a_msg").trim();
      if (msg.length < 5) throw new Error("Add a little more detail.");
      const { error } = await Acct.sb.from("feedback").insert({ kind: v("a_kind"), page: v("a_page").slice(0, 200), message: msg.slice(0, 4000), email: Acct.user.email });
      if (error) throw error;
      openAcct("msg", ["Thanks, that’s sent", "Every report is read. Corrections usually show up in the next update."]);
    }
  } catch (e) {
    err.textContent = errText(e);
    done();
  }
}
async function acctLogout() {
  await Acct.sb.auth.signOut();
  acctAfterSignOut();
}
function acctAfterSignOut() {
  Acct.user = null;
  Acct.prefs = {};
  Acct.reports = [];
  // Clear this browser's copies so the next person on a shared computer doesn't see them.
  setShortlist([]);
  MYW = { w: TIER_DEF.slice(), on: false };
  try {
    localStorage.removeItem("ir-weights");
    localStorage.removeItem("ir-shortlist");
    localStorage.removeItem("ir-quiz-draft"); localStorage.removeItem("ir-quiz-draft2");
  } catch (e) {}
  QZ_STATE = null;
  TIERS = null;
  // Don't leave them on a page that only makes sense signed in
  if (["account", "quiz", "prep"].includes(hashParts()[0])) {
    try { history.replaceState(null, "", "#home"); } catch (e) { location.hash = "home"; }
  }
  refreshAll();
}

/* ---------- hooks into the site (called at the end of the hub module) ---------- */
function acctInit() {
  if (!window.supabase || !window.supabase.createClient || ACCT_CFG.url.startsWith("__")) return; // library blocked or not configured: site works without accounts
  Acct.sb = window.supabase.createClient(ACCT_CFG.url, ACCT_CFG.key, {
    auth: { flowType: "pkce", detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
  });
  Acct.on = true;

  // Saving to the shortlist and keeping custom tiers need an account.
  const _set = setShortlist;
  setShortlist = function (a) {
    _set(a);
    acctPush();
  };
  document.addEventListener(
    "click",
    (e) => {
      if (Acct.user) return;
      const t = e.target.closest && e.target.closest('[data-act="save"], #won, [data-act="feedback"]');
      if (!t) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      openAcct(
        "login",
        t.id === "won" ? "Log in to use your own tiers across the site." : t.dataset.act === "feedback" ? "Log in to send feedback." : "Log in to save specialties to your favorites.",
      );
    },
    true,
  );
  // "Report a problem" button on every specialty and fellowship page
  const _tools = addPageTools;
  addPageTools = function () {
    _tools();
    const bar = document.querySelector("#main .pagetools");
    if (bar && !bar.querySelector('[data-act="feedback"]')) {
      bar.insertAdjacentHTML(
        "beforeend",
        `<button type="button" class="ptool" data-act="feedback" aria-label="Report a problem on this page"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg><span>Report</span></button>`,
      );
      bar.querySelector('[data-act="feedback"]').onclick = () => openAcct("feedback");
    }
    addNoteBadge();
  };

  // Links that come back from emails: ?confirmed=1, ?reset=1, or ?error=…
  const q = new URLSearchParams(location.search);
  const tokenHash = q.get("token_hash");
  const flag = tokenHash ? null : q.get("reset") ? "reset" : q.get("confirmed") ? "confirmed" : null;
  const urlErr = q.get("error_description") || new URLSearchParams(location.hash.slice(1)).get("error_description");
  let handled = false;
  const cleanUrl = () => {
    try { history.replaceState(null, "", location.pathname + (location.hash && !/error|access_token/.test(location.hash) ? location.hash : "")); } catch (e) {}
  };

  Acct.sb.auth.onAuthStateChange((event, session) => {
    const before = Acct.user && Acct.user.id;
    Acct.user = session ? session.user : null;
    if (event === "PASSWORD_RECOVERY") {
      handled = true;
      setTimeout(() => openAcct("password", "reset"), 0);
    }
    if ((Acct.user && Acct.user.id) !== before) {
      // Supabase advises not awaiting other Supabase calls inside this callback
      setTimeout(() => (Acct.user ? acctPull() : acctBar()), 0);
    }
  });
  Acct.sb.auth.getSession().then(({ data }) => {
    Acct.user = data.session ? data.session.user : null;
    acctBar();
    Acct.known = true; // now we know whether someone is signed in
    if (!Acct.user && hashParts()[0] === "account" && !flag && !urlErr) renderAccount(); // shows the log-in popup
    if (tokenHash) {
      if (Acct.user) { cleanUrl(); openAcct("msg", ["You’re signed in", "Your email is already confirmed."]); }
      else openAcct("confirmlink");
    } else if (urlErr) {
      openAcct("msg", ["That link didn’t work", acctEsc(urlErr.replace(/\+/g, " ")) + ". Links expire after an hour and work once; request a new one if you need to."]);
    } else if (flag === "reset" && !handled) {
      if (Acct.user) openAcct("password", "reset");
      else openAcct("msg", ["Open the link in the same browser", "For security, reset links only work in the browser where you asked for them. Request a new link here."]);
    } else if (flag === "confirmed") {
      openAcct(
        "msg",
        Acct.user
          ? ["You’re in", "Your email is confirmed and you’re signed in. Save specialties with the star button and they’ll follow you to any device."]
          : ["Email confirmed", "Your account is ready. Log in to start saving favorites."],
      );
    }
    if (flag || urlErr) cleanUrl();
  });
  // Dashboard route, and the save-comparison button on the compare page
  const _render = render;
  render = function () {
    if (hashParts()[0] === "prep" && Acct.user) {
      location.replace("#account/residency"); // residency prep now lives in the profile
      return;
    }
    if (hashParts()[0] === "prep") {
      document.body.classList.remove("is-home");
      renderPrep();
      afterRender();
      window.scrollTo(0, 0);
      return;
    }
    if (hashParts()[0] === "account") {
      document.body.classList.remove("is-home");
      renderAccount();
      afterRender();
      window.scrollTo(0, 0);
      return;
    }
    _render();
  };
  // The quiz lives in the profile: results save to the account, and you need to be signed in to take it.
  QZ.load = () => (Acct.user ? Acct.prefs.quiz || null : null);
  QZ.save = (o) => {
    Acct.prefs.quiz = o;
    acctPush();
  };
  QZ.name = () => (Acct.user && Acct.prefs.username ? Acct.prefs.username : "");
  QZ.exit = "account";
  QZ.gate = () =>
    Acct.user
      ? null
      : `<section class="qzintro"><div class="qzintrotext"><p class="qzkicker">Specialty match quiz</p><h1>Find the specialty that fits you</h1>
        <p class="qzlede">${QZ_Q.length} questions about how you think, work, handle pressure and want to live. You’ll get your top five specialty matches, why each one fits, and the best-fit fellowship inside each.</p>
        <p class="qzlede">The quiz lives in your profile, so your results are saved and you can come back to them on any device. Accounts are free.</p>
        <div class="qzrow"><button type="button" class="btn" data-acct-open="signup">Create a free account</button><button type="button" class="tbtn" data-acct-open="login">Log in</button></div></div>
        <div class="qzintroart" aria-hidden="true">${[94, 88, 83].map((p, i) => `<div class="qzghost" style="--d:${i}">${qzRing(p, 46)}<span><i></i><i></i></span></div>`).join("")}</div></section>`;
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-acct-open]");
    if (b) openAcct(b.dataset.acctOpen, b.dataset.acctOpen === "signup" ? "" : "Log in to take the quiz and save your results.");
  });
  // "Your dashboard" in the sidebar, and a Manage link on the shortlist heading
  const _nav = buildNav;
  buildNav = function () {
    _nav();
    if (!Acct.user) return;
    acctBar(); // keeps the favorites count on the profile card current
  };
  // Phones: a profile button next to the search button
  const mn = document.querySelector(".mobile-nav .drawerbtn");
  if (mn && !document.querySelector(".profbtn")) {
    mn.insertAdjacentHTML("afterend", `<button type="button" class="profbtn" aria-label="Profile">${hsvg("user")}</button>`);
    document.querySelector(".profbtn").onclick = () => (Acct.user ? (location.hash = "account") : openAcct("login"));
  }
  window.addEventListener("hashchange", acctBar);
  acctBar();
  buildNav();
  render();
}
