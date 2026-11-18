/* ============================================================
   SPECIALTY MATCH QUIZ
   Every answer nudges 19 traits. Each specialty and fellowship has a
   profile on the same traits (our estimates, partly from the site's
   ratings). Match = how closely the two line up, weighted by how
   strongly you answered.
   ============================================================ */
const QZ_T = [
  // key, name, weight, type, you-high, you-low, spec-high, spec-low
  ["H", "Hands-on work", 1.4, "sym", "You like solving things with your hands", "You’d rather think a problem through than do procedures", "is built around procedures and manual skill", "is mostly thinking, talking and deciding, with few procedures"],
  ["A", "Acuity", 1.2, "sym", "You come alive when things get urgent", "You prefer a calm, predictable day", "means emergencies, unstable patients and fast decisions", "rarely has true emergencies"],
  ["L", "Continuity", 1.1, "sym", "You want to know people over years and see how things turn out", "You’re happy to help someone and move on", "follows the same patients for years", "mostly meets patients once, or for one short episode"],
  ["V", "Visual pattern-spotting", 1.0, "sym", "You notice visual details other people miss", "Visual detail-spotting isn’t what drives you", "rewards reading images, slides or skin at a glance", "leans little on visual pattern recognition"],
  ["P", "Diagnostic puzzles", 1.0, "sym", "You enjoy murky problems that take real thinking", "You prefer clear problems with known answers", "is full of complex, unclear diagnostic problems", "mostly deals with clear problems and well-worn answers"],
  ["C", "Quick results", 0.9, "sym", "You like fixing something and seeing it done", "You don’t need instant results to feel useful", "usually fixes the problem and shows results fast", "manages long-term conditions that rarely fully go away"],
  ["T", "Talking with patients", 1.1, "sym", "Long conversations with people energize you", "You don’t need lots of patient conversation", "is heavy on conversation and counselling", "has little direct patient conversation"],
  ["M", "Teamwork", 0.6, "sym", "You like working inside a tight team", "You like working independently", "runs on close teamwork", "is fairly independent day to day"],
  ["Y", "Control over your time", 1.0, "need", "Protecting your time outside work matters a lot to you", "You’ll trade personal time for the right work", "offers a fairly controllable schedule", "comes with heavy call and long or unpredictable hours"],
  ["S", "Training and long weeks", 0.8, "cap", "You’re willing to take a long training road and long weeks", "You’d rather avoid a very long training path and long weeks", "has one of the longer, harder training paths", "has a shorter path and lighter weeks"],
  ["R", "High-stakes calls", 0.8, "cap", "You’re comfortable making high-stakes calls", "You’d rather not carry life-or-death stakes on every decision", "involves decisions where a mistake can be catastrophic", "has lower day-to-day stakes"],
  ["D", "Precision", 0.9, "sym", "You enjoy exacting, precise work", "You prefer work where millimetres don’t matter", "demands millimetre-level precision", "doesn’t need extreme precision"],
  ["B", "Breadth", 0.8, "sym", "You like variety and being a generalist", "You’d rather go deep on one area", "covers a very wide range of problems", "goes deep on a narrow area"],
  ["K", "Working with kids", 1.3, "kid", "You’re at ease with kids and their families", "Working with children isn’t a draw for you", "is centred on children and their families", "is mostly adults"],
  ["E", "Emotional load", 0.9, "cap", "You can carry hard emotional moments steadily", "You’d rather not carry heavy emotional weight every day", "regularly involves serious illness, grief or distress", "is light on heavy emotional moments"],
  ["Z", "Systems and big picture", 0.9, "sym", "You’re drawn to fixing systems, not just single cases", "You’d rather help the person in front of you", "has a big research, policy or systems side", "is mostly one patient at a time"],
  ["$", "Income", 0.6, "need", "Income matters a lot to you", "Income isn’t a big driver for you", "is one of the higher-paying fields", "pays less than most specialties"],
  ["G", "Technology", 0.7, "sym", "You love equipment and new technology", "You don’t need gadgets to enjoy your work", "is full of equipment, imaging and new technology", "uses relatively little technology"],
  ["F", "Pace and volume", 0.8, "sym", "You like a fast pace with lots of cases", "You prefer fewer, deeper cases", "is fast-paced and high-volume", "is slow and deliberate, with fewer, longer visits"],
];
const QZ_K = QZ_T.map((t) => t[0]);
const QZ_ARCH = {
  H: ["The Craftsperson", "The Thinker"],
  A: ["The First Responder", "The Steady Hand"],
  L: ["The Long Game", "The Closer"],
  V: ["The Pattern Spotter", null],
  P: ["The Detective", "The Pragmatist"],
  C: ["The Fixer", "The Gardener"],
  T: ["The Connector", "The Quiet Expert"],
  M: ["The Team Player", "The Lone Wolf"],
  R: ["The Risk-Taker", "The Careful One"],
  D: ["The Perfectionist", "The Big-Picture Mover"],
  B: ["The Generalist", "The Specialist"],
  K: ["The Kid Whisperer", null],
  E: ["The Anchor", null],
  Z: ["The Systems Thinker", "The One-on-One"],
  G: ["The Gadgeteer", "The Purist"],
  F: ["The Sprinter", "The Deep Diver"],
};
const QZ_ARCH_BLURB = {
  "The Craftsperson": "You think with your hands. You want to make something better, physically, and see it.",
  "The Thinker": "You’d rather out-think a problem than out-operate it. Your best tool is your head.",
  "The First Responder": "Pressure sharpens you. When things go sideways, you’re the one who moves first.",
  "The Steady Hand": "You do your best work in calm, controlled conditions, and you make chaos look orderly.",
  "The Long Game": "You care how the story ends. Relationships that build over years matter to you.",
  "The Closer": "You like a clean finish: help, solve, move on to the next person who needs you.",
  "The Pattern Spotter": "You see what others miss. Small visual details jump out at you.",
  "The Detective": "Murky problems pull you in. You won’t rest until the pieces fit.",
  "The Pragmatist": "You like problems with real answers, and you like getting to them efficiently.",
  "The Fixer": "Broken thing in, working thing out. You want the satisfaction of a job finished.",
  "The Gardener": "You’re patient. You’re happy tending something slowly and watching it grow.",
  "The Connector": "People energize you. You’re at your best in a real conversation.",
  "The Quiet Expert": "You help people best from behind the scenes, through what you know.",
  "The Team Player": "You do your best work with a crew around you, and you make the crew better.",
  "The Lone Wolf": "You like owning your work, start to finish, on your own terms.",
  "The Risk-Taker": "You’ll make the big call. Hesitation bothers you more than being wrong.",
  "The Careful One": "You weigh things properly before acting. Getting it right matters more than getting it fast.",
  "The Perfectionist": "Close enough isn’t. You care about getting every detail exactly right.",
  "The Big-Picture Mover": "You don’t sweat millimetres. You keep things moving and see the whole board.",
  "The Generalist": "Variety keeps you sharp. You’d rather know a lot about a lot.",
  "The Specialist": "You want to go deep, and be the person people call about one thing.",
  "The Kid Whisperer": "Kids trust you, and you’re patient with the worried parents who come with them.",
  "The Anchor": "When things get heavy, you stay steady. People lean on you in hard moments.",
  "The Systems Thinker": "You see the system behind the single case, and you want to fix the system.",
  "The One-on-One": "You care most about the person right in front of you.",
  "The Gadgeteer": "You love tools, tech and the newest way of doing things.",
  "The Purist": "You don’t need gadgets. Medicine, to you, is about the person and the thinking.",
  "The Sprinter": "You like momentum: lots of cases, quick decisions, a full day.",
  "The Deep Diver": "You’d rather do fewer things properly than many things quickly.",
};

