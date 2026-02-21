// ============================
// script.js — Compass Support (INTENT-BASED)
// - Theme toggle works + persists
// - Saved chats clickable
// - Campus resources ONLY show if a campus is selected
// - Detects: TAG + SUB-INTENT (more specific results)
// - Off-campus results: specific Google Maps links (not broad keyword blobs)
// - On-campus results: uses CAMPUS_DIRECTORY when available, otherwise creates campus-specific search links
// ============================

// ---------- Helpers ----------
function getCampusDirectory() {
  return window.CAMPUS_DIRECTORY || {};
}

function getSelectedCampusKey() {
  const el = document.getElementById("campusSelect");
  return el ? el.value : "";
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function uniqBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const k = keyFn(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

// ---------- Theme ----------
const THEME_KEY = "compass_theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  const btn = document.getElementById("themeToggle");
  if (btn) {
    const icon = btn.querySelector(".toggleIcon");
    const text = btn.querySelector(".toggleText");
    const isDark = theme === "dark";
    if (icon) icon.textContent = isDark ? "🌙" : "☀️";
    if (text) text.textContent = isDark ? "Dark" : "Light";
    btn.setAttribute("aria-pressed", String(isDark));
  }
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved || "light");
}

window.toggleTheme = function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
};

// ============================================================
// TAGS + SUB-INTENTS (this is the "not a search engine" part)
// ============================================================

const TAGS = {
  mental_health: "Mental Health & Emotional Support",
  health_support: "Physical Health & Medical Care",
  crisis: "Emergency & Safety",
  food_support: "Food & Basic Needs",
  academic_support: "Academic Support",
  career_support: "Career & Professional Development",
  financial_support: "Financial Support & Money Help",
  housing_support: "Housing & Living",
  transport_support: "Transportation & Mobility",
  identity_support: "Identity-Based & Cultural Support",
  legal_support: "Legal & Administrative Help",
  recreation_support: "Physical Wellness & Recreation",
  tech_support: "Tech & Study Infrastructure",
  community_support: "Social Connection & Community",
  relationship_support: "Relationship & Personal Support",
};

