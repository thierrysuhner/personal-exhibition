// ─── Pilot / GitHub identity ──────────────────────────────────────
const pilot = {
  githubUser: "thierrysuhner",
  callsign:   "TS-001",
  homeBase:   "LSZH",
  actype:     "PYTHON"   // override GitHub language detection
};

// ─── Pre-flight checklist (press C in the app) ────────────────────
const preflightChecklist = [
  {
    group: "AIRFRAME · LANGUAGES",
    items: ["Python", "Java", "TypeScript / JavaScript", "SQL", "Bash"]
  },
  {
    group: "AVIONICS · FRAMEWORKS & TECH",
    items: ["Spring Boot + REST APIs", "React / Node.js", "TensorFlow / PyTorch", "Docker", "Domain-Driven Design"]
  },
  {
    group: "NAV · TOOLS",
    items: ["Git / GitHub workflows", "Linux / Unix environments", "Figma", "Behavior-Driven Development"]
  },
  {
    group: "COMMS · LANGUAGES (HUMAN)",
    items: ["German (native)", "English (C2)", "French (B2)"]
  },
  {
    group: "PILOT · COMMAND & LEADERSHIP",
    items: ["Infantry company 2IC - 130+ people", "ESPRIT VP - real client projects", "International case competition winner", "Structured problem-solving under pressure", "Bias to ship"]
  }
];

// ─── ATC bonus transmission (plays after Leg 5 lands) ─────────────
const atcTransmission = [
  { freq: "118.10", who: "TS-001",    msg: "Zurich Tower, flight TS-001, short final runway 14, request clearance to land." },
  { freq: "118.10", who: "ZRH TOWER", msg: "TS-001, identify intent." },
  { freq: "118.10", who: "TS-001",    msg: "Five legs filed. Destination: Google Zürich, Hürlimann Areal. Cargo: curiosity, code, and one engineering problem I'd like to work on." },
  { freq: "118.10", who: "ZRH TOWER", msg: "TS-001, transmission received. Stand by…" }
];

// ─── Clearance letter (rendered after the transmission) ───────────
const clearanceLetter = {
  to:   "ATTN: HIRING CAPTAIN, GOOGLE ZÜRICH",
  from: "T. SUHNER, FLIGHT TS-001",
  body: [
    "I'm drawn to Google because of the scale - not scale as an abstraction, but the engineering reality of building infrastructure that millions of people rely on without ever thinking about. I want to work on problems where the difficulty is intrinsic to the domain, not imposed by tooling, and where the person two desks away has already solved something I haven't yet imagined.",
    "The flight log behind this letter is the honest account. Mediamatician at fifteen: production code, real clients, Friday deadlines. Swiss Army officer, second-in-command of 130 people under pressure. Computer Science at HSG: layered Java systems, ML deployment, Domain-Driven Design, API development in Python. VP of a student consulting club that competes internationally and wins. The thread across all of it: I look for environments where technical depth and real stakes converge.",
    "On day one I'd bring software design, REST API development, and data-driven problem-solving across Python and Java; fluency in Linux/Unix, Docker, and GitHub-based workflows; and the habit, formed at fifteen not taught, of shipping software that has to work.",
    "I'd welcome 30 minutes with someone on the engineering team in Zürich. Not to pitch a generic application - to ask specific questions about the work."
  ],
  signoff: "Awaiting clearance,\nT. Suhner"
};