/* Specialty profiles: H A L V P C T M R D B K E Z G F S (0–10).
   Control over time (Y) and income ($) come from the site’s star ratings. */
const QZ_P = {
  neurosurgery: [10, 9, 3, 6, 6, 7, 4, 7, 10, 10, 3, 2, 8, 2, 7, 5, 10],
  orthopedics: [10, 7, 3, 6, 3, 9, 5, 6, 6, 6, 4, 3, 3, 2, 7, 7, 8],
  plastics: [10, 5, 4, 7, 5, 8, 6, 5, 6, 10, 6, 3, 4, 2, 6, 5, 8],
  ophthalmology: [9, 3, 6, 9, 4, 8, 5, 3, 6, 10, 3, 2, 2, 2, 9, 9, 6],
  ent: [9, 6, 5, 6, 5, 7, 6, 5, 7, 9, 6, 4, 5, 2, 7, 6, 8],
  urology: [8, 4, 6, 5, 4, 8, 6, 5, 5, 7, 5, 2, 3, 2, 8, 7, 7],
  gensurg: [10, 8, 3, 4, 5, 8, 5, 7, 8, 6, 7, 2, 6, 2, 5, 6, 9],
  cardiacsurg: [10, 9, 2, 5, 6, 7, 3, 9, 10, 10, 2, 2, 8, 2, 8, 3, 10],
  vascular: [10, 8, 5, 6, 5, 7, 5, 7, 9, 9, 4, 0, 6, 2, 8, 5, 8],
  obgyn: [9, 8, 5, 4, 4, 7, 7, 7, 8, 6, 6, 2, 6, 3, 5, 6, 8],
  im: [2, 6, 5, 2, 9, 4, 7, 7, 6, 4, 9, 0, 6, 4, 3, 5, 6],
  cardiology: [6, 7, 6, 6, 7, 6, 6, 6, 7, 6, 4, 0, 5, 3, 8, 6, 8],
  gi: [8, 4, 6, 6, 5, 7, 6, 4, 5, 7, 4, 0, 4, 2, 7, 8, 7],
  respirology: [4, 6, 7, 6, 7, 4, 6, 6, 6, 4, 5, 0, 6, 3, 6, 5, 7],
  nephrology: [3, 4, 9, 2, 8, 2, 6, 6, 5, 5, 5, 0, 6, 4, 5, 4, 6],
  endo: [1, 1, 9, 3, 7, 3, 7, 3, 2, 4, 4, 1, 3, 3, 5, 5, 5],
  rheum: [2, 2, 9, 4, 9, 2, 7, 3, 3, 4, 5, 1, 4, 2, 3, 4, 5],
  heme: [3, 4, 7, 6, 8, 4, 6, 5, 6, 5, 4, 0, 7, 3, 4, 4, 6],
  medonc: [1, 4, 7, 3, 7, 3, 9, 7, 6, 4, 3, 0, 10, 5, 4, 4, 6],
  id: [1, 5, 4, 3, 10, 6, 6, 6, 6, 4, 7, 1, 5, 6, 3, 4, 5],
  geri: [1, 3, 7, 2, 8, 2, 8, 8, 4, 3, 9, 0, 8, 5, 2, 3, 5],
  allergy: [2, 2, 6, 4, 6, 6, 7, 3, 3, 4, 3, 4, 2, 2, 3, 6, 5],
  neurology: [3, 5, 7, 6, 9, 2, 7, 5, 5, 5, 4, 1, 6, 3, 5, 4, 6],
  derm: [6, 1, 5, 10, 5, 8, 6, 3, 3, 7, 4, 3, 2, 1, 4, 9, 4],
  psych: [0, 4, 9, 1, 8, 2, 10, 6, 5, 2, 6, 2, 9, 5, 1, 3, 4],
  pmr: [4, 2, 8, 4, 6, 4, 8, 8, 2, 4, 6, 2, 6, 4, 5, 4, 4],
  peds: [3, 5, 7, 3, 7, 5, 8, 6, 5, 4, 9, 10, 6, 4, 3, 6, 6],
  pedsneuro: [2, 4, 8, 5, 9, 2, 8, 5, 5, 5, 4, 10, 7, 3, 5, 3, 6],
  genetics: [0, 1, 6, 5, 10, 2, 8, 4, 3, 7, 4, 6, 6, 5, 7, 2, 4],
  anesthesia: [8, 8, 1, 4, 5, 9, 3, 8, 9, 6, 6, 3, 4, 2, 9, 6, 7],
  radiology: [3, 4, 0, 10, 8, 5, 1, 3, 5, 8, 6, 2, 2, 3, 10, 7, 6],
  em: [6, 10, 1, 4, 6, 9, 7, 8, 8, 3, 10, 4, 7, 3, 5, 10, 5],
  fm: [3, 3, 10, 3, 5, 5, 9, 4, 3, 3, 10, 5, 6, 5, 3, 7, 2],
  radonc: [3, 2, 6, 6, 6, 4, 8, 6, 5, 8, 2, 1, 8, 3, 10, 4, 6],
  nucmed: [1, 1, 2, 9, 6, 6, 3, 3, 3, 7, 4, 2, 3, 3, 10, 6, 5],
  pathology: [2, 1, 0, 10, 9, 6, 0, 4, 5, 9, 6, 1, 2, 4, 6, 5, 5],
  phpm: [0, 2, 2, 2, 7, 2, 4, 7, 4, 4, 9, 3, 2, 10, 4, 3, 3],
  occmed: [1, 1, 5, 2, 5, 5, 6, 4, 2, 3, 6, 0, 2, 7, 3, 5, 3],
  critcare: [7, 10, 1, 4, 8, 6, 6, 9, 9, 5, 7, 0, 9, 3, 8, 6, 8],
  pain: [7, 1, 8, 5, 5, 5, 7, 4, 3, 7, 3, 0, 6, 2, 6, 6, 6],
  sleep: [0, 1, 6, 5, 6, 4, 6, 3, 1, 4, 3, 2, 2, 3, 7, 6, 4],
  palliative: [1, 3, 4, 1, 5, 3, 10, 8, 3, 2, 6, 1, 10, 3, 1, 3, 4],
  addiction: [0, 4, 8, 1, 6, 3, 9, 6, 4, 2, 5, 1, 8, 5, 1, 5, 4],
  sportsmed: [5, 3, 5, 6, 4, 7, 7, 5, 2, 4, 4, 3, 2, 2, 5, 7, 4],
};
const QZ_PK = ["H", "A", "L", "V", "P", "C", "T", "M", "R", "D", "B", "K", "E", "Z", "G", "F", "S"];
/* Fellowship profiles: changes from the parent specialty, in the same order as each specialty’s subspecialty list. */
const QZ_SUB = {
  neurosurgery: ["A-3 P+3 G+3 Z+1 D+1 Y+1", "A-2 F+2 C+1 Y+1 $+1", "K+8 E+2 L+2", "A+1 G+2 R+1", "P+1 E+2 M+1", "A-3 Y+2 L+1 D+1", "A+1 E+1 M+2 Y-1"],
  orthopedics: ["A-3 F+2 Y+2 C+1 $+1 T-1", "A-2 T+1 K+1 Y+1", "R+2 D+2 P+1", "A+3 Y-3 M+1", "D+3 F+1", "A-2 Y+1", "K+7 L+2", "E+3 P+2 R+1 M+2 Y-1", "A-2 Y+1"],
  plastics: ["A+1 D+1 F+1", "L+2 E+1 D+1", "A-4 Y+3 $+2 T+1 F+1 Z+1", "K+8 P+2 M+1 L+2", "A+3 E+3 M+3 Y-2", "T+2 L+2 E+1 Z+1", "A-3 P+1 D+2 L+1"],
  ophthalmology: ["A+2 F+1 G+1 $+1", "F+2 C+1 Y+1 B+1", "L+3 P+1 C-2", "G+2 Y+1 $+1", "V+1 D+1 T+1", "K+8 L+1 T+1", "H-6 P+4 C-3 F-3", "P+3 H-3 L+2 E+2"],
  ent: ["E+3 A+1 M+2 Y-2 R+1", "G+2 D+1", "D+2 G+3 T+1", "V+2 Y+2 $+1 A-3 Z+1", "K+8 F+1", "T+2 G+1 A-2 L+1"],
  urology: ["G+3 E+2 R+1", "G+2 A+1 F+1 C+1", "L+2 T+1 A-2", "T+2 A-3 Y+2 Z+1", "K+8", "A+2 D+2 P+1"],
  gensurg: ["L+1", "R+2 D+2 S+1 E+2 P+1", "E+2 M+2 P+1", "R+2 G+1", "G+2 A-2 Y+1 F+1", "A+3 Y-2 E+1 M+1", "A-4 Y+3 L+2 T+2 E+1", "K+8 E+1", "A+1 Y-3 M+2 L+2 R+1", "B+3 A+1 Z+1"],
  cardiacsurg: ["", "A+1 R+1 D+1", "L+2 G+2 M+1 Y-1", "K+8 D+1 E+1", "G+3 M+2 H-2 A-2"],
  vascular: ["G+2 R+1 D+1", "L+2 E+1 C-1", "A-5 Y+3 F+2 R-3"],
  obgyn: ["A-5 Y+3 $+1 G+2 T+1 L+1 P+1", "P+2 R+1 V+2 H-2 E+2", "E+3 R+1 L+2", "A-4 Y+2 L+2", "G+2 A-3 Y+2", "Z+3 T+2 A-2 Y+1 E+1"],
  im: ["B+1", "P+1 L+1 K+1", "C+2 F+1 A-1 L-2"],
  cardiology: ["H+4 A+3 R+2 Y-3 $+1 C+2", "H+3 G+3 D+2 P+1", "V+3 H-3 G+2 A-3 Y+2 T-2", "L+3 E+2 P+1 H-3"],
  gi: ["H+2 R+2 A+1 G+1 D+1", "H-4 P+3 L+2 E+2", "L+3 H-3 P+1 T+1", "F+2 $+1 B+1"],
  respirology: ["H+4 G+2 C+2", "A-5 Y+3 G+2 L-1 E-3", "A+4 E+3 M+3 Y-2 H+2 R+2"],
  nephrology: ["L+1 P+1", "P+2 V+2", "L+1 T+1 Y+1", "H+5 C+3 G+1"],
  endo: ["H+4 V+3 C+2", "T+2 L+1 Z+1", "P+2", "G+4 Z+1"],
  rheum: ["H+3 V+3 G+2", "P+1 A+2 E+2"],
  heme: ["C+2 F+2 Y+1 E-3", "E+2 A+2 G+2 M+2 Y-1", "T-5 Z+4 Y+3 A-2", "V+1 E+1 L+1"],
  medonc: ["", "P+2 Z+3 G+1", "T+1 E+1 K+2"],
  id: ["M+1 R+1", "L+5 T+2 Z+2 C-2"],
  neurology: ["A+4 C+2 V+2 G+1 L-3 F+2", "V+3 G+2 L+1", "H+3 G+2 P+1 C+1", "L+2 G+1 V+1", "L+2 V+1 P+1", "L+1 A-3 Y+2 C-1 P-1"],
  derm: ["H+4 D+2 C+1 $+2 F+1", "H+2 $+2 Y+1 Z+1 P-2 E-2", "K+8 T+1"],
  psych: ["K+8 L+1", "B+1 E+1", "Z+3 R+2 T-1 L-2 E+1", "A+1 Z+2 C+1", "H+3 G+4 C+2"],
  pmr: ["H+4 C+3 F+2 $+1", "H+2 G+3 P+1 V+1", "L+1 E+2 M+2 H-2", "H+3 C+1 $+1"],
  peds: ["A+4 H+2 G+2 E+2 M+2 Y-2", "A+5 E+3 R+3 M+3 Y-2 H+2", "A+4 C+3 F+3 L-5", "L+3 A-4 T+2 Y+2 F-3 P+1"],
  pedsneuro: ["V+3 G+2 P+1", "A+3 E+2 M+2"],
  anesthesia: ["R+2 G+2 D+1 A+1", "K+8 D+1", "H+2 V+2 F+1 C+1", "L+5 T+3 A-6 Y+2 C-3 E+1", "A+1 K+1 T+1", "P+1 G+1", "A+1 E+3 L+2 P+2 T+2", "R+2 A+1 Y-2"],
  radiology: ["P+2 D+1", "H+7 A+3 C+2 T+3 R+3 Y-2 M+2", "F+1 B+1", "C+1", "H+2 T+3 E+1 Y+2 F+1", "K+6 T+1", "G+1 P+1"],
  em: ["K+7", "E+2 L+2 P+2 F-2", "V+3 G+3 H+1", "P+3 Z+1", "Z+3 A+1 M+1 G+1"],
  fm: ["H+5 A+4 C+3 G+2 R+2", "H+2 C+2 A-1 K+1 E-2", "E+2 P+1", "E+4 T+1 L-2", "Z+2 E+2 A+1", "A+3 H+3 K+2 Y-3", "A+2 L-5 M+2 F+1 C+1", "A+6 L-7 F+3 C+3 Y-1 H+2"],
  radonc: ["D+1 P+1 C+1", "H+5 D+1", "K+8 E+1"],
  nucmed: ["T+3 L+2 E+2 Z+1"],
  pathology: ["Z+3 H+5 E+2 R+2", "P+1 D+1", "Z+4 V-2 M+2 P+1 Y+1"],
};