// This maps each SUB-INTENT to:
// - campusSearch: "query that finds the campus office/page"
// - mapsQuery: "query that finds local services near user"
// Keep these SHORT + SPECIFIC (no giant keyword blobs)
const INTENTS = {
  mental_health: {
    counseling: { label: "Counseling center", campusSearch: "counseling center", mapsQuery: "counseling center near me" },
    therapy: { label: "Therapy", campusSearch: "therapy services", mapsQuery: "therapist near me" },
    group: { label: "Group therapy", campusSearch: "group therapy", mapsQuery: "group therapy near me" },
    stress: { label: "Stress / burnout", campusSearch: "stress management workshop", mapsQuery: "stress management workshop near me" },
    peer: { label: "Peer support", campusSearch: "peer support program", mapsQuery: "peer support group near me" },
    default: { label: "Mental health support", campusSearch: "mental health support", mapsQuery: "mental health clinic near me" },
  },

  health_support: {
    health_center: { label: "Health center", campusSearch: "student health center", mapsQuery: "medical clinic near me" },
    urgent_care: { label: "Urgent care", campusSearch: "after hours care", mapsQuery: "urgent care near me" },
    pharmacy: { label: "Pharmacy", campusSearch: "pharmacy", mapsQuery: "pharmacy near me open now" },
    sti: { label: "STD/STI testing", campusSearch: "std sti testing", mapsQuery: "sti testing near me" },
    womens: { label: "Women’s health", campusSearch: "women's health services", mapsQuery: "women's health clinic near me" },
    insurance: { label: "Insurance help", campusSearch: "insurance help", mapsQuery: "health insurance help near me" },
    telehealth: { label: "Telehealth", campusSearch: "telehealth", mapsQuery: "telehealth appointment near me" },
    default: { label: "Medical care", campusSearch: "medical services", mapsQuery: "doctor near me" },
  },

  crisis: {
    campus_police: { label: "Campus police", campusSearch: "campus police", mapsQuery: "police station near me" },
    safe_walk: { label: "Safe walk / escort", campusSearch: "safe walk escort", mapsQuery: "safe walk program near me" },
    title_ix: { label: "Title IX / reporting", campusSearch: "Title IX office", mapsQuery: "sexual assault resource center near me" },
    dv: { label: "Domestic violence", campusSearch: "domestic violence resources", mapsQuery: "domestic violence hotline near me" },
    shelter: { label: "Emergency shelter", campusSearch: "emergency shelter", mapsQuery: "emergency shelter near me" },
    default: { label: "Safety resources", campusSearch: "emergency resources", mapsQuery: "crisis center near me" },
  },

  food_support: {
    cheap: { label: "Cheap food", campusSearch: "cheap food", mapsQuery: "cheap food near me" },
    late_night: { label: "Late-night food", campusSearch: "late night dining", mapsQuery: "late night food near me" },
    grocery: { label: "Grocery stores", campusSearch: "grocery shuttle grocery", mapsQuery: "grocery store near me" },
    pantry: { label: "Food pantry", campusSearch: "food pantry", mapsQuery: "food pantry near me" },
    free_meals: { label: "Free meals", campusSearch: "free meals", mapsQuery: "free meals near me" },
    halal: { label: "Halal food", campusSearch: "halal dining", mapsQuery: "halal food near me" },
    kosher: { label: "Kosher food", campusSearch: "kosher dining", mapsQuery: "kosher food near me" },
    vegan: { label: "Vegan food", campusSearch: "vegan dining", mapsQuery: "vegan food near me" },
    vegetarian: { label: "Vegetarian food", campusSearch: "vegetarian dining", mapsQuery: "vegetarian food near me" },
    snap: { label: "SNAP / EBT help", campusSearch: "SNAP EBT assistance", mapsQuery: "SNAP office near me" },
    default: { label: "Food & basic needs", campusSearch: "basic needs food support", mapsQuery: "food support services near me" },
  },

  academic_support: {
    tutoring: { label: "Tutoring", campusSearch: "tutoring center", mapsQuery: "tutoring center near me" },
    writing: { label: "Writing center", campusSearch: "writing center", mapsQuery: "writing tutor near me" },
    math: { label: "Math help", campusSearch: "math help tutoring", mapsQuery: "math tutor near me" },
    study_rooms: { label: "Study rooms", campusSearch: "study rooms reservation", mapsQuery: "study space near me" },
    library: { label: "Library hours", campusSearch: "library hours", mapsQuery: "library near me" },
    advising: { label: "Academic advising", campusSearch: "academic advising", mapsQuery: "academic coach near me" },
    disability: { label: "Disability accommodations", campusSearch: "disability accommodations", mapsQuery: "disability services near me" },
    test_prep: { label: "Test prep", campusSearch: "test prep resources", mapsQuery: "test prep center near me" },
    default: { label: "Academic support", campusSearch: "academic support", mapsQuery: "tutoring near me" },
  },

  career_support: {
    career_center: { label: "Career center", campusSearch: "career center", mapsQuery: "career center near me" },
    resume: { label: "Resume review", campusSearch: "resume review", mapsQuery: "resume review service near me" },
    interview: { label: "Mock interviews", campusSearch: "mock interview", mapsQuery: "interview coaching near me" },
    internship: { label: "Internships", campusSearch: "internship resources", mapsQuery: "internship coaching near me" },
    jobs: { label: "Part-time / on-campus jobs", campusSearch: "student employment jobs", mapsQuery: "part time jobs near me" },
    networking: { label: "Networking events", campusSearch: "networking events", mapsQuery: "networking events near me" },
    headshots: { label: "Professional headshots", campusSearch: "professional headshots", mapsQuery: "professional headshots near me" },
    linkedin: { label: "LinkedIn workshop", campusSearch: "LinkedIn workshop", mapsQuery: "LinkedIn workshop near me" },
    default: { label: "Career support", campusSearch: "career development", mapsQuery: "career coaching near me" },
  },

  financial_support: {
    aid: { label: "Financial aid office", campusSearch: "financial aid", mapsQuery: "financial aid office near me" },
    grants: { label: "Emergency grants", campusSearch: "emergency grant", mapsQuery: "emergency assistance near me" },
    scholarships: { label: "Scholarships", campusSearch: "scholarships", mapsQuery: "scholarship help near me" },
    payment: { label: "Payment plans", campusSearch: "tuition payment plan", mapsQuery: "bill payment assistance near me" },
    budgeting: { label: "Budgeting help", campusSearch: "budgeting workshop", mapsQuery: "budget counseling near me" },
    tax: { label: "Free tax prep", campusSearch: "free tax prep", mapsQuery: "free tax preparation near me" },
    work_study: { label: "Work-study", campusSearch: "work study", mapsQuery: "work study info near me" },
    default: { label: "Financial support", campusSearch: "financial support resources", mapsQuery: "financial assistance near me" },
  },

  housing_support: {
    res_life: { label: "Residence life / dorms", campusSearch: "residence life housing", mapsQuery: "student housing near me" },
    apartments: { label: "Student apartments", campusSearch: "student apartments", mapsQuery: "student apartments near me" },
    sublease: { label: "Subleases", campusSearch: "sublease", mapsQuery: "sublease near me" },
    roommates: { label: "Roommate search", campusSearch: "roommate search", mapsQuery: "roommate finder" },
    tenant: { label: "Tenant rights", campusSearch: "tenant rights renter", mapsQuery: "tenant rights organization near me" },
    moving: { label: "Moving help", campusSearch: "moving services", mapsQuery: "moving services near me" },
    default: { label: "Housing help", campusSearch: "housing assistance", mapsQuery: "housing assistance near me" },
  },

  transport_support: {
    shuttle: { label: "Campus shuttle", campusSearch: "campus shuttle schedule", mapsQuery: "shuttle service near me" },
    bus: { label: "Bus routes", campusSearch: "bus routes", mapsQuery: "bus station near me" },
    train: { label: "Train stations", campusSearch: "train station", mapsQuery: "train station near me" },
    airport: { label: "Airport shuttle", campusSearch: "airport shuttle", mapsQuery: "airport shuttle near me" },
    parking: { label: "Parking permits", campusSearch: "parking permits", mapsQuery: "parking garage near me" },
    bike: { label: "Bike share / repair", campusSearch: "bike share bike repair", mapsQuery: "bike repair near me" },
    rideshare: { label: "Rideshare info", campusSearch: "rideshare info", mapsQuery: "uber lyft pickup near me" },
    default: { label: "Transportation", campusSearch: "transportation services", mapsQuery: "transportation near me" },
  },

  identity_support: {
    multicultural: { label: "Multicultural center", campusSearch: "multicultural center", mapsQuery: "multicultural center near me" },
    womens: { label: "Women’s center", campusSearch: "women's center", mapsQuery: "women's center near me" },
    lgbtq: { label: "LGBTQ+ center", campusSearch: "LGBTQ center", mapsQuery: "LGBTQ center near me" },
    intl: { label: "International student office", campusSearch: "international student office", mapsQuery: "international student services near me" },
    religious: { label: "Religious spaces", campusSearch: "religious spaces", mapsQuery: "mosque temple church synagogue near me" },
    language: { label: "Language support", campusSearch: "language support services", mapsQuery: "language support services near me" },
    default: { label: "Identity-based support", campusSearch: "cultural support resources", mapsQuery: "community center near me" },
  },

  legal_support: {
    legal_services: { label: "Student legal services", campusSearch: "student legal services", mapsQuery: "legal aid near me" },
    immigration: { label: "Immigration help", campusSearch: "immigration help", mapsQuery: "immigration legal aid near me" },
    appeals: { label: "Academic appeals", campusSearch: "academic appeal", mapsQuery: "education advocacy near me" },
    disciplinary: { label: "Disciplinary support", campusSearch: "disciplinary support", mapsQuery: "legal consultation near me" },
    notary: { label: "Notary services", campusSearch: "notary", mapsQuery: "notary near me" },
    tenant_law: { label: "Tenant law advice", campusSearch: "tenant legal advice", mapsQuery: "tenant lawyer near me" },
    default: { label: "Legal help", campusSearch: "legal help resources", mapsQuery: "legal services near me" },
  },

  recreation_support: {
    gym: { label: "Campus gym", campusSearch: "campus gym", mapsQuery: "gym near me" },
    fitness: { label: "Fitness classes", campusSearch: "fitness classes", mapsQuery: "fitness classes near me" },
    yoga: { label: "Yoga / meditation", campusSearch: "yoga meditation", mapsQuery: "yoga near me" },
    intramural: { label: "Intramural sports", campusSearch: "intramural sports", mapsQuery: "intramural sports league near me" },
    outdoors: { label: "Outdoor spaces", campusSearch: "outdoor spaces", mapsQuery: "parks near me" },
    running: { label: "Running clubs", campusSearch: "running club", mapsQuery: "running club near me" },
    default: { label: "Wellness & recreation", campusSearch: "recreation wellness", mapsQuery: "recreation center near me" },
  },

  tech_support: {
    labs: { label: "Computer labs", campusSearch: "computer labs", mapsQuery: "computer lab near me" },
    printing: { label: "Printing services", campusSearch: "printing services", mapsQuery: "printing services near me" },
    wifi: { label: "Free WiFi", campusSearch: "free wifi", mapsQuery: "free wifi near me" },
    repair: { label: "Laptop repair", campusSearch: "laptop repair", mapsQuery: "laptop repair near me" },
    it: { label: "IT help desk", campusSearch: "IT help desk", mapsQuery: "IT support near me" },
    charging: { label: "Charging stations", campusSearch: "charging stations", mapsQuery: "charging station near me" },
    study_24: { label: "24-hour study", campusSearch: "24 hour study spaces", mapsQuery: "24 hour cafe near me" },
    default: { label: "Tech support", campusSearch: "technology support", mapsQuery: "computer repair near me" },
  },

  community_support: {
    clubs: { label: "Clubs & orgs", campusSearch: "clubs organizations", mapsQuery: "community groups near me" },
    events: { label: "Campus events", campusSearch: "campus events", mapsQuery: "events near me" },
    volunteering: { label: "Volunteer opportunities", campusSearch: "volunteer opportunities", mapsQuery: "volunteer opportunities near me" },
    faith: { label: "Faith-based groups", campusSearch: "faith-based groups", mapsQuery: "faith community near me" },
    mixers: { label: "Student mixers", campusSearch: "student mixers", mapsQuery: "social events near me" },
    default: { label: "Community & connection", campusSearch: "student community", mapsQuery: "community center near me" },
  },

  relationship_support: {
    counseling: { label: "Relationship counseling", campusSearch: "relationship counseling", mapsQuery: "relationship counseling near me" },
    breakup: { label: "Breakup support", campusSearch: "breakup support", mapsQuery: "support group near me" },
    mediation: { label: "Mediation", campusSearch: "mediation services", mapsQuery: "mediation services near me" },
    mentoring: { label: "Peer mentoring", campusSearch: "peer mentoring", mapsQuery: "mentoring program near me" },
    conflict: { label: "Conflict resolution", campusSearch: "conflict resolution", mapsQuery: "conflict resolution services near me" },
    sexual_health: { label: "Sexual health education", campusSearch: "sexual health education", mapsQuery: "sexual health clinic near me" },
    default: { label: "Personal support", campusSearch: "personal support services", mapsQuery: "counseling near me" },
  },
};