// ─── Chapters ─────────────────────────────────────────────────────
const chapters = [
  {
    id: 1,
    leg: "LEG 01",
    location: "URDORF, CH",
    dateRange: "2018–2022",
    dot: "CH-LENZ",
    dotLabel: "Urdorf",
    sketchAsset: "Leg_1.PNG",
    title: "EARLY RESPONSIBILITY",
    mapLabel: "Early Resp.",
    subtitle: "Practical work before theory",
    signal: "shipping responsibility",
    body: "At fourteen, I spent three weeks researching CPU socket types before touching a single component. The machine worked first try. That disposition, understand first then build, stayed. At fifteen I began a four-year apprenticeship as a Mediamatician in Urdorf. While classmates were in school, I was writing production code, working in small teams, and shipping software to real users with real deadlines. The job title is Mediamatician, roughly a combination of media, technology, and design, but what the apprenticeship gave me was a concrete understanding of the gap between design and implementation: the difference between a system that works in a browser tab and one that survives contact with real traffic, real edge cases, and real people who do not read the instructions. By the time it ended, I already knew what shipping felt like.",
    callout: "The fastest way to understand a system is to be responsible for it when it breaks.",
    stampText: "LOGGED",
    cargo: [
      { label: "client work · web applications",   url: "https://ncag.ch/en/software-solutions/",    note: "Production code, real deadlines" },
      { label: "design systems · production mindset", url: "https://github.com/thierrysuhner",       note: "From mockup to user-facing systems" }
    ]
  },
  {
    id: 2,
    leg: "LEG 02",
    location: "OFFICER SCHOOL / SPHAIR",
    dateRange: "MAY 2023 – OCT 2023",
    dot: "CH-ARMY",
    dotLabel: "Army / SPHAIR",
    sketchAsset: "Leg_2.png",
    title: "PRESSURE & SELF-OVERRIDE",
    mapLabel: "Pressure",
    subtitle: "Learning to function beyond comfort",
    signal: "calm under pressure",
    body: "Swiss officer training removes comfort methodically. I was second-in-command of an infantry company, responsible for the safety, readiness, and decisions of more than 130 people. What I noticed was not about authority. It was about reliability: in uncertain conditions, people orient toward whoever is consistently clear-headed. I learned more about decision-making under genuine uncertainty in those months than in any other environment. In parallel, I entered SPHAIR, the Swiss Air Force pilot selection programme. I did not pass the final stage, not because of performance but because my eyesight did not meet the medical requirements. That outcome was clarifying in its own way: I had gone further than most applicants and confirmed I could operate under that kind of pressure. Both experiences reinforced something I had started to suspect at fifteen. I work best when the constraints are real and the consequences for getting it wrong actually exist. That is partly why the cockpit framing felt appropriate for this exhibition.",
    callout: "I work best when the constraints are real and the consequences for getting it wrong actually exist.",
    stampText: "LOGGED",
    cargo: [
      { label: "leadership · endurance",           url: "https://www.vtg.admin.ch",                note: "Infantry company 2IC, 130+ personnel" },
      { label: "communication · responsibility",  url: "https://www.sphair.ch",                   note: "Pilot selection, high-stakes learning" }
    ]
  },
  {
    id: 3,
    leg: "LEG 03",
    location: "ST. GALLEN, CH",
    dateRange: "SEP 2024–",
    dot: "CH-HSG",
    dotLabel: "St. Gallen",
    sketchAsset: "Leg_3.PNG",
    title: "BUILDING DIRECTION",
    mapLabel: "Building Dir.",
    subtitle: "Connecting technical depth, ambition, and identity",
    signal: "building direction",
    body: "The challenge at HSG has not been difficulty. It has been choosing what to go deep on. The coursework covers layered Java architecture, machine learning deployment, and Domain-Driven Design. Different in surface, but each one raises the same question: why is this system structured the way it is, and what would break first under real load? That question has stayed with me more than any grade. The pattern I have noticed is that I am drawn to problems where the design decision is harder than the implementation, where getting the structure right matters more than getting it done quickly. Running ESPRIT alongside this has added a different kind of complexity. ESPRIT is the student-run consultancy of HSG, working on real client mandates and competing internationally. As VP, I deal with client work, time pressure, and decisions made with incomplete information. Operating across both has taught me something about managing competing priorities that coursework alone would not have.",
    callout: "The sign that you understand a system is being able to explain clearly what you would change about it - and why.",
    stampText: "LOGGED",
    cargo: [
      { label: "computer science · data",            url: "https://github.com/Luggias/DSF_Group_Project",        note: "ML deployment, systems thinking" },
      { label: "business · systems thinking",        url: "https://espritsg.ch/",                                 note: "Consulting, case strategy, analysis" },
      { label: "technical depth · architecture",     url: "https://github.com/unisg-scs-se/BSC_FS26_SE_GROUP01",  note: "DDD, layered systems, design decisions" }
    ]
  },
  {
    id: 4,
    leg: "LEG 04",
    location: "VANCOUVER, CA",
    dateRange: "FEB 2026",
    dot: "CA-VAN",
    dotLabel: "Vancouver",
    sketchAsset: "Leg_4.PNG",
    title: "COLLABORATION AT INTENSITY",
    mapLabel: "Collaboration",
    subtitle: "Meaningful work is rarely individual",
    signal: "team intensity",
    body: "CaseIT is one of the largest international business case competitions. In February I flew to Vancouver with a team from ESPRIT to compete across four days of cases, presentations, and very little sleep. We won our division. The note I wrote in my reflection does not mention the trophy - it says 'new friends, deep talks, going through hard work together.' That is closer to what I actually remember. The hotel lobby late on the second evening, working through a market-sizing framework with three people who had become real friends in 48 hours. My best work has usually happened alongside people whose standards raised mine. Vancouver was a clear instance of that.",
    callout: "My best work has usually happened around people whose standards raised mine.",
    stampText: "LOGGED",
    cargo: [
      { label: "case competition · strategy",        url: "https://www.caseit.org/",                 note: "CaseIT 2026, division winners" },
      { label: "teamwork · presentation",            url: "https://www.linkedin.com/posts/university-of-st-gallen_hsg-studierende-gewinnen-zum-dritten-mal-ugcPost-7311300636686311424-TwtY?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEc4mhQBlTDRuCRLggThKaB_TyCfrxVBgkM", note: "4-person team, structured problem-solving" }
    ]
  },
  {
    id: 5,
    leg: "LEG 05",
    location: "GOOGLE ZÜRICH · HÜRLIMANN AREAL",
    dateRange: "PENDING",
    dot: "CH-GOOG",
    dotLabel: "Google Zürich",
    sketchAsset: "Leg_5.PNG",
    title: "SYSTEMS AT SCALE",
    mapLabel: "Systems@Scale",
    subtitle: "Seeking environments where engineering affects millions",
    signal: "engineering at scale",
    body: "The previous four legs share a shape: each one put me in an environment where the difficulty was real, the people held high standards, and getting things wrong had consequences. That combination is where I have consistently done my best work. It is also what I am looking for next. Google Zürich specifically - not for the name, but because the engineering problems there are hard in the way that interests me: at a scale where architectural decisions carry real weight, and around people who have already solved problems I am still learning to ask. This is the leg I have not yet reached. The application is the route.",
    callout: "I want to work on problems where the engineering difficulty is intrinsic - and be around people who have already navigated them.",
    stampText: null,
    contactEmail: "thierry.suhner@gmx.ch",
    contactLinkedin: "linkedin.com/in/thierrysuhner",
    cargo: [
      { label: "Python · Java",                       url: "https://github.com/thierrysuhner",        note: "Production systems, backend design" },
      { label: "systems · distributed thinking",     url: "cv.pdf",                                  note: "Scale-aware engineering, technical leadership" }
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

// ─── Black Box Waypoints ──────────────────────────────────────────
// Small narrative fragments showing emotional origins, non-linear decisions,
// and formative moments. These are not achievements—they are quiet realizations.
const waypoints = [
  {
    id: "first-detour",
    type: "COURSE DEVIATION",
    label: "FIRST DETOUR",
    placement: "before-leg-01",
    text: "One missed entrance exam quietly redirected the whole route."
  },
  {
    id: "corona-2020",
    type: "BLACK BOX ENTRY",
    label: "2020",
    placement: "after-leg-01",
    text: "Isolation made time visible. I started asking what my habits were actually building."
  },
  {
    id: "before-officer-school",
    type: "RECOVERED SIGNAL",
    label: "BEFORE OFFICER SCHOOL",
    placement: "inside-leg-02",
    text: "Aspiring to be a platoon leader was not obvious from where I started. That is partly why it mattered."
  },
  {
    id: "pressure-sleep",
    type: "COCKPIT NOTE",
    label: "PRESSURE",
    placement: "after-leg-02",
    text: "At some point I learned that sleep can matter more than the last five percent of preparation."
  },
  {
    id: "ground-check",
    type: "GROUND CHECK",
    label: "FAMILY & FRIENDS",
    placement: "after-leg-03",
    text: "Leaving ambitious environments regularly helps me remember what they are for."
  },
  {
    id: "hallwilersee",
    type: "RECOVERED SIGNAL",
    label: "HALLWILERSEE",
    placement: "before-leg-01",
    text: "Before ambition had a name, curiosity usually started outside."
  },
  {
    id: "singapore-camera",
    type: "WAYPOINT",
    label: "SINGAPORE",
    placement: "between-leg-01-and-leg-02",
    text: "I tried to capture a feeling before I understood why certain moments stay."
  }
];
