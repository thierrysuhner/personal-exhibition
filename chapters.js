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
    body: "At twelve, I spent three weeks researching CPU socket types before touching a single component. The machine posted. That disposition - understand first, then build - turned into a vocation at fifteen when I began a three-year apprenticeship as a Mediamatician in Lenzburg. While peers studied theory, I was debugging a client's live website and apologising to the account manager about a missing semicolon. We wrote production code, worked in teams, and shipped software to real users - responsible for things that had to work by Friday. The job title translates roughly as \"media technician,\" but what it gave me was more structural than that: a visceral sense of the difference between a design that looks good in Figma and a system that survives contact with real traffic. I arrived at university four years later than most. I arrived knowing what shipping feels like.",
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
    body: "When I mapped happiness against time for this course, the army sat at the top - which surprises people who know what Swiss officer training actually involves. I was second-in-command of an infantry company responsible for more than 130 people. The logic of command is exact: you do not inspire through slides; you inspire by being first through the door. What drove happiness up was not the rank. It was the compression - a group of people thrown into situations that stripped away every comfort and replaced it with one question: can you hold this together? Most of the time, the answer was yes. SPHAIR, the Swiss Air Force pilot selection programme, ran in parallel. I did not get the wings, but I kept the altitude. The cockpit metaphor in this exhibition is not decorative - it is where I learned that structure and ambition are not constraints. They are the conditions for flight.",
    callout: "Structure and high expectations do not cage people - they give them something real to push against.",
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
    body: "HSG is where I finally found the theoretical layer beneath everything I had already built by hand. Algorithms, data structures, system design - the vocabulary that makes engineering conversations precise. I designed a Java CMS with layered architecture and RESTful API (highest possible grade), trained and deployed a random forest model to predict restaurant revenues (Data Science Fundamentals certificate: ML, time series, neural networks), and am currently applying Domain-Driven Design to a full backend system for a vehicle subscription platform. Away from the terminal, I serve as Vice President of ESPRIT, HSG's student consulting club - co-managing real client projects, competing internationally, and using Python for data analysis. The reflection I wrote midway through the degree captures what I found: the three dimensions of university life are not equal pillars. The ground beneath all of them is pressure - and that is not a problem. It is the point.",
    callout: "The people who leave with the best stories chose which ball to drop. The juggling itself was the point.",
    stampText: "LOGGED",
    cargo: [
      { label: "Vehicle subscription platform",      url: "https://github.com/thierrysuhner",        note: "DDD, full backend, BDD, API integration" },
      { label: "Restaurant revenue ML model",        url: "https://github.com/thierrysuhner",        note: "Random forest, deployed, real staffing data" },
      { label: "ESPRIT - HSG consulting club",       url: "https://esprit-hsg.com",                  note: "VP, international competition wins" }
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
      { label: "CaseIT 2026 - Vancouver",            url: "https://www.caseit.ca",                   note: "Division winners, international field" },
      { label: "ESPRIT - competition team",          url: "https://esprit-hsg.com",                  note: "4-person team, cross-functional prep" }
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
    body: "Five legs. Each one flew somewhere new - technically, professionally, personally. A terminal at fifteen, an infantry company at twenty-two, a case competition podium at twenty-three, a computer science degree still in progress. All connected by the same thread: environments where engineering challenges are too interesting to put down, and where the people around me refuse to accept good-enough. This waypoint is the first I have not yet reached. The destination is Google Zürich, at the Hürlimann Areal - a former brewery that became a hub for people building products used by billions. Things change function when the right people inhabit them. I want to build systems where engineering decisions affect millions of users, and learn from the engineers who already do. The route here was non-standard. So is the request for clearance.",
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