// ============================================================
// KEYWORDS → (tag + sub)
// Keep your originals, and map more keywords into sub-intents.
// IMPORTANT: keys with spaces MUST be quoted.
// ============================================================
const KEYWORD_INTENT_MAP = {
  // ---- Your originals (kept) ----
  "lonely": { tag: "community_support", sub: "default" },
  "alone": { tag: "community_support", sub: "default" },
  "friends": { tag: "community_support", sub: "default" },
  "isolated": { tag: "community_support", sub: "default" },

  "roommate": { tag: "relationship_support", sub: "conflict" },
  "relationship": { tag: "relationship_support", sub: "counseling" },
  "breakup": { tag: "relationship_support", sub: "breakup" },

  "harassed": { tag: "crisis", sub: "default" },
  "unsafe": { tag: "crisis", sub: "default" },
  "assaulted": { tag: "crisis", sub: "title_ix" },

  "drained": { tag: "mental_health", sub: "stress" },
  "anxious": { tag: "mental_health", sub: "therapy" },
  "anxiety": { tag: "mental_health", sub: "therapy" },
  "depressed": { tag: "mental_health", sub: "therapy" },
  "depression": { tag: "mental_health", sub: "therapy" },
  "stress": { tag: "mental_health", sub: "stress" },
  "stressed": { tag: "mental_health", sub: "stress" },
  "therapy": { tag: "mental_health", sub: "therapy" },
  "overwhelmed": { tag: "mental_health", sub: "stress" },
  "panic": { tag: "mental_health", sub: "therapy" },
  "burnout": { tag: "mental_health", sub: "stress" },
  "sad": { tag: "mental_health", sub: "therapy" },
  "hopeless": { tag: "mental_health", sub: "therapy" },
  "counseling": { tag: "mental_health", sub: "counseling" },

  "suicidal": { tag: "crisis", sub: "default" },
  "self harm": { tag: "crisis", sub: "default" },
  "self-harm": { tag: "crisis", sub: "default" },
  "kill myself": { tag: "crisis", sub: "default" },

  "money": { tag: "financial_support", sub: "default" },
  "rent": { tag: "housing_support", sub: "tenant" },
  "bills": { tag: "financial_support", sub: "payment" },
  "tuition": { tag: "financial_support", sub: "aid" },
  "debt": { tag: "financial_support", sub: "budgeting" },
  "finance": { tag: "financial_support", sub: "default" },
  "financial": { tag: "financial_support", sub: "default" },

  // ---- Food ----
  "food": { tag: "food_support", sub: "default" },
  "groceries": { tag: "food_support", sub: "grocery" },
  "cheap food": { tag: "food_support", sub: "cheap" },
  "cheap eats": { tag: "food_support", sub: "cheap" },
  "late night food": { tag: "food_support", sub: "late_night" },
  "late-night food": { tag: "food_support", sub: "late_night" },
  "food pantry": { tag: "food_support", sub: "pantry" },
  "free food": { tag: "food_support", sub: "free_meals" },
  "free meals": { tag: "food_support", sub: "free_meals" },
  "halal": { tag: "food_support", sub: "halal" },
  "kosher": { tag: "food_support", sub: "kosher" },
  "vegan": { tag: "food_support", sub: "vegan" },
  "vegetarian": { tag: "food_support", sub: "vegetarian" },
  "snap": { tag: "food_support", sub: "snap" },
  "ebt": { tag: "food_support", sub: "snap" },

  // ---- Academics ----
  "bad in school": { tag: "academic_support", sub: "default" },
  "failing": { tag: "academic_support", sub: "default" },
  "failed": { tag: "academic_support", sub: "default" },
  "grades": { tag: "academic_support", sub: "default" },
  "gpa": { tag: "academic_support", sub: "default" },
  "homework": { tag: "academic_support", sub: "tutoring" },
  "assignment": { tag: "academic_support", sub: "tutoring" },
  "exam": { tag: "academic_support", sub: "test_prep" },
  "test": { tag: "academic_support", sub: "test_prep" },
  "midterm": { tag: "academic_support", sub: "test_prep" },
  "final": { tag: "academic_support", sub: "test_prep" },
  "study room": { tag: "academic_support", sub: "study_rooms" },
  "study rooms": { tag: "academic_support", sub: "study_rooms" },
  "library": { tag: "academic_support", sub: "library" },
  "writing": { tag: "academic_support", sub: "writing" },
  "writing center": { tag: "academic_support", sub: "writing" },
  "math": { tag: "academic_support", sub: "math" },
  "math help": { tag: "academic_support", sub: "math" },
  "tutor": { tag: "academic_support", sub: "tutoring" },
  "tutoring": { tag: "academic_support", sub: "tutoring" },
  "advising": { tag: "academic_support", sub: "advising" },
  "advisor": { tag: "academic_support", sub: "advising" },
  "accommodations": { tag: "academic_support", sub: "disability" },
  "disability": { tag: "academic_support", sub: "disability" },

  // ---- Career ----
  "internship": { tag: "career_support", sub: "internship" },
  "resume": { tag: "career_support", sub: "resume" },
  "cover letter": { tag: "career_support", sub: "resume" },
  "interview": { tag: "career_support", sub: "interview" },
  "networking": { tag: "career_support", sub: "networking" },
  "linkedin": { tag: "career_support", sub: "linkedin" },
  "headshot": { tag: "career_support", sub: "headshots" },
  "jobs": { tag: "career_support", sub: "jobs" },

  // ---- Health ----
  "health center": { tag: "health_support", sub: "health_center" },
  "urgent care": { tag: "health_support", sub: "urgent_care" },
  "pharmacy": { tag: "health_support", sub: "pharmacy" },
  "sti": { tag: "health_support", sub: "sti" },
  "std": { tag: "health_support", sub: "sti" },
  "women's health": { tag: "health_support", sub: "womens" },
  "womens health": { tag: "health_support", sub: "womens" },
  "insurance": { tag: "health_support", sub: "insurance" },
  "telehealth": { tag: "health_support", sub: "telehealth" },

  // ---- Housing ----
  "housing": { tag: "housing_support", sub: "default" },
  "dorm": { tag: "housing_support", sub: "res_life" },
  "apartment": { tag: "housing_support", sub: "apartments" },
  "sublease": { tag: "housing_support", sub: "sublease" },
  "roommate search": { tag: "housing_support", sub: "roommates" },
  "tenant rights": { tag: "housing_support", sub: "tenant" },
  "renter rights": { tag: "housing_support", sub: "tenant" },
  "eviction": { tag: "housing_support", sub: "tenant" },
  "lease": { tag: "housing_support", sub: "tenant" },

  // ---- Transport ----
  "shuttle": { tag: "transport_support", sub: "shuttle" },
  "bus": { tag: "transport_support", sub: "bus" },
  "train": { tag: "transport_support", sub: "train" },
  "airport": { tag: "transport_support", sub: "airport" },
  "parking": { tag: "transport_support", sub: "parking" },
  "bike": { tag: "transport_support", sub: "bike" },
  "uber": { tag: "transport_support", sub: "rideshare" },
  "lyft": { tag: "transport_support", sub: "rideshare" },

  // ---- Identity / Cultural ----
  "multicultural": { tag: "identity_support", sub: "multicultural" },
  "women's center": { tag: "identity_support", sub: "womens" },
  "womens center": { tag: "identity_support", sub: "womens" },
  "lgbtq": { tag: "identity_support", sub: "lgbtq" },
  "international student": { tag: "identity_support", sub: "intl" },
  "religion": { tag: "identity_support", sub: "religious" },
  "language support": { tag: "identity_support", sub: "language" },

  // ---- Legal ----
  "legal": { tag: "legal_support", sub: "legal_services" },
  "legal services": { tag: "legal_support", sub: "legal_services" },
  "immigration": { tag: "legal_support", sub: "immigration" },
  "appeal": { tag: "legal_support", sub: "appeals" },
  "disciplinary": { tag: "legal_support", sub: "disciplinary" },
  "notary": { tag: "legal_support", sub: "notary" },

  // ---- Recreation ----
  "gym": { tag: "recreation_support", sub: "gym" },
  "fitness": { tag: "recreation_support", sub: "fitness" },
  "yoga": { tag: "recreation_support", sub: "yoga" },
  "meditation": { tag: "recreation_support", sub: "yoga" },
  "intramural": { tag: "recreation_support", sub: "intramural" },
  "running": { tag: "recreation_support", sub: "running" },

  // ---- Tech ----
  "printing": { tag: "tech_support", sub: "printing" },
  "printer": { tag: "tech_support", sub: "printing" },
  "wifi": { tag: "tech_support", sub: "wifi" },
  "computer lab": { tag: "tech_support", sub: "labs" },
  "laptop repair": { tag: "tech_support", sub: "repair" },
  "it help": { tag: "tech_support", sub: "it" },
  "help desk": { tag: "tech_support", sub: "it" },
  "charging": { tag: "tech_support", sub: "charging" },
  "24 hour study": { tag: "tech_support", sub: "study_24" },
  "24-hour study": { tag: "tech_support", sub: "study_24" },

  // ---- Community ----
  "clubs": { tag: "community_support", sub: "clubs" },
  "events": { tag: "community_support", sub: "events" },
  "volunteer": { tag: "community_support", sub: "volunteering" },
  "volunteering": { tag: "community_support", sub: "volunteering" },
  "faith": { tag: "community_support", sub: "faith" },
  "mixer": { tag: "community_support", sub: "mixers" },

  // ---- Relationship ----
  "mediation": { tag: "relationship_support", sub: "mediation" },
  "conflict": { tag: "relationship_support", sub: "conflict" },
  "peer mentoring": { tag: "relationship_support", sub: "mentoring" },
};

