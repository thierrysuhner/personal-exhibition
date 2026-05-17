// ─── Pilot / GitHub identity ──────────────────────────────────────
// Used by the live cockpit instruments in the header.
const pilot = {
  githubUser: "PLACEHOLDER_GITHUB_USERNAME",     // ← replace with your GitHub handle
  callsign:   "TS-001",
  homeBase:   "LSZH"
};

// ─── Pre-flight checklist (press C in the app) ────────────────────
// Acts as a skills list dressed up as a pilot's checklist.
// Replace / extend with your real items.
const preflightChecklist = [
  { group: "AIRFRAME · LANGUAGES",       items: ["Python", "TypeScript / JavaScript", "Go", "SQL", "Bash"] },
  { group: "AVIONICS · FRAMEWORKS",      items: ["React", "Node.js", "FastAPI", "TensorFlow / PyTorch", "GCP / BigQuery"] },
  { group: "NAV · TOOLS",                items: ["Git", "Docker", "Linux", "Figma", "Notion"] },
  { group: "COMMS · LANGUAGES (HUMAN)",  items: ["German (native)", "English (C2)", "French (B2)", "Italian (A2)"] },
  { group: "PILOT · SOFT SKILLS",        items: ["Cross-functional leadership", "Public speaking", "Stakeholder management", "Bias to ship"] }
];

// ─── ATC bonus transmission (plays after Leg 5 lands) ─────────────
// The radio handshake that introduces the letter to Google.
// Edit if you want a different tone.
const atcTransmission = [
  { freq: "118.10",  who: "TS-001",     msg: "Zurich Tower, flight TS-001, short final runway 14, request clearance to land." },
  { freq: "118.10",  who: "ZRH TOWER",  msg: "TS-001, identify intent." },
  { freq: "118.10",  who: "TS-001",     msg: "Five legs filed. Destination: Google Zürich, Hürlimann Areal. Cargo: curiosity, code, and one engineering problem I'd like to work on." },
  { freq: "118.10",  who: "ZRH TOWER",  msg: "TS-001, transmission received. Stand by…" }
];

// ─── Letter (rendered after the transmission) ─────────────────────
// PLACEHOLDER — replace with your actual pitch. ~120 words feels right.
const clearanceLetter = {
  to:   "ATTN: HIRING CAPTAIN, GOOGLE ZÜRICH",
  from: "T. SUHNER, FLIGHT TS-001",
  body: [
    "PLACEHOLDER — open with one concrete thing about Google you actually care about (a product, a paper, a team). One sentence, specific.",
    "PLACEHOLDER — connect that to one thing in your flight log: a problem you've solved, a project you shipped, a moment you knew you wanted to build at this scale.",
    "PLACEHOLDER — what you'd bring on day one: language(s), domain, a skill that's rarer than the rest of your CV suggests.",
    "PLACEHOLDER — a clean ask. \"I'd like 30 minutes with someone on the X team\" beats \"please consider me.\""
  ],
  signoff: "Awaiting clearance,\nT. Suhner"
};

// ─── Chapters ─────────────────────────────────────────────────────
const chapters = [
  {
    id: 1,
    leg: "LEG 01",
    location: "LENZBURG, CH",
    dateRange: "2019–2022",
    dot: "CH-LENZ",
    dotLabel: "Lenzburg",
    sketchAsset: "sketch-mediamatiker.svg",
    title: "PLACEHOLDER TITLE",
    body: "PLACEHOLDER — replace with your text. Max ~150 words. One concrete moment, specific, grounded.",
    callout: "PLACEHOLDER — one sentence key insight or decision.",
    stampText: "LOGGED",
    cargo: [
      { label: "PLACEHOLDER — project name",  url: "https://github.com/PLACEHOLDER/repo",  note: "1-line description" },
      { label: "PLACEHOLDER — demo or write-up", url: "https://example.com",                  note: "1-line description" }
    ]
  },
  {
    id: 2,
    leg: "LEG 02",
    location: "OFFICER SCHOOL / SPHAIR",
    dateRange: "PLACEHOLDER_DATE",
    dot: "CH-ARMY",
    dotLabel: "Army / SPHAIR",
    sketchAsset: "sketch-army.svg",
    title: "PLACEHOLDER TITLE",
    body: "PLACEHOLDER — replace with your text. Max ~150 words. One concrete moment, specific, grounded.",
    callout: "PLACEHOLDER — one sentence key insight or decision.",
    stampText: "LOGGED",
    cargo: [
      { label: "PLACEHOLDER — leadership artefact", url: "https://example.com", note: "1-line description" }
    ]
  },
  {
    id: 3,
    leg: "LEG 03",
    location: "ST. GALLEN, CH",
    dateRange: "PLACEHOLDER_DATE",
    dot: "CH-HSG",
    dotLabel: "St. Gallen",
    sketchAsset: "sketch-hsg.svg",
    title: "PLACEHOLDER TITLE",
    body: "PLACEHOLDER — replace with your text. Max ~150 words. One concrete moment, specific, grounded.",
    callout: "PLACEHOLDER — one sentence key insight or decision.",
    stampText: "LOGGED",
    cargo: [
      { label: "PLACEHOLDER — student project",     url: "https://github.com/PLACEHOLDER/repo", note: "1-line description" },
      { label: "PLACEHOLDER — paper or analysis",   url: "https://example.com",                  note: "1-line description" }
    ]
  },
  {
    id: 4,
    leg: "LEG 04",
    location: "VANCOUVER, CA",
    dateRange: "FEB 2026",
    dot: "CA-VAN",
    dotLabel: "Vancouver",
    sketchAsset: "sketch-caseit.svg",
    title: "PLACEHOLDER TITLE",
    body: "PLACEHOLDER — replace with your text. Max ~150 words. One concrete moment, specific, grounded.",
    callout: "PLACEHOLDER — one sentence key insight or decision.",
    stampText: "LOGGED",
    cargo: [
      { label: "PLACEHOLDER — case it! deck", url: "https://example.com", note: "1-line description" }
    ]
  },
  {
    id: 5,
    leg: "LEG 05",
    location: "GOOGLE ZÜRICH · HÜRLIMANN AREAL",
    dateRange: "PENDING",
    dot: "CH-GOOG",
    dotLabel: "Google Zürich",
    sketchAsset: "sketch-googzh.svg",
    title: "FILED. AWAITING CLEARANCE.",
    body: "PLACEHOLDER — short approach note. Two or three handwritten sentences explaining why this is the final waypoint. Keep it human — the formal pitch lives in the transmission.",
    callout: "PLACEHOLDER — one sentence on what you'd bring to a Google engineering or product team.",
    stampText: null,
    contactEmail: "t.suhner@PLACEHOLDER.com",
    contactLinkedin: "linkedin.com/in/PLACEHOLDER",
    cargo: [
      { label: "GitHub · see all repos",  url: "https://github.com/PLACEHOLDER_GITHUB_USERNAME", note: "Public work, weekend builds, open source" },
      { label: "CV · one-pager",            url: "https://example.com/cv.pdf",                       note: "PDF (1 page)" }
    ],
    isFinalDestination: true
  }
];

const dotPositions = {
  "CH-LENZ": { x: 20, y: 70 },
  "CH-ARMY": { x: 25, y: 40 },
  "CH-HSG":  { x: 45, y: 55 },
  "CA-VAN":  { x: 72, y: 35 },
  "CH-GOOG": { x: 88, y: 50 }
};
