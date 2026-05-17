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
    items: ["Python", "Java", "TypeScript / JavaScript", "Go", "SQL", "Bash"]
  },
  {
    group: "AVIONICS · FRAMEWORKS & TECH",
    items: ["Spring Boot + REST APIs", "React / Node.js", "FastAPI", "TensorFlow / PyTorch", "Docker", "Domain-Driven Design"]
  },
  {
    group: "NAV · TOOLS",
    items: ["Git / GitHub workflows", "Linux / Unix environments", "Figma", "Behavior-Driven Development"]
  },
  {
    group: "COMMS · LANGUAGES (HUMAN)",
    items: ["German (native)", "English (C2)", "French (B2)", "Italian (A2)"]
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
    "The flight log behind this letter is the honest account. Mediamatician at fifteen - production code, real clients, Friday deadlines. Swiss Army officer, second-in-command of 130 people under pressure. Computer Science at HSG: layered Java systems, ML deployment, Domain-Driven Design, API development in Python and Go. VP of a student consulting club that competes internationally and wins. The thread across all of it: I look for environments where technical depth and real stakes converge.",
    "On day one I'd bring software design, REST API development, and data-driven problem-solving across Python, Java, and Go; fluency in Linux/Unix, Docker, and GitHub-based workflows; and the habit - formed at fifteen, not taught - of shipping software that has to work.",
    "I'd welcome 30 minutes with someone on the engineering team in Zürich. Not to pitch a generic application - to ask specific questions about the work."
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
    title: "FIRST DEPARTURE",
    body: "At twelve, I spent three weeks researching CPU socket types before touching a single component. The machine posted. That disposition - understand first, then build - turned into a vocation at fifteen when I began a three-year apprenticeship as a Mediamatician in Lenzburg. While peers studied theory, I was debugging a client's live website and explaining to the account manager why a missing semicolon had taken the contact form down since Tuesday. We wrote production code, worked in small teams, and shipped software to real users with real deadlines. The job title translates roughly as \"media technician,\" but what the apprenticeship actually gave me was a concrete education in the gap between design and implementation - between a system that works in a browser tab on your laptop and one that survives contact with real traffic, real edge cases, and real people who do not read the instructions. I arrived at university four years later than most of my classmates. I arrived knowing what shipping feels like.",
    callout: "The fastest way to understand a system is to be responsible for it when it breaks.",
    stampText: "LOGGED",
    cargo: [
      { label: "GitHub · all public repos",        url: "https://github.com/thierrysuhner",          note: "Production code, side projects, coursework" },
      { label: "Java CMS - layered architecture",  url: "https://github.com/thierrysuhner",          note: "RESTful API, highest possible grade" }
    ]
  },
  {
    id: 2,
    leg: "LEG 02",
    location: "OFFICER SCHOOL / SPHAIR",
    dateRange: "MAY 2023 – OCT 2023",
    dot: "CH-ARMY",
    dotLabel: "Army / SPHAIR",
    sketchAsset: "sketch-army.svg",
    title: "PRESSURE ALTITUDE",
    body: "Swiss officer training is designed to remove comfort systematically. I was second-in-command of an infantry company - responsible for the safety, readiness, and decisions of more than 130 people. The lesson was not about authority. It was about reliability: people follow whoever is consistently clear-headed when conditions are not. I learned more about decision-making under genuine uncertainty in those months than in any other environment. In parallel, I entered SPHAIR - the Swiss Air Force pilot selection programme. I did not pass the final stage. That outcome was clarifying rather than comfortable: the process exposed specific gaps in how I performed under certain high-stakes assessment conditions, and what it takes to close them. Both experiences confirmed something I had started to suspect at fifteen - I work best when the constraints are real and the consequences for getting it wrong actually exist. The cockpit framing in this exhibition is not decorative. It is a precise reference.",
    callout: "I work best when the constraints are real and the consequences for getting it wrong actually exist.",
    stampText: "LOGGED",
    cargo: [
      { label: "SPHAIR - Swiss Air Force selection", url: "https://www.sphair.ch",                   note: "Pilot aptitude programme" },
      { label: "Swiss Army officer corps",           url: "https://www.vtg.admin.ch",                note: "Infantry, 2IC role, 130+ personnel" }
    ]
  },
  {
    id: 3,
    leg: "LEG 03",
    location: "ST. GALLEN, CH",
    dateRange: "SEP 2024–",
    dot: "CH-HSG",
    dotLabel: "St. Gallen",
    sketchAsset: "sketch-hsg.svg",
    title: "CRUISE ALTITUDE",
    body: "The challenge at HSG has not been difficulty. It has been choosing what to go deep on. I built a Java content management system with layered architecture and a RESTful API - it received the highest possible grade, which matters less to me than the fact that the architectural decisions behind it were intentional and defensible. I trained and deployed a random forest model to predict restaurant revenues from real staffing data. I am currently applying Domain-Driven Design to a full backend system for a vehicle subscription platform - writing bounded contexts, defining aggregates, and integrating third-party APIs in a way that would survive a real engineering review. The pattern across all three: I am drawn to problems where the design question is harder than the implementation. Understanding why a system is structured a certain way, what breaks first under real load, and where the abstraction boundary should sit - these are the questions I keep returning to. ESPRIT runs alongside this as VP, with real client projects and international competition results. That context matters. It is not the main story of this leg.",
    callout: "The signal that you understand a system is being able to explain clearly what you would change about it - and why.",
    stampText: "LOGGED",
    cargo: [
      { label: "Vehicle subscription platform",      url: "https://github.com/unisg-scs-se/BSC_FS26_SE_GROUP01", note: "DDD, full backend, BDD, API integration" },
      { label: "Restaurant revenue ML model",        url: "https://github.com/Luggias/DSF_Group_Project",        note: "Random forest, deployed, real staffing data" },
      { label: "ESPRIT - HSG consulting club",       url: "https://espritsg.ch/",                                note: "VP, international competition wins" }
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
    title: "TRANSATLANTIC",
    body: "CaseIT is one of the world's largest international business case competitions. In February I flew to Vancouver with a team from ESPRIT to compete across four days of cases, presentations, and very little sleep. We won our division. But the note I wrote in my reflection exercise does not mention the trophy. It says: \"new friends, deep talks, going through hard work together.\" That is the accurate account. What I remember from Vancouver is not the conference room. It is the hotel lobby late on the second evening - working through a market-sizing framework with three people who had become real friends in 48 hours. I have been noticing a pattern: my highest moments are not achievement moments. They are moments of difficulty endured alongside people I respect. The trophy is evidence that those moments happened. It is not the point.",
    callout: "My best work has always happened in rooms where the stakes were real and the people were worth impressing.",
    stampText: "LOGGED",
    cargo: [
      { label: "CaseIT 2026 - Vancouver",            url: "https://www.caseit.org/",                 note: "Division winners, international field" },
      { label: "ESPRIT - competition team",          url: "https://www.linkedin.com/posts/university-of-st-gallen_hsg-studierende-gewinnen-zum-dritten-mal-ugcPost-7311300636686311424-TwtY?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEc4mhQBlTDRuCRLggThKaB_TyCfrxVBgkM", note: "4-person team, cross-functional prep" }
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
    body: "The previous four legs share a common shape. Each one put me in an environment with real constraints, real stakes, and people who did not accept imprecision. A production codebase at fifteen. An infantry company at twenty-two. A case competition podium at twenty-three. A computer science degree still in progress, with layered systems, deployed models, and one backend I would genuinely defend in a technical review. The thread across all of it is not a list of achievements. It is a consistent preference for environments where the difficulty is intrinsic to the problem - where getting it right requires understanding something deeply rather than moving fast past the hard part. That is why this waypoint is Google Zürich. Not because of the name, but because the engineering problems there are hard in the right way: at a scale where architectural decisions carry real consequences, and where the people building them are the kind I have consistently done my best work around. This is the first leg I have not yet reached. The route here was non-standard. So is the request.",
    callout: "I want to build systems where engineering decisions affect millions of people - and be in a room with engineers who already have.",
    stampText: null,
    contactEmail: "thierry.suhner@gmx.ch",
    contactLinkedin: "linkedin.com/in/thierrysuhner",
    cargo: [
      { label: "GitHub · thierrysuhner",             url: "https://github.com/thierrysuhner",        note: "Public work, weekend builds, open source" },
      { label: "CV · one-pager",                     url: "cv.pdf",                                  note: "PDF, opens in browser" }
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