// ============================================================
// Matching: returns a list of detected intents {tag, sub}
// - prioritizes longer keyword phrases to avoid dumb matches
// ============================================================
function detectIntents(text) {
  const t = (text || "").toLowerCase();

  // Sort keywords longest-first so "late night food" matches before "food"
  const keys = Object.keys(KEYWORD_INTENT_MAP).sort((a, b) => b.length - a.length);

  const found = [];
  for (const k of keys) {
    if (!k) continue;
    if (t.includes(k)) found.push(KEYWORD_INTENT_MAP[k]);
  }

  // If nothing matches, default to academic support (student-friendly)
  if (found.length === 0) {
    found.push({ tag: "academic_support", sub: "default" });
  }

  // Deduplicate tag+sub combos
  return uniqBy(found, (x) => `${x.tag}::${x.sub}`);
}

// ============================================================
// Geolocation (prompts user if site served over http/https)
// ============================================================
function getGeoIfAllowed() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
    );
  });
}

// ============================================================
// Campus recommendations
// - ONLY if campus is selected
// - Pull real resources from CAMPUS_DIRECTORY by tag
// - ALSO generate "Campus search" fallback links for detected intents
// ============================================================
function buildCampusResourcesForIntents(campusKey, intents) {
  const dir = getCampusDirectory();
  const campus = dir[campusKey];
  if (!campus) return [];

  const resources = Array.isArray(campus.resources) ? campus.resources : [];

  const byTagMatches = [];
  for (const intent of intents) {
    const tag = intent.tag;
    const matches = resources.filter((r) => Array.isArray(r.tags) && r.tags.includes(tag));
    byTagMatches.push(...matches);
  }

  const dedupReal = uniqBy(byTagMatches, (r) => `${r.name}::${(r.links?.[0]?.url) || ""}`);

  // Now add fallback “campus search” items (so every tag/sub returns something)
  // Only add if we don’t already have at least 1 real resource for that tag.
  const tagsWithReal = new Set(dedupReal.flatMap((r) => r.tags || []));
  const campusLabel = campus.displayName || "your campus";

  const fallback = [];
  for (const intent of intents) {
    if (tagsWithReal.has(intent.tag)) continue;

    const config = INTENTS[intent.tag];
    const detail = (config && config[intent.sub]) ? config[intent.sub] : (config ? config.default : null);
    if (!detail) continue;

    const q = encodeURIComponent(`${campusLabel} ${detail.campusSearch}`);
    fallback.push({
      name: `On-campus search: ${detail.label}`,
      type: TAGS[intent.tag] || intent.tag,
      tags: [intent.tag],
      notes: `Searches for ${detail.label} at ${campusLabel}.`,
      links: [{ label: "Open search", url: `https://www.google.com/search?q=${q}` }],
    });
  }

  return [...dedupReal, ...fallback];
}