/* Questions. scale: a statement rated 1–5. choice / pair: pick one. pick2: pick two.
   Effects are trait nudges; a scale answer applies them from −1× (not me) to +1× (very me). */
const QZ_SEC = ["How you’re wired", "How you work", "Under pressure", "People and feelings", "The life you want", "Wildcards"];
const QZ_Q = [
  // 1 How you’re wired
  { s: 0, t: "choice", q: "A friend’s car starts making a strange clunking noise. What do you actually do?", o: [["Pop the hood and poke around. Half the fun is finding it myself.", "H+2 C+1 G+1"], ["Ask exactly when it happens: what speed, hot or cold, turning or straight. The pattern is the clue.", "P+1.5 D+1 V+0.5"], ["Look up the symptoms and narrow down what it probably is.", "P+2 H-0.5"], ["Send them to my mechanic, then check in later to see how it went.", "L+1.5 T+1 H-1"]] },
  { s: 0, t: "pair", q: "Which feels better?", o: [["Cracking a problem nobody else could", "P+2 D+0.5 F-0.5"], ["Clearing a long to-do list in one afternoon", "F+2 C+1.5 P-0.5"]] },
  { s: 0, t: "scale", q: "I’d rather understand why something works than just know how to use it.", e: "P+2 G+0.5 C-0.5" },
  { s: 0, t: "choice", q: "Pick the free evening class you’d actually show up to every week.", o: [["Woodworking, pottery or jewellery-making", "H+2 D+1.5"], ["Sketching or photography", "V+2 D+0.5"], ["Chess, poker or strategy games", "P+1.5 R+1"], ["Improv or public speaking", "T+2 A+0.5"], ["A team sport or climbing", "M+1.5 A+1 S+0.5"], ["Talks on cities, economics or how systems work", "Z+2"]] },
  { s: 0, t: "scale", q: "I notice when a picture is hung slightly crooked, or a font changes halfway through a document.", e: "V+1.5 D+1.5" },
  { s: 0, t: "choice", q: "You’re watching a mystery series. Which is most you?", o: [["I’m tracking clues and have a theory by episode two.", "P+2 V+0.5"], ["I care more about the characters than who did it.", "T+1.5 L+1 E+0.5"], ["I like shows where each episode wraps up its own case.", "C+2 F+1 L-1"], ["Honestly I’d rather watch something with more action.", "A+1.5 P-1"]] },
  { s: 0, t: "pair", q: "Would you rather be…", o: [["The world expert in one narrow thing", "B-2 D+1"], ["Very good at a wide range of things", "B+2 D-0.5"]] },
  { s: 0, t: "scale", q: "A question with no clear answer is more interesting to me than one with a neat solution.", e: "P+1.5 C-1.5" },
  // 2 How you work
  { s: 1, t: "choice", q: "A group project lands on your team. Without trying, you end up as…", o: [["The one running the plan and handing out jobs", "M+1 R+1 A+0.5"], ["The one who disappears and comes back with the deep research", "M-1.5 P+1.5"], ["The one quietly checking every detail before it goes out", "D+2 M-0.5"], ["The one keeping everyone talking and getting along", "T+1.5 M+1.5"], ["The one who builds the actual thing", "H+2 C+1"]] },
  { s: 1, t: "scale", q: "I learn a new skill best by just doing it, badly at first, rather than reading about it.", e: "H+1.5 C+0.5 P-0.5" },
  { s: 1, t: "pair", q: "Which kitchen would you rather run?", o: [["Short-order grill: forty plates an hour, every one good", "F+2 B+1 A+0.5"], ["Tasting menu: twelve perfect courses a night", "D+2 F-1.5"]] },
  { s: 1, t: "scale", q: "I can stay focused on one task for hours and completely lose track of time.", e: "D+1 H+1 S+1" },
  { s: 1, t: "choice", q: "You’re putting together flat-pack furniture. Honestly:", o: [["I read every page of the instructions before touching a screw.", "D+2 R-1"], ["I lay out every part, then dive in and check the diagrams as I go.", "H+1 D+0.5 V+1"], ["I skip the manual and figure it out. A leftover screw is fine.", "H+1 C+1 R+1 D-1.5"], ["I’d rather pay someone to do it.", "H-2"]] },
  { s: 1, t: "scale", q: "I’d rather work through thirty quick, straightforward cases than five tangled ones.", e: "F+2 C+1 P-1.5" },
  { s: 1, t: "scale", q: "Getting to use serious equipment and new technology would make a job more fun for me.", e: "G+2 H+0.5" },
  { s: 1, t: "choice", q: "Which piece of feedback would make your week?", o: [["“Your work was flawless. Not a single error.”", "D+2 V+0.5"], ["“You figured out what everyone else missed.”", "P+2"], ["“You stayed calm when everything was falling apart.”", "A+2 R+1"], ["“You made me feel heard.”", "T+2 E+1 L+0.5"], ["“You fixed it. It’s done.”", "C+2 H+1"]] },
  { s: 1, t: "scale", q: "I’d rather work with a tight crew who know each other well than mostly on my own.", e: "M+1.5" },
  // 3 Under pressure
  { s: 2, t: "choice", q: "A fire alarm goes off in a crowded building. Your honest first instinct?", o: [["Figure out if it’s real and start pointing people to the exits.", "A+2 M+1 R+1"], ["Get myself and the people next to me out, calmly.", "A+0.5"], ["Look around for anyone who might need help getting out.", "T+1 E+1 A+1"], ["Wait a second. It’s probably a drill.", "A-1.5 R-0.5"]] },
  { s: 2, t: "scale", q: "I do my best work when the deadline is a little too tight.", e: "A+1.5 F+1" },
  { s: 2, t: "scale", q: "I’d rather my workday be predictable than exciting.", e: "A-2 Y+1" },
  { s: 2, t: "scale", q: "I’d rather make a quick call and sometimes be wrong than freeze while I gather more information.", e: "R+1.5 A+1 C+0.5 P-0.5" },
  { s: 2, t: "scale", q: "If a mistake of mine seriously hurt someone, I’d struggle to let it go, even years later.", e: "R-1.5 E-0.5" },
  { s: 2, t: "choice", q: "Your relationship with sleep:", o: [["I can run on very little for a while and still function.", "S+1.5 A+1"], ["I can pull a late night, but I pay for it the next day.", "S+0"], ["I need my full eight hours, or I’m not myself.", "S-1.5 Y+1"]] },
  { s: 2, t: "choice", q: "In a board game, you’re usually the one who…", o: [["Goes for the big risky play", "R+2 A+0.5"], ["Plays a slow, steady strategy and wins at the end", "R-1 L+1 D+0.5"], ["Reads the other players and works out their plans", "P+1 T+1"], ["Quietly helps whoever is losing", "E+1 T+1 M+1"]] },
  { s: 2, t: "pair", q: "Which story would you rather be able to tell?", o: [["I kept a stranger alive through the worst ten minutes of their life.", "A+2 C+1.5 L-1"], ["I helped someone slowly turn their life around over ten years.", "L+2 T+1 A-1"]] },
  // 4 People and feelings
  { s: 3, t: "scale", q: "After a long day of talking with people, I feel more energized than drained.", e: "T+2" },
  { s: 3, t: "choice", q: "At a party where you only know the host, you…", o: [["End up in one long, deep conversation", "T+1 L+1 E+0.5"], ["Bounce around and meet half the room", "T+1.5 F+1 B+0.5"], ["Find a job to do, like helping in the kitchen", "M+1 H+0.5 T-0.5"], ["Find the host’s dog and stay there", "T-1.5"]] },
  { s: 3, t: "scale", q: "I’d be happy in a job where most of the people I help never learn my name.", e: "T-2 M+0.5" },
  { s: 3, t: "choice", q: "A toddler at the next table keeps staring at you. You…", o: [["Make faces until they laugh", "K+2 T+0.5"], ["Smile, then go back to my food", "K+0"], ["Feel a bit awkward and look away", "K-1.5"]] },
  { s: 3, t: "scale", q: "I can sit with someone who is crying without feeling I need to fix it.", e: "E+2 T+1 C-0.5" },
  { s: 3, t: "choice", q: "A friend calls at 2 a.m. in a crisis. You’re most likely to…", o: [["Listen for as long as they need", "E+1.5 T+1 L+0.5"], ["Help them make a plan for what to do next", "C+1 P+0.5 R+0.5"], ["Get in the car and go", "A+1.5 H+0.5"], ["Calm them down, then suggest you talk properly in the morning", "E-1 Y+1"]] },
  { s: 3, t: "scale", q: "Sad movies and hard stories stay with me for days.", e: "E-1.5" },
  { s: 3, t: "scale", q: "I stay patient with anxious people who ask me the same question five times.", e: "T+1 K+1 L+1 E+0.5" },
  { s: 3, t: "pair", q: "Which would bother you more?", o: [["Never finding out what happened to someone you helped", "L+2 C-0.5"], ["Dealing with the same problem over and over without it ever going away", "C+2 L-2"]] },
  // 5 The life you want
  { s: 4, t: "choice", q: "A dream job offer arrives, but it means working about one weekend in three. You…", o: [["Take it. Work I love is worth it.", "Y-2 S+1"], ["Take it, and work on trading shifts or shaping it over time.", "S+0.5"], ["Turn it down. Weekends are mine.", "Y+2 S-1"]] },
  { s: 4, t: "choice", q: "Two equally interesting jobs. How much more would the second one have to pay for you to work 10 extra hours a week?", o: [["No amount. My time isn’t for sale.", "Y+2 $-1"], ["A lot. Maybe 50% more.", "Y+0.5 $+0.5"], ["About 20% more would do it.", "$+1.5 Y-1"], ["I’d do it for more interesting work, not money.", "$-1.5 Y-1 S+0.5"]] },
  { s: 4, t: "scale", q: "I’m fine putting parts of “real life” on hold for a few more years if the goal at the end is right.", e: "S+2 Y-0.5" },
  { s: 4, t: "scale", q: "A high income is a big part of the life I picture for myself at 45.", e: "$+2" },
  { s: 4, t: "scale", q: "I’d rather fix a broken system than help one person at a time.", e: "Z+2 T-0.5 L-0.5" },
  { s: 4, t: "choice", q: "You get a year off with full pay. You would…", o: [["Write something, or dig into a big research question", "P+1 Z+1"], ["Launch a project or campaign that changes how things work", "Z+2 R+0.5"], ["Volunteer somewhere, working with people one-on-one", "T+1.5 E+1 L+0.5"], ["Learn a hands-on craft properly", "H+2 D+1"], ["Travel, stay active and see as much as possible", "B+1 A+0.5 Y+1"]] },
  // 6 Wildcards
  { s: 5, t: "choice", q: "Those pimple-popping and splinter-removal videos are…", o: [["Weirdly satisfying. I’ve watched more than I’d admit.", "H+1.5 V+1 C+1"], ["Fine. Not my thing, but they don’t bother me.", "H+0"], ["Absolutely not.", "H-2"]] },
  { s: 5, t: "choice", q: "Which subject came most naturally to you in school?", o: [["Physics, or how machines work", "G+2 H+0.5"], ["Anatomy, or where everything sits", "H+1 V+1 D+0.5"], ["Biochemistry, or how the pathways connect", "P+2"], ["Psychology, or why people do what they do", "T+1 E+1"], ["Statistics, or what’s happening across a population", "Z+2 P+0.5"], ["Art or design", "V+2"]] },
  { s: 5, t: "scale", q: "Once I’ve mastered something, I start getting bored of it.", e: "B+1.5 F+0.5 L-0.5" },
  { s: 5, t: "choice", q: "You have a free afternoon to volunteer. Pick one:", o: [["Reading to kids at the library", "K+2 T+1"], ["Visiting residents at a care home", "K-1 L+1 E+1 T+1"], ["Sorting donations at a food bank", "Z+1 M+1 T-1"], ["Running the first-aid tent at a marathon", "A+1.5 H+1"]] },
  { s: 5, t: "pair", q: "Which kind of satisfying?", o: [["Fixing a leaking pipe", "C+2 H+1"], ["Growing a garden over a season", "L+2 C-1"]] },
  { s: 5, t: "pick2", q: "Pick the two things you’d hate most in a job.", o: [["Doing almost the same thing every day", "B+1.5 F-0.5"], ["Never seeing how things turned out", "L+1.5"], ["Getting woken up at night", "Y+1.5 A-1"], ["Sitting at a desk or a screen all day", "H+1.5 T+0.5 V-0.5"], ["Dealing with upset people constantly", "E-1.5 T-0.5"], ["Having nobody to share big decisions with", "M+1.5 R-0.5"], ["Waiting months to find out if something worked", "C+1.5 L-0.5"], ["Talking with people all day", "T-1.5"]] },
];
QZ_Q.forEach((q, i) => (q.id = "q" + (i + 1)));

