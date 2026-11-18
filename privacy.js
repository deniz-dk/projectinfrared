/* PRIVACY-JS-START */
const PRIVACY_VERSION = "2026-11-17";
const PRIVACY_EMAIL = "privacy@projectinfrared.org";
function renderPrivacy() {
  const mail = `<a href="mailto:${PRIVACY_EMAIL}">${PRIVACY_EMAIL}</a>`;
  const sec = [
    ["who", "Who we are", `<p>Project Infrared (“we”, “us”) runs <b>projectinfrared.org</b>, a free guide to Canadian and Ontario medical specialties. We are based in Ontario, Canada. This policy explains what personal information we collect, why, who helps us handle it, and the choices you have. It follows Canada’s federal privacy law, the <i>Personal Information Protection and Electronic Documents Act</i> (PIPEDA).</p><p>Our Privacy Officer is responsible for how we handle personal information. You can reach them at ${mail}.</p>`],
    ["collect", "What we collect", `<p><b>If you just browse.</b> You don’t need an account to read the site. We don’t use advertising, analytics or tracking cookies. Like any website, the services that deliver our pages (listed under <a href="#privacy/share">Who helps us run the site</a>) receive your IP address, browser type and the page requested, and may keep these in short-term server logs for security and reliability.</p>
<p><b>If you create an account,</b> we store:</p>
<ul class="b">
<li><b>Your email address and password.</b> Your password is stored only as a secure one-way hash; we can’t see it.</li>
<li><b>A display name,</b> if you set one.</li>
<li><b>What you save:</b> favorites, private notes, top picks, your custom tier weights and your sidebar sorting choice.</li>
<li><b>Your specialty match quiz answers and results,</b> if you take the quiz. Some questions are about how you like to work and what you enjoy, so we treat your answers as personal and use them only to show you your results.</li>
<li><b>Feedback you send,</b> with the page you sent it from, your email address, and any reply we write back.</li>
<li><b>Basic account records</b> kept by our account provider, such as when you signed up, when you last signed in, the IP address used to sign in, and the date you agreed to this policy.</li>
</ul>
<p>Please don’t put health information or other sensitive details about yourself or anyone else in notes or feedback. We don’t need it.</p>
<p><b>On your own device.</b> The site saves some choices in your browser’s local storage so they work without an account: favorites, tier weights, sort order, quiz progress, compare settings and whether the sidebar is collapsed. When you’re signed in, it also keeps your sign-in session there. This information stays in your browser unless you sign in, and you can clear it at any time in your browser settings. We don’t use cookies.</p>`],
    ["use", "How we use it", `<p>We use your information only to:</p>
<ul class="b">
<li>create and secure your account, and let you sign in;</li>
<li>save your favorites, notes, picks, tiers and quiz results and show them to you on any device;</li>
<li>send emails you need for your account: confirming your address, resetting your password and confirming email changes;</li>
<li>send reminder emails you turn on in your settings, such as CaRMS deadline and interview reminders, each with a one-click unsubscribe link;</li>
<li>read and answer your feedback and fix what you report;</li>
<li>keep the site secure and working, and prevent abuse.</li>
</ul>
<p>We don’t sell or rent your personal information, we don’t show ads, and we don’t use your information to build advertising profiles. We won’t send you newsletters or other promotional emails unless you separately opt in, as required by Canada’s Anti-Spam Legislation (CASL). If we use your information for any new purpose, we’ll ask you first.</p>`],
    ["share", "Who helps us run the site", `<p>We use a small number of service providers. They handle information only to provide their service to us, under their own security and privacy commitments:</p>
<ul class="b">
<li><b>Supabase</b> stores account data (email, password hash, saved items, quiz results and feedback) and sends account emails, either itself or through an email delivery service.</li>
<li><b>Netlify</b> and <b>Cloudflare</b> host the site and deliver its pages.</li>
<li><b>Google Fonts</b> supplies the site’s fonts, and <b>jsDelivr</b> supplies the code library used for sign-in. Your browser connects to them directly, so they receive your IP address.</li>
</ul>
<p>Some of these providers store or process information outside Canada, including in the United States. While it is there, it may be accessible to courts, law enforcement and national security authorities of that country under its laws.</p>
<p>We may also disclose personal information if the law requires it, to protect the safety or rights of people or the site, or as part of a sale or merger of the site, in which case this policy would continue to apply to your information.</p>`],
    ["keep", "How long we keep it", `<p>We keep your account information for as long as you have an account. You can delete your account at any time from <b>Profile → Account and security</b>. This permanently deletes your account, email address, display name, favorites, notes, top picks, tiers and quiz results right away.</p>
<p>Feedback you sent may be kept after you delete your account so we can still fix the issue, but your email address and account link are removed from it. Copies may remain in our providers’ encrypted backups for a short period, usually up to 30 days, before they are overwritten.</p>`],
    ["rights", "Your choices and rights", `<p>You can:</p>
<ul class="b">
<li><b>See and change</b> most of your information yourself in your Profile, including your name, email, password, saved items and quiz results.</li>
<li><b>Get a copy</b> of what’s saved to your account at any time with <b>Profile → Download your data</b>, or email us for a copy of everything we hold about you.</li>
<li><b>Ask us to correct</b> anything that’s wrong.</li>
<li><b>Withdraw your consent</b> by deleting your account. You can still use the site without one.</li>
<li><b>Make a complaint.</b> Email ${mail} first and we’ll try to resolve it. You can also contact the <a href="https://www.priv.gc.ca/en/report-a-concern/" target="_blank" rel="noopener">Office of the Privacy Commissioner of Canada ↗</a>.</li>
</ul>
<p>We’ll reply to requests within 30 days and may need to confirm your identity first.</p>`],
    ["security", "How we protect it", `<p>All connections to the site are encrypted (HTTPS). Passwords are hashed, never stored in plain text. Our database rules only let a signed-in account read and change its own information. Only the site’s team can read feedback, and we limit access to what’s needed. No system is perfectly secure, so please use a strong password you don’t use elsewhere. If a breach of security creates a real risk of significant harm to you, we’ll notify you and the Privacy Commissioner as the law requires.</p>`],
    ["age", "Age", `<p>Project Infrared is meant for adults, mainly medical students and those thinking about medicine. You must be at least 16 to create an account. If you believe someone younger has created one, contact us and we’ll delete it.</p>`],
    ["changes", "Changes to this policy", `<p>If we change this policy, we’ll update the date below and post the new version here. If a change significantly affects how we use information you’ve already given us, we’ll tell you by email or on the site before it takes effect and, where required, ask for your consent again.</p>`],
    ["contact", "Contact", `<p>Questions, requests or concerns about privacy: ${mail}.</p>`],
  ];
  legalDoc("privacy", "Privacy Policy", "Privacy", PRIVACY_VERSION, "What we collect, why, and the choices you have.", [
    "You can read the whole site without an account. No ads, no analytics, no tracking cookies.",
    "With an account, we store your email, your saved items, your quiz results and any feedback you send, only to run your account.",
    "We never sell your information.",
    "You can delete your account and its data at any time from your Profile.",
  ], sec);
}
/* Shared layout for the privacy policy and terms of use */
function legalDoc(route, title, crumb, version, lede, short, sec) {
  const nice = new Date(version + "T12:00:00").toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  $("#main").innerHTML = `<p class="crumb"><a href="#home">Home</a> / ${crumb}</p><h1>${title}</h1>
<p class="lede">${lede} Last updated ${nice}.</p>
<div class="box pvshort"><h3>The short version</h3><ul class="b">${short.map((t) => `<li>${t}</li>`).join("")}</ul></div>
<nav class="pvtoc" aria-label="On this page">${sec.map((s, i) => `<a href="#${route}/${s[0]}">${i + 1}. ${s[1]}</a>`).join("")}</nav>
${sec.map((s, i) => `<section class="pvsec" id="pv-${s[0]}"><h2>${i + 1}. ${s[1]}</h2>${s[2]}</section>`).join("")}`;
  const [, arg] = hashParts();
  if (arg) setTimeout(() => { const t = document.getElementById("pv-" + arg); if (t) t.scrollIntoView(); }, 0);
  document.querySelectorAll(`#main a[href^="#${route}/"]`).forEach((a) => (a.onclick = (e) => {
    e.preventDefault();
    const k = a.getAttribute("href").split("/")[1];
    history.replaceState(null, "", `#${route}/` + k);
    const t = document.getElementById("pv-" + k);
    if (t) t.scrollIntoView({ behavior: "smooth" });
  }));
}
const TERMS_VERSION = "2026-11-17";
function renderTerms() {
  const mail = `<a href="mailto:${PRIVACY_EMAIL}">${PRIVACY_EMAIL}</a>`;
  const sec = [
    ["agree", "Agreeing to these terms", `<p>These terms are an agreement between you and Project Infrared (“we”, “us”), which runs <b>projectinfrared.org</b> from Ontario, Canada. By using the site you agree to them. If you create an account, you confirm that you have read them and our <a href="#privacy">Privacy Policy</a>, which explains how we handle your information. If you don’t agree, please don’t use the site.</p>`],
    ["info", "General information, not advice", `<p>Project Infrared gives general information to help medical students and others think about specialties and careers in medicine. It is <b>not</b> career, financial, tax, legal, immigration or medical advice, and it doesn’t create any professional relationship with you.</p>
<ul class="b">
<li>Income figures, match odds, ratings, tiers, quiz results and outlooks are estimates and opinions built from public sources and our own reasoning. Many are labelled <b>Estimate</b> or <b>Forecast</b> for that reason.</li>
<li>Rules, fees, match data and job markets change. Something correct when we wrote it may be out of date when you read it.</li>
<li>Before making a decision that matters, such as choosing electives, applying to residency, signing a contract, incorporating or moving countries, check the original source and talk to the right professional: a faculty advisor, CaRMS, the program, an accountant, a lawyer or an immigration adviser.</li>
</ul>`],
    ["accuracy", "Accuracy and sources", `<p>We work hard to get things right and link our sources where we can, but we don’t promise that anything on the site is complete, accurate or current. We are not affiliated with, endorsed by or speaking for CaRMS, the Royal College, the College of Family Physicians of Canada, CIHI, the Ontario Ministry of Health, OHIP, the Ontario Medical Association, any university, hospital or residency program, or any other organization we mention. Their names are used only to identify where information comes from. If you spot a mistake, please tell us through the feedback form or by email.</p>`],
    ["accounts", "Your account", `<p>You can use most of the site without an account. If you create one:</p>
<ul class="b">
<li>You must be at least 16 and give a real email address you control.</li>
<li>Keep your password private. You’re responsible for what happens under your account.</li>
<li>One person per account. Don’t share accounts or create accounts for others without their permission.</li>
<li>You can delete your account at any time from your Profile.</li>
</ul>
<p>We may suspend or delete an account that breaks these terms, puts the site or other people at risk, or is clearly fake or automated. Where reasonable, we’ll tell you first.</p>`],
    ["use", "Acceptable use", `<p>Please don’t:</p>
<ul class="b">
<li>break the law or use the site to harass, threaten or harm anyone;</li>
<li>post feedback or notes containing other people’s personal or health information, or anything abusive, hateful or misleading;</li>
<li>try to get into accounts or parts of the site that aren’t yours, test or break our security, or interfere with how the site runs;</li>
<li>scrape, copy or republish the site’s content or data in bulk, or use automated tools to do so, without our written permission;</li>
<li>pretend to be someone else, or suggest we endorse you or your product.</li>
</ul>`],
    ["content", "Our content", `<p>The site’s text, analysis, ratings, tiers, quiz, design, logo and code belong to Project Infrared or our licensors and are protected by copyright and other laws. You may read, print and share pages for your own personal, non-commercial use, and you may quote short passages with a link back to the page. Anything else, such as copying large parts of the site, reselling it, or using it to train or build another product, needs our written permission. Facts and public data we cite, such as published match or billing figures, belong to their original publishers and are subject to their terms.</p>`],
    ["feedback", "Feedback you send", `<p>When you send feedback, corrections or data, you confirm that you’re allowed to share it, and you let us use it to improve the site, including editing it and publishing corrections based on it, without paying you. We won’t publish your name or email with it unless you ask us to. We may reply to you, and our reply is stored with your report.</p>`],
    ["links", "Links to other sites", `<p>The site links to outside sources such as CaRMS, government pages, journals and job postings. We don’t control those sites and aren’t responsible for their content, availability or privacy practices.</p>`],
    ["availability", "Changes to the site", `<p>The site is in beta. We may add, change or remove features and content at any time, and the site may sometimes be unavailable. Some features may become paid in the future; if that happens, we’ll explain the price and terms before you’re charged, and anything paid will come with its own clear terms.</p>`],
    ["liability", "Limits on our responsibility", `<p>The site is provided “as is” and “as available”. To the fullest extent the law allows, we don’t give any warranties, express or implied, including that the site will be accurate, uninterrupted or fit for a particular purpose. To the fullest extent the law allows, we are not liable for any indirect, incidental or consequential loss, or for any loss arising from decisions you make based on the site, such as lost income, unmatched applications or missed opportunities. If we are found liable to you for anything, our total liability is limited to CAD $100 or the amount you paid us in the 12 months before the claim, whichever is greater. Nothing in these terms limits rights you have under consumer protection laws that can’t be waived.</p>`],
    ["ending", "Ending these terms", `<p>You can stop using the site and delete your account at any time. We may stop offering the site, or end your access if you seriously or repeatedly break these terms. The sections on general information, our content, feedback, limits on our responsibility and governing law continue after these terms end.</p>`],
    ["law", "Governing law", `<p>These terms are governed by the laws of Ontario and the federal laws of Canada that apply there. Any dispute will be handled by the courts of Ontario, unless the law where you live gives you the right to bring it elsewhere. Before going to court, please contact us so we can try to sort it out.</p>`],
    ["changes", "Changes to these terms", `<p>We may update these terms as the site grows. We’ll change the date at the top and, if a change is significant, tell you on the site or by email before it takes effect. Continuing to use the site after that means you accept the updated terms.</p>`],
    ["contact", "Contact", `<p>Questions about these terms: ${mail}.</p>`],
  ];
  legalDoc("terms", "Terms of Use", "Terms", TERMS_VERSION, "The rules for using Project Infrared.", [
    "The site gives general information, not career, financial, legal or medical advice. Check anything important with the original source.",
    "Figures and ratings are estimates and can be out of date. We link sources so you can check.",
    "Use the site for yourself; don’t copy or scrape it in bulk.",
    "Be respectful in feedback, and keep other people’s personal information out of it.",
  ], sec);
}
function addSiteFoot() {
  const m = $("#main");
  if (!m || m.querySelector(".sitefoot")) return;
  const f = document.createElement("footer");
  f.className = "sitefoot";
  f.innerHTML = `<span>© ${new Date().getFullYear()} Project Infrared</span><a href="#privacy">Privacy policy</a><a href="#terms">Terms of use</a><span>General information only, not career, financial or legal advice.</span>`;
  m.appendChild(f);
}
/* PRIVACY-JS-END */