// ============================================================
// Off-campus resources
// - Google Maps links for each detected intent
// - Specific per sub-intent (train vs parking vs shuttle etc.)
// ============================================================
function buildOutsideResourcesForIntents(intents, geo) {
  const makeMapsUrl = (query) => {
    const q = encodeURIComponent(query);
    return geo?.lat && geo?.lon
      ? `https://www.google.com/maps/search/${q}/@${geo.lat},${geo.lon},13z`
      : `https://www.google.com/maps/search/${q}`;
  };

  // Priority: if food exists, include at least one food result
  const picked = [];
  const hasFood = intents.some((i) => i.tag === "food_support");
  if (hasFood) {
    // include the most specific food intent first
    const foodIntent = intents.find((i) => i.tag === "food_support" && i.sub !== "default") ||
                      intents.find((i) => i.tag === "food_support") ||
                      null;
    if (foodIntent) picked.push(foodIntent);
  }

  // then add others until we have at most 4
  for (const i of intents) {
    if (picked.length >= 4) break;
    if (picked.some((p) => p.tag === i.tag && p.sub === i.sub)) continue;
    picked.push(i);
  }

  const out = [];
  for (const intent of picked) {
    const config = INTENTS[intent.tag];
    const detail = (config && config[intent.sub]) ? config[intent.sub] : (config ? config.default : null);
    if (!detail) continue;

    out.push({
      name: `Nearby: ${detail.label}`,
      type: "Google Maps",
      notes: `Shows nearby options for ${detail.label}.`,
      links: [{ label: "Open map results", url: makeMapsUrl(detail.mapsQuery) }],
    });
  }

  return uniqBy(out, (r) => r.links?.[0]?.url || r.name);
}