const qzFx = (str) => {
  const o = {};
  (str || "").split(/\s+/).filter(Boolean).forEach((p) => {
    const m = /^(.)([+-][\d.]+)$/.exec(p);
    if (m) o[m[1]] = (o[m[1]] || 0) + +m[2];
  });
  return o;
};
/* Range each trait can move across the whole quiz, for scaling answers to 0–10 */
const QZ_RANGE = (() => {
  const lo = {}, hi = {}, mid = {};
  QZ_K.forEach((k) => (lo[k] = hi[k] = mid[k] = 0));
  QZ_Q.forEach((q) => {
    QZ_K.forEach((k) => {
      let vals, m;
      if (q.t === "scale") {
        const e = qzFx(q.e)[k] || 0;
        vals = [-Math.abs(e), Math.abs(e)];
        m = 0;
      } else {
        const o = q.o.map((x) => qzFx(x[1])[k] || 0).sort((a, b) => a - b);
        const avg = o.reduce((a, b) => a + b, 0) / o.length;
        if (q.t === "pick2") {
          vals = [o[0] + o[1], o[o.length - 1] + o[o.length - 2]];
          m = 2 * avg;
        } else {
          vals = [o[0], o[o.length - 1]];
          m = avg;
        }
      }
      lo[k] += vals[0];
      hi[k] += vals[1];
      mid[k] += m;
    });
  });
  return { lo, hi, mid };
})();