// ============================================================
// Rendering
// ============================================================
function renderResourceList(resources) {
  if (!resources.length) return `<p class="muted">No matching resources found.</p>`;

  return `
    <ul class="steps">
      ${resources.map((r) => {
        const links = Array.isArray(r.links) ? r.links : [];
        return `
          <li>
            <strong>${escapeHtml(r.name || "")}</strong>
            ${r.type ? ` — ${escapeHtml(r.type)}` : ""}
            ${r.notes ? `<div class="muted">${escapeHtml(r.notes)}</div>` : ""}
            ${
              links.length
                ? `<div style="margin-top:6px; display:flex; gap:10px; flex-wrap:wrap;">
                    ${links.map((l) => `
                      <a class="link" href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">
                        ${escapeHtml(l.label)}
                      </a>
                    `).join("")}
                  </div>`
                : ""
            }
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

// ============================================================
// Saved chats
// ============================================================
const CHAT_KEY = "compass_chat_history_v1";

function loadChats() {
  try { return JSON.parse(localStorage.getItem(CHAT_KEY) || "[]"); }
  catch { return []; }
}

function saveChats(chats) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(chats));
}

function makeChatTitle(text) {
  const t = (text || "").trim();
  if (!t) return "Saved chat";
  return t.length > 42 ? t.slice(0, 42) + "…" : t;
}

function renderChatHistory() {
  const historyEl = document.getElementById("history");
  if (!historyEl) return;

  const q = (document.getElementById("searchBox")?.value || "").toLowerCase();
  const chats = loadChats();

  const filtered = q
    ? chats.filter((c) =>
        (c.title || "").toLowerCase().includes(q) ||
        (c.text || "").toLowerCase().includes(q) ||
        (c.campusLabel || "").toLowerCase().includes(q)
      )
    : chats;

  if (!filtered.length) {
    historyEl.innerHTML = `<p class="muted">No saved chats yet.</p>`;
    return;
  }

  historyEl.innerHTML = filtered.map((c) => `
    <div class="chatItem chatClickable" data-chat-id="${escapeHtml(c.id)}">
      <div class="meta">
        <span>${escapeHtml(c.campusLabel || "No campus")}</span>
        <span>${escapeHtml(c.time || "")}</span>
      </div>
      <div style="margin-top:6px;"><strong>${escapeHtml(c.title || "")}</strong></div>
      <div class="muted" style="margin-top:4px;">Click to reopen</div>
    </div>
  `).join("");

  historyEl.querySelectorAll(".chatClickable").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-chat-id");
      const chats = loadChats();
      const chat = chats.find((x) => x.id === id);
      if (!chat) return;

      const inputEl = document.getElementById("inputBox");
      if (inputEl) inputEl.value = chat.text || "";

      const select = document.getElementById("campusSelect");
      if (select) select.value = chat.campusKey || "";

      const outputEl = document.getElementById("output");
      if (outputEl) outputEl.innerHTML = chat.outputHtml || "";

      if (typeof window.renderCampusHint === "function") window.renderCampusHint();
    });
  });
}