function qzUser(ans) {
  const sum = {};
  QZ_K.forEach((k) => (sum[k] = 0));
  QZ_Q.forEach((q) => {
    const a = ans[q.id];
    if (a == null) return;
    if (q.t === "scale") {
      const f = qzFx(q.e);
      for (const k in f) sum[k] += (f[k] * (+a - 3)) / 2;
    } else {
      [].concat(a).forEach((i) => {
        const f = qzFx(q.o[i] && q.o[i][1]);
        for (const k in f) sum[k] += f[k];
      });
    }
  });
  const u = {};
  QZ_K.forEach((k) => {
    // A typical, middle-of-the-road set of answers lands at 5; the extremes at 0 and 10.
    const lo = QZ_RANGE.lo[k], hi = QZ_RANGE.hi[k], mid = QZ_RANGE.mid[k], v = sum[k];
    u[k] = v >= mid ? (hi > mid ? 5 + (5 * (v - mid)) / (hi - mid) : 5) : mid > lo ? 5 - (5 * (mid - v)) / (mid - lo) : 5;
    u[k] = Math.max(0, Math.min(10, u[k]));
  });
  return u;
}
/* A specialty or fellowship profile as {trait: 0–10} */
function qzProf(id, subIdx) {
  const a = QZ_P[id];
  if (!a) return null;
  const p = {};
  QZ_PK.forEach((k, i) => (p[k] = a[i]));
  const r = (OV[id] && OV[id].r) || [3, 3];
  p["$"] = 2 * r[0] - 1;
  p.Y = 2 * r[1] - 1;
  if (subIdx != null) {
    const d = qzFx((QZ_SUB[id] || [])[subIdx]);
    for (const k in d) p[k] = Math.max(0, Math.min(10, p[k] + d[k]));
  }
  return p;
}
function qzPen(type, u, p) {
  if (type === "need") return u > p ? u - p : 0.25 * (p - u);
  if (type === "cap") return p > u ? p - u : 0.35 * (u - p);
  if (type === "kid") return p > u ? Math.min(10, 1.5 * (p - u)) : 0.55 * (u - p);
  return Math.abs(u - p);
}
/* Score one profile against the user: 0–100, plus per-trait detail */
function qzScore(u, p) {
  let num = 0, den = 0;
  const parts = QZ_T.map(([k, , w, type]) => {
    // Traits you feel strongly about count more. Kids and time off still count when you’re neutral.
    const strength = Math.min(1, Math.abs(u[k] - 5) / 4);
    const floor = k === "K" ? 0.6 : k === "Y" ? 0.3 : 0.15;
    const we = w * (floor + (1 - floor) * strength);
    const pen = qzPen(type, u[k], p[k]);
    num += we * pen;
    den += we * 10;
    return { k, we, pen, u: u[k], p: p[k] };
  });
  const raw = 1 - num / den; // typically 0.55–0.9
  const pct = Math.round(100 * Math.max(0, Math.min(1, (raw - 0.45) / 0.5)) ** 0.85);
  return { pct: Math.max(1, Math.min(99, pct)), raw, parts };
}
function qzResults(ans) {
  const u = qzUser(ans);
  const list = S.filter((s) => QZ_P[s.id]).map((s) => {
    const base = qzScore(u, qzProf(s.id));
    const subs = (s.subs || []).map((x, i) => ({ i, name: x.name, ...qzScore(u, qzProf(s.id, i)) })).sort((a, b) => b.raw - a.raw);
    const best = subs[0];
    const raw = best ? 0.55 * base.raw + 0.45 * best.raw : base.raw;
    const pct = best ? Math.round(0.55 * base.pct + 0.45 * best.pct) : base.pct;
    return { id: s.id, name: s.name, base, subs, best, raw, pct };
  });
  list.sort((a, b) => b.raw - a.raw);
  return { u, list };
}
function qzArch(u) {
  const ranked = QZ_T.filter(([k]) => QZ_ARCH[k])
    .map(([k]) => ({ k, s: Math.abs(u[k] - 5) * (u[k] >= 5 ? 1.15 : 1), hi: u[k] >= 5 }))
    .filter((x) => QZ_ARCH[x.k][x.hi ? 0 : 1])
    .sort((a, b) => b.s - a.s);
  const top = ranked[0] || { k: "B", hi: true };
  const name = QZ_ARCH[top.k][top.hi ? 0 : 1];
  return { name, blurb: QZ_ARCH_BLURB[name] || "", traits: ranked.slice(0, 4).map((x) => ({ k: x.k, hi: x.hi })) };
}
/* Why it fits, and what might rub, for one specialty (or fellowship) */
function qzWhy(score, name) {
  const T = Object.fromEntries(QZ_T.map((t) => [t[0], t]));
  const fits = score.parts
    .filter((x) => Math.abs(x.u - 5) >= 1.4 && x.pen <= 2.6 && (x.u >= 5) === (x.p >= 5))
    .map((x) => ({ ...x, s: x.we * Math.abs(x.u - 5) * (1 - x.pen / 6) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
    .map((x) => {
      const t = T[x.k];
      return { k: x.k, title: t[1], text: `${x.u >= 5 ? t[4] : t[5]}, and ${name} ${x.p >= 5 ? t[6] : t[7]}.` };
    });
  const rubs = score.parts
    .filter((x) => x.pen >= 3.2)
    .map((x) => ({ ...x, s: x.we * x.pen }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((x) => {
      const t = T[x.k];
      const same = (x.u >= 5) === (x.p >= 5);
      const text = same
        ? `${x.u >= 5 ? t[4] : t[5]}, and ${name} only partly gives you that.`
        : `${x.u >= 5 ? t[4] : t[5]}, but ${name} ${x.p >= 5 ? t[6] : t[7]}.`;
      return { k: x.k, title: t[1], text };
    });
  return { fits, rubs };
}

/* Storage. The hosted site swaps these for the user’s account. */
const QZ = {
  load() {
    try { return JSON.parse(localStorage.getItem("ir-quiz") || "null"); } catch (e) { return null; }
  },
  save(o) {
    try { localStorage.setItem("ir-quiz", JSON.stringify(o)); } catch (e) {}
  },
  draft() {
    try { return JSON.parse(localStorage.getItem("ir-quiz-draft") || "null"); } catch (e) { return QZ._d || null; }
  },
  setDraft(o) {
    QZ._d = o;
    try { o ? localStorage.setItem("ir-quiz-draft", JSON.stringify(o)) : localStorage.removeItem("ir-quiz-draft"); } catch (e) {}
  },
  name: () => "",
  gate: null, // returns HTML to show instead of the quiz (e.g. a sign-in prompt), or null
};
const qzEsc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const qzRing = (pct, size) => `<span class="qzring" style="--p:${pct};--sz:${size || 64}px" role="img" aria-label="${pct}% match"><b>${pct}<small>%</small></b></span>`;

let QZ_STATE = null; // {i, a} while answering
function renderQuiz() {
  const main = $("#main");
  const [, arg] = hashParts();
  const crumb = `<p class="crumb"><a href="#home">Home</a> / Specialty match quiz</p>`;
  const gate = QZ.gate && QZ.gate();
  if (gate) {
    main.innerHTML = crumb + gate;
    return;
  }
  const done = QZ.load();
  if (arg === "retake" || arg === "start") {
    QZ_STATE = { i: 0, a: {} };
    QZ.setDraft(QZ_STATE);
    try { history.replaceState(null, "", "#quiz"); } catch (e) {}
    return qzAsk();
  }
  if (arg === "resume" || QZ_STATE) {
    QZ_STATE = QZ_STATE || QZ.draft() || { i: 0, a: {} };
    try { history.replaceState(null, "", "#quiz"); } catch (e) {}
    return qzAsk();
  }
  if (done && done.a) return qzShowResults(done, arg);
  qzIntro();
}
function qzIntro() {
  const d = QZ.draft();
  const n = d && d.a ? Object.keys(d.a).length : 0;
  const nm = QZ.name();
  $("#main").innerHTML = `<p class="crumb"><a href="#home">Home</a> / Specialty match quiz</p>
  <section class="qzintro">
    <div class="qzintrotext"><p class="qzkicker">Specialty match quiz</p><h1>Find the specialty that fits ${nm ? qzEsc(nm) : "you"}</h1>
    <p class="qzlede">${QZ_Q.length} questions about how you think, work, handle pressure and want to live. Most of them aren’t about medicine at all. There are no right answers, and the more honestly you answer, the better the match.</p>
    <ul class="qzfacts"><li><b>About 10 minutes</b><span>${QZ_SEC.length} short sections</span></li><li><b>Top 5 matches</b><span>With a match % for each</span></li><li><b>Best-fit fellowship</b><span>Inside every specialty</span></li></ul>
    <div class="qzrow">${n ? `<button type="button" class="btn" data-qz="resume">Resume (question ${Math.min(QZ_Q.length, (d.i || 0) + 1)} of ${QZ_Q.length})</button><button type="button" class="tbtn" data-qz="start">Start over</button>` : `<button type="button" class="btn" data-qz="start">Start the quiz</button>`}</div>
    <p class="qzfine">Go with your first instinct. You can go back and change any answer before you finish.</p></div>
    <div class="qzintroart" aria-hidden="true">${[94, 88, 83].map((p, i) => `<div class="qzghost" style="--d:${i}">${qzRing(p, 46)}<span><i></i><i></i></span></div>`).join("")}</div>
  </section>`;
  $("#main").querySelectorAll("[data-qz]").forEach((b) => (b.onclick = () => (location.hash = "quiz/" + b.dataset.qz)));
}
function qzAsk() {
  const st = QZ_STATE;
  const q = QZ_Q[st.i];
  const a = st.a[q.id];
  const pctDone = Math.round((st.i / QZ_Q.length) * 100);
  const secStart = QZ_Q.findIndex((x) => x.s === q.s);
  const secLen = QZ_Q.filter((x) => x.s === q.s).length;
  let body = "";
  if (q.t === "scale") {
    const L = ["Not me at all", "Not really", "Somewhat", "Mostly", "That’s me"];
    body = `<div class="qzscale" role="radiogroup" aria-label="How much is this like you?">${L.map((l, i) => `<button type="button" role="radio" class="qzsc${a === i + 1 ? " on" : ""}" aria-checked="${a === i + 1}" data-v="${i + 1}"><i style="--s:${[1.15, 0.9, 0.7, 0.9, 1.15][i]}"></i><span>${l}</span></button>`).join("")}</div>`;
  } else if (q.t === "pair") {
    body = `<div class="qzpair">${q.o.map((o, i) => `<button type="button" class="qzopt qzbig${a === i ? " on" : ""}" data-v="${i}"><span>${qzEsc(o[0])}</span></button>${i === 0 ? `<span class="qzor">or</span>` : ""}`).join("")}</div>`;
  } else {
    const multi = q.t === "pick2";
    const sel = multi ? [].concat(a || []) : [];
    body = `<div class="qzopts${multi ? " multi" : ""}">${q.o.map((o, i) => `<button type="button" class="qzopt${(multi ? sel.includes(i) : a === i) ? " on" : ""}" data-v="${i}"${multi ? ` aria-pressed="${sel.includes(i)}"` : ""}><kbd>${i + 1}</kbd><span>${qzEsc(o[0])}</span></button>`).join("")}</div>
    ${multi ? `<p class="qzhint">${sel.length}/2 picked</p>` : ""}`;
  }
  const canNext = q.t === "pick2" ? [].concat(a || []).length === 2 : a != null;
  $("#main").innerHTML = `<div class="qzwrap">
    <div class="qztop"><button type="button" class="qzback" data-qzb${st.i ? "" : " disabled"} aria-label="Previous question">← Back</button><span class="qzsec">${QZ_SEC[q.s]} <small>${st.i - secStart + 1}/${secLen}</small></span><span class="qzcount">${st.i + 1} of ${QZ_Q.length}</span></div>
    <div class="qzbar" role="progressbar" aria-valuenow="${pctDone}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pctDone}%"></i>${QZ_SEC.map((_, s) => `<b style="left:${(QZ_Q.findIndex((x) => x.s === s) / QZ_Q.length) * 100}%"></b>`).join("")}</div>
    <div class="qzcard" data-t="${q.t}"><p class="qzq">${qzEsc(q.q)}</p>${body}
    <div class="qznav">${q.t === "pick2" || a != null ? `<button type="button" class="btn qznext"${canNext ? "" : " disabled"}>${st.i === QZ_Q.length - 1 ? "See my matches" : "Next"}</button>` : ""}<button type="button" class="qzquit">Save and exit</button></div></div>
  </div>`;
  const main = $("#main");
  const next = () => {
    QZ.setDraft(st);
    if (st.i < QZ_Q.length - 1) {
      st.i++;
      QZ.setDraft(st);
      qzAsk();
      window.scrollTo(0, 0);
    } else qzFinish();
  };
  main.querySelectorAll("[data-v]").forEach(
    (b) =>
      (b.onclick = () => {
        const v = +b.dataset.v;
        if (q.t === "pick2") {
          let s = [].concat(st.a[q.id] || []);
          s = s.includes(v) ? s.filter((x) => x !== v) : s.concat(v).slice(-2);
          st.a[q.id] = s;
          QZ.setDraft(st);
          qzAsk();
          return;
        }
        st.a[q.id] = v;
        QZ.setDraft(st);
        main.querySelectorAll("[data-v]").forEach((x) => x.classList.toggle("on", x === b));
        clearTimeout(QZ_STATE._t);
        QZ_STATE._t = setTimeout(next, 260);
      }),
  );
  const nb = main.querySelector(".qznext");
  if (nb) nb.onclick = () => { if (canNext) next(); };
  main.querySelector("[data-qzb]").onclick = () => {
    if (!st.i) return;
    clearTimeout(st._t);
    st.i--;
    QZ.setDraft(st);
    qzAsk();
  };
  main.querySelector(".qzquit").onclick = () => {
    QZ.setDraft(st);
    QZ_STATE = null;
    location.hash = QZ.exit || "home";
  };
}
function qzKeys(e) {
  if (!QZ_STATE || hashParts()[0] !== "quiz" || e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test((e.target && e.target.tagName) || "")) return;
  const n = +e.key;
  const btns = [...document.querySelectorAll("#main .qzcard [data-v]")];
  if (n >= 1 && n <= btns.length) {
    btns[n - 1].click();
    e.preventDefault();
  } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
    const b = document.querySelector("#main [data-qzb]");
    if (b && !b.disabled) {
      b.click();
      e.preventDefault();
    }
  } else if (e.key === "Enter") {
    const b = document.querySelector("#main .qznext");
    if (b && !b.disabled) {
      b.click();
      e.preventDefault();
    }
  }
}
document.addEventListener("keydown", qzKeys);
function qzFinish() {
  const st = QZ_STATE;
  const missing = QZ_Q.findIndex((q) => (q.t === "pick2" ? [].concat(st.a[q.id] || []).length < 1 : st.a[q.id] == null));
  if (missing >= 0) {
    st.i = missing;
    return qzAsk();
  }
  const r = qzResults(st.a);
  const o = { v: 1, at: new Date().toISOString(), a: st.a, top: r.list.slice(0, 5).map((x) => ({ id: x.id, pct: x.pct, sub: x.best ? x.best.i : null })) };
  QZ.save(o);
  QZ.setDraft(null);
  QZ_STATE = null;
  location.hash = "quiz";
  render();
}
function qzShowResults(done, openId) {
  const r = qzResults(done.a);
  const arch = qzArch(r.u);
  const nm = QZ.name();
  const top = r.list.slice(0, 5);
  const open = openId && top.find((x) => x.id === openId) ? openId : top[0].id;
  const dt = new Date(done.at || Date.now()).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  const T = Object.fromEntries(QZ_T.map((t) => [t[0], t]));
  const card = (x, i) => {
    const w = qzWhy(x.base, x.name);
    const lead = w.fits[0] ? w.fits[0].title : "";
    return `<article class="qzpick${x.id === open ? " open" : ""}" data-id="${x.id}">
      <button type="button" class="qzpickhead" aria-expanded="${x.id === open}">
        <span class="qzrank">${i + 1}</span>
        <span class="qzpname"><b>${qzEsc(x.name)}</b>${x.best ? `<small>Best fit: ${qzEsc(x.best.name)} · ${x.best.pct}%</small>` : lead ? `<small>Strongest fit: ${qzEsc(lead)}</small>` : ""}</span>
        ${qzRing(x.pct, 54)}<span class="qzchev" aria-hidden="true"></span></button>
      <div class="qzpickbody">${x.id === open ? qzDetail(x) : ""}</div></article>`;
  };
  const more = r.list.slice(5, 10);
  const least = r.list.slice(-3).reverse();
  $("#main").innerHTML = `<p class="crumb"><a href="#home">Home</a> / Specialty match quiz</p>
  <div class="qzreshead"><div><p class="qzkicker">Our picks for you</p><h1>${nm ? qzEsc(nm) + ", here" : "Here"}’s where you’d thrive</h1><p class="qzlede">From your quiz on ${dt}. Open any match to see why it fits, where it might not, and which fellowship suits you best.</p></div>
    <div class="qzrow"><button type="button" class="tbtn" data-qz="retake">Retake quiz</button>${top.length > 1 ? `<a class="tbtn" href="#vs-${top.slice(0, 4).map((x) => x.id).join("-")}">Compare your top 4</a>` : ""}</div></div>
  <section class="qzarch"><div class="qzarchbadge" aria-hidden="true">${qzEsc(arch.name.replace(/^The /, "")[0])}</div><div><p class="qzkicker">Your type</p><h2>${qzEsc(arch.name)}</h2><p>${qzEsc(arch.blurb)}</p>
    <div class="qzchips">${arch.traits.map((t) => `<span>${qzEsc(T[t.k][1])}: ${t.hi ? "high" : "low"}</span>`).join("")}</div></div></section>
  <div class="qzpicks">${top.map(card).join("")}</div>
  <div class="qzextra"><section><h2>Also worth a look</h2><ol class="qzmini" start="6">${more.map((x) => `<li><a href="#${x.id}">${qzEsc(x.name)}</a><span>${x.pct}%</span></li>`).join("")}</ol></section>
  <section><h2>Least like you</h2><ul class="qzmini">${least.map((x) => `<li><a href="#${x.id}">${qzEsc(x.name)}</a><span>${x.pct}%</span></li>`).join("")}</ul></section></div>
  <p class="qzfine"><span class="tag e">Estimate</span> A starting point, not a verdict. Each specialty’s profile is our estimate from the site’s ratings, hours and job data and from physician commentary. Use it to decide what to shadow next.</p>`;
  const main = $("#main");
  main.querySelector('[data-qz="retake"]').onclick = () => (location.hash = "quiz/retake");
  main.querySelectorAll(".qzpickhead").forEach(
    (h) =>
      (h.onclick = () => {
        const art = h.closest(".qzpick");
        const isOpen = art.classList.toggle("open");
        h.setAttribute("aria-expanded", isOpen);
        if (isOpen && !art.querySelector(".qzdet")) art.querySelector(".qzpickbody").innerHTML = qzDetail(top.find((x) => x.id === art.dataset.id));
      }),
  );
  if (openId) {
    const el = main.querySelector(`.qzpick[data-id="${open}"]`);
    if (el) setTimeout(() => el.scrollIntoView({ block: "start", behavior: "smooth" }), 60);
  }
}
function qzDetail(x) {
  const w = qzWhy(x.base, x.name);
  const ov = OV[x.id] || {};
  const T = Object.fromEntries(QZ_T.map((t) => [t[0], t]));
  const shown = x.base.parts
    .slice()
    .sort((a, b) => b.we * Math.abs(b.u - 5) - a.we * Math.abs(a.u - 5))
    .slice(0, 8);
  const dot = (v) => `${Math.round(v * 10)}%`;
  const bars = shown
    .map(
      (t) => `<li><span class="qztn">${qzEsc(T[t.k][1])}</span><span class="qztrack"><i class="qzyou" style="left:${dot(t.u)}" title="You"></i><i class="qzthem" style="left:${dot(t.p)}" title="${qzEsc(x.name)}"></i><i class="qzgap" style="left:${dot(Math.min(t.u, t.p))};width:${dot(Math.abs(t.u - t.p))}"></i></span></li>`,
    )
    .join("");
  const subs = x.subs.length
    ? `<h3 class="qzh3">Fellowships, ranked for you</h3><ol class="qzsubs">${x.subs
        .map((s, j) => `<li${j ? "" : ' class="best"'}><a href="#sub-${x.id}-${s.i}">${qzEsc(s.name)}</a><span class="qzsubbar"><i style="width:${s.pct}%"></i></span><b>${s.pct}%</b></li>`)
        .join("")}</ol>`
    : "";
  // What makes the best fellowship suit you better than the specialty as a whole
  let bestWhy = [];
  if (x.best) {
    const T2 = Object.fromEntries(QZ_T.map((t) => [t[0], t]));
    const gain = x.subs[0].parts
      .map((sp, j) => ({ ...sp, g: x.base.parts[j].we * x.base.parts[j].pen - sp.we * sp.pen, d: sp.p - x.base.parts[j].p }))
      .filter((sp) => sp.d && sp.g > 0.15)
      .sort((a, b) => b.g - a.g)[0];
    if (gain) {
      const t = T2[gain.k];
      bestWhy = [{ text: `Compared with ${x.name} as a whole, ${x.best.name} has ${gain.d > 0 ? "more" : "less"} ${t[1].toLowerCase()}, which fits your answers better.` }];
    } else {
      const f = qzWhy(x.subs[0], x.best.name).fits[0];
      if (f) bestWhy = [f];
    }
  }
  return `<div class="qzdet">
    ${ov.does ? `<p class="qzdoes">${ov.does}</p>` : ""}
    <div class="qzcols"><div><h3 class="qzh3 good">Why it fits</h3>${w.fits.length ? `<ul class="qzwhy">${w.fits.map((f) => `<li><b>${qzEsc(f.title)}.</b> ${qzEsc(f.text)}</li>`).join("")}</ul>` : `<p class="qznone">A balanced fit: no single trait stands out, and nothing clashes.</p>`}</div>
    <div><h3 class="qzh3 warn">What might rub</h3>${w.rubs.length ? `<ul class="qzwhy rub">${w.rubs.map((f) => `<li><b>${qzEsc(f.title)}.</b> ${qzEsc(f.text)}</li>`).join("")}</ul>` : `<p class="qznone">Nothing major. Your answers don’t clash with how this specialty works.</p>`}</div></div>
    <h3 class="qzh3">You vs. ${qzEsc(x.name)}</h3><div class="qzlegend"><span><i class="qzyou"></i>You</span><span><i class="qzthem"></i>${qzEsc(x.name)}</span></div><ul class="qzbars">${bars}</ul>
    ${subs}${bestWhy.length ? `<p class="qzbestwhy"><b>Why ${qzEsc(x.best.name)}:</b> ${qzEsc(bestWhy[0].text)}</p>` : ""}
    <div class="qzrow"><a class="btn" href="#${x.id}">Open ${qzEsc(x.name)}</a>${x.best ? `<a class="tbtn" href="#sub-${x.id}-${x.best.i}">Open ${qzEsc(x.best.name)}</a>` : ""}</div></div>`;
}