window.renderChatHistory = renderChatHistory;

window.exportChats = function exportChats() {
  const chats = loadChats();
  const blob = new Blob([JSON.stringify(chats, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "compass_saved_chats.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

window.deleteAllChats = function deleteAllChats() {
  localStorage.removeItem(CHAT_KEY);
  renderChatHistory();
};

// ============================================================
// Main action
// ============================================================
window.analyze = async function analyze() {
  const inputEl = document.getElementById("inputBox");
  const outputEl = document.getElementById("output");
  if (!inputEl || !outputEl) return;

  const text = (inputEl.value || "").trim();
  if (!text) {
    outputEl.innerHTML = `<div class="chatItem"><strong>Please type what’s going on.</strong></div>`;
    return;
  }

  const intents = detectIntents(text);

  const campusKey = getSelectedCampusKey();
  const showCampus = Boolean(campusKey);

  const dir = getCampusDirectory();
  const campusLabel = showCampus && dir[campusKey] ? dir[campusKey].displayName : "";

  // Ask for location once per analyze (browser prompt)
  const geo = await getGeoIfAllowed();

  const outside = buildOutsideResourcesForIntents(intents, geo);

  // Campus resources ONLY if selected
  const campusResources = showCampus ? buildCampusResourcesForIntents(campusKey, intents) : [];

  // UI chips: show up to 6 detected intents (specific labels)
  const chips = intents.slice(0, 6).map((i) => {
    const cfg = INTENTS[i.tag];
    const detail = (cfg && cfg[i.sub]) ? cfg[i.sub] : (cfg ? cfg.default : null);
    const label = detail ? detail.label : (TAGS[i.tag] || i.tag);
    return `<div class="tag">${escapeHtml(label)}</div>`;
  }).join("");

  const header = `
    <div class="chatItem">
      <strong>Finding the right support…</strong>
      <p class="muted">We detect your intent (ex: “train” vs “parking”) and show targeted links.</p>
      ${geo ? `<div class="tag">Location enabled</div>` : `<div class="tag">Location not shared</div>`}
      <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:6px;">
        ${chips}
      </div>
    </div>
  `;

  const campusBlock = showCampus
    ? `
      <div class="card">
        <h3>Campus resources${campusLabel ? ` — ${escapeHtml(campusLabel)}` : ""}</h3>
        ${renderResourceList(campusResources)}
      </div>
    `
    : "";

  const outsideBlock = `
    <div class="card">
      <h3>Nearby resources (off-campus)</h3>
      ${renderResourceList(outside)}
    </div>
  `;

  const disclaimer = `
    <div class="disclaimer" style="margin-top:14px;">
      For emergencies, use the Emergency tab. This tool provides guidance + links.
    </div>
  `;

  const html = header + campusBlock + outsideBlock + disclaimer;
  outputEl.innerHTML = html;

  // Save chat
  const now = new Date();
  const chats = loadChats();
  chats.unshift({
    id: (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())),
    time: now.toLocaleString(),
    title: makeChatTitle(text),
    text,
    campusKey: campusKey || "",
    campusLabel: campusLabel || (window.customCampusName ? `“${window.customCampusName}”` : "No campus"),
    outputHtml: html,
  });
  saveChats(chats);
  renderChatHistory();
};

window.clearInput = function clearInput() {
  const inputEl = document.getElementById("inputBox");
  const outputEl = document.getElementById("output");
  if (inputEl) inputEl.value = "";
  if (outputEl) outputEl.innerHTML = "";
};

// ---------- Boot ----------
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderChatHistory();
  if (typeof window.renderCampusHint === "function") window.renderCampusHint();
});
