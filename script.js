// ============================
// script.js — Compass Support (FULL, FIXED — LONG VERSION)
// Fixes:
// ✅ food/health/fun no longer fall into tutoring
// ✅ campus resources work reliably (wildcards + tag fallback)
// ✅ campus key selection works even if <option value> is a label
//
// Keeps:
// - Theme toggle works + persists
// - Saved chats clickable
// - Campus resources ONLY show if a campus is selected
// - Intent detection uses robust phrase + regex patterns + scoring
// ============================

// ---------- Helpers ----------
function getCampusDirectory() {
  return window.CAMPUS_DIRECTORY || {};
}

// Robust campus key resolver:
// Works if <option value> is the key ("rutgers_nb") OR the label ("Rutgers — New Brunswick")
function getSelectedCampusKey() {
  const el = document.getElementById("campusSelect");
  if (!el) return "";

  const dir = getCampusDirectory();

  const raw = (el.value || "").trim();
  if (!raw) return "";

  // Case A: value is already a key
  if (dir[raw]) return raw;

  // Case B: value is a displayName label
  const byLabel = Object.keys(dir).find((k) => dir[k]?.displayName === raw);
  if (byLabel) return byLabel;

  // Case C: option text is displayName
  const optText = (el.options?.[el.selectedIndex]?.textContent || "").trim();
  const byText = Object.keys(dir).find((k) => dir[k]?.displayName === optText);
  if (byText) return byText;

  return "";
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Normalize text for matching
function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[\u2019']/g, "'") // normalize apostrophes
    .replace(/[^a-z0-9\s']/g, " ") // remove punctuation
    .replace(/\s+/g, " ")
    .trim();
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

// ---------- INTENTS: tag + sub-intent ----------
const INTENTS = {
 mental_health: {
  therapy: { label: "Therapy & counseling", mapsQuery: "therapy counseling center near me" },
  group: { label: "Support groups", mapsQuery: "support group group therapy near me" },
  stress: { label: "Stress / burnout support", mapsQuery: "stress management burnout support near me" },
  sleep: { label: "Sleep support", mapsQuery: "sleep clinic insomnia help near me" },

  // optional nicer buckets
  anxiety: { label: "Anxiety / panic support", mapsQuery: "anxiety counseling near me" },
  depression: { label: "Depression / low mood support", mapsQuery: "depression counseling near me" },
  loneliness: { label: "Loneliness / connection support", mapsQuery: "support group loneliness near me" },

  default: { label: "Mental health support", mapsQuery: "mental health clinic counseling near me" },
},

  health_support: {
    urgent: { label: "Urgent care", mapsQuery: "urgent care near me" },
    primary: { label: "Medical clinic / primary care", mapsQuery: "medical clinic near me" },
    pharmacy: { label: "Pharmacy", mapsQuery: "pharmacy near me" },
    sti: { label: "STD/STI testing", mapsQuery: "STD STI testing near me" },
    womens: { label: "Women’s health", mapsQuery: "women's health clinic near me" },
    vaccines: { label: "Vaccinations", mapsQuery: "vaccinations clinic near me" },
    telehealth: { label: "Telehealth", mapsQuery: "telehealth appointment near me" },
    default: { label: "Health & medical care", mapsQuery: "health clinic near me" },
  },

  crisis: {
    safety: { label: "Safety / urgent help", mapsQuery: "crisis center near me" },
    police: { label: "Campus / local police", mapsQuery: "police station near me" },
    titleix: { label: "Title IX / sexual assault resources", mapsQuery: "sexual assault resources near me" },
    shelter: { label: "Emergency shelters", mapsQuery: "emergency shelter near me" },
    default: { label: "Emergency & safety", mapsQuery: "crisis hotline near me" },
  },

  food_support: {
    dining: { label: "Dining halls & campus dining", mapsQuery: "dining hall near me" },
    meal_plan: { label: "Meal plans / dining plans", mapsQuery: "college meal plan office near me" },
    restaurants: { label: "Restaurants nearby", mapsQuery: "restaurants near me" },
    cheap: { label: "Cheap eats", mapsQuery: "cheap food near me" },
    late_night: { label: "Late-night food", mapsQuery: "late night food near me open now" },
    grocery: { label: "Grocery stores", mapsQuery: "grocery store near me" },
    pantry: { label: "Food pantry", mapsQuery: "food pantry near me" },
    free_meals: { label: "Free meals", mapsQuery: "free meal near me community meal" },
    halal: { label: "Halal food", mapsQuery: "halal restaurants near me" },
    kosher: { label: "Kosher food", mapsQuery: "kosher restaurants near me" },
    vegan: { label: "Vegan food", mapsQuery: "vegan restaurants near me" },
    vegetarian: { label: "Vegetarian food", mapsQuery: "vegetarian restaurants near me" },
    snap: { label: "SNAP / EBT help", mapsQuery: "SNAP EBT assistance near me" },
    default: { label: "Food options", mapsQuery: "places to eat near me" },
  },

  academic_support: {
    tutoring: { label: "Tutoring / learning centers", mapsQuery: "tutoring center near me" },
    writing: { label: "Writing help", mapsQuery: "writing center near me" },
    math: { label: "Math help", mapsQuery: "math tutor near me" },
    advising: { label: "Academic advising", mapsQuery: "academic advising near me" },
    disability: { label: "Disability accommodations", mapsQuery: "disability services office near me" },
    library: { label: "Library / study spaces", mapsQuery: "library near me study room" },
    test_prep: { label: "Test prep", mapsQuery: "test prep center near me" },
    default: { label: "Academic support", mapsQuery: "tutoring academic support near me" },
  },

  career_support: {
    resume: { label: "Resume review", mapsQuery: "resume review near me career center" },
    interview: { label: "Mock interviews", mapsQuery: "mock interview coaching near me" },
    internship: { label: "Internships / job help", mapsQuery: "career center internships near me" },
    networking: { label: "Networking events", mapsQuery: "networking events near me" },
    headshots: { label: "Professional headshots", mapsQuery: "professional headshots near me" },
    linkedin: { label: "LinkedIn help", mapsQuery: "linkedin workshop near me" },
    default: { label: "Career support", mapsQuery: "career services near me" },
  },

  financial_support: {
    aid: { label: "Financial aid", mapsQuery: "financial aid office near me" },
    grants: { label: "Emergency grants", mapsQuery: "emergency financial assistance near me" },
    scholarships: { label: "Scholarships", mapsQuery: "scholarship office near me" },
    budgeting: { label: "Budgeting help", mapsQuery: "budgeting workshop near me" },
    taxes: { label: "Free tax prep", mapsQuery: "free tax prep near me" },
    workstudy: { label: "Work-study / student jobs", mapsQuery: "work study office near me" },
    pantry: { label: "Food / basic needs help", mapsQuery: "food pantry near me" },
    default: { label: "Financial support", mapsQuery: "financial assistance near me" },
  },

  housing_support: {
    dorm: { label: "Dorm / residence life", mapsQuery: "student housing office near me" },
    apartments: { label: "Student apartments", mapsQuery: "student apartments near me" },
    sublease: { label: "Subleases", mapsQuery: "sublease near me student" },
    roommate: { label: "Roommate search", mapsQuery: "roommate finder near me" },
    tenant: { label: "Tenant / renter rights", mapsQuery: "tenant rights organization near me" },
    moving: { label: "Moving services", mapsQuery: "moving services near me" },
    default: { label: "Housing support", mapsQuery: "housing assistance near me" },
  },

  transport_support: {
    shuttle: { label: "Campus shuttle", mapsQuery: "campus shuttle schedule" },
    bus: { label: "Bus routes", mapsQuery: "bus routes near me transit schedule" },
    train: { label: "Train station", mapsQuery: "train station near me" },
    parking: { label: "Parking permits", mapsQuery: "parking permit office near me" },
    bikeshare: { label: "Bike share", mapsQuery: "bike share near me" },
    bikerepair: { label: "Bike repair", mapsQuery: "bike repair near me" },
    rideshare: { label: "Ride share info", mapsQuery: "rideshare pickup near me" },
    default: { label: "Transportation", mapsQuery: "public transportation near me" },
  },

  identity_support: {
    multicultural: { label: "Multicultural center", mapsQuery: "multicultural center near me" },
    womens: { label: "Women’s center", mapsQuery: "women's center near me" },
    lgbtq: { label: "LGBTQ+ center", mapsQuery: "LGBTQ center near me" },
    international: { label: "International student support", mapsQuery: "international student services near me" },
    religious: { label: "Religious spaces", mapsQuery: "mosque temple church synagogue near me" },
    default: { label: "Identity & cultural support", mapsQuery: "community center near me" },
  },

  legal_support: {
    legal: { label: "Legal services", mapsQuery: "legal aid near me" },
    notary: { label: "Notary services", mapsQuery: "notary near me" },
    immigration: { label: "Immigration help", mapsQuery: "immigration legal aid near me" },
    appeals: { label: "Academic appeals", mapsQuery: "student advocacy academic appeal near me" },
    default: { label: "Legal & administrative help", mapsQuery: "legal services near me" },
  },

  recreation_support: {
    gym: { label: "Campus gym / fitness", mapsQuery: "gym near me" },
    yoga: { label: "Yoga / meditation", mapsQuery: "yoga meditation near me" },
    intramural: { label: "Intramural sports", mapsQuery: "intramural sports near me" },
    outdoors: { label: "Outdoor spaces", mapsQuery: "parks trails near me" },
    default: { label: "Things to do / recreation", mapsQuery: "things to do near me" },
  },

  tech_support: {
    it: { label: "IT help desk", mapsQuery: "IT help desk near me" },
    printing: { label: "Printing services", mapsQuery: "printing services near me" },
    repair: { label: "Laptop/computer repair", mapsQuery: "laptop repair near me" },
    wifi: { label: "WiFi / connectivity", mapsQuery: "free wifi near me" },
    study24: { label: "24-hour study spaces", mapsQuery: "24 hour study space near me" },
    default: { label: "Tech & study infrastructure", mapsQuery: "computer lab near me" },
  },

  community_support: {
    clubs: { label: "Clubs & student orgs", mapsQuery: "student clubs near me" },
    events: { label: "Campus/community events", mapsQuery: "events near me tonight" },
    volunteer: { label: "Volunteer opportunities", mapsQuery: "volunteer opportunities near me" },
    faith: { label: "Faith-based groups", mapsQuery: "faith groups near me" },
    default: { label: "Social connection / community", mapsQuery: "community groups near me" },
  },

  relationship_support: {
    counseling: { label: "Relationship counseling", mapsQuery: "relationship counseling near me" },
    mediation: { label: "Mediation / conflict resolution", mapsQuery: "mediation services near me" },
    mentoring: { label: "Peer mentoring", mapsQuery: "peer mentoring near me" },
    sexual_health: { label: "Sexual health education", mapsQuery: "sexual health clinic near me" },
    default: { label: "Relationship & personal support", mapsQuery: "counseling services near me" },
  },
};

// ---------- Robust matching rules (phrases + patterns with weights) ----------
const MATCH_RULES = [
  // ===== FOOD =====
  { tag: "food_support", sub: "restaurants", weight: 10, phrases: ["places to eat", "where to eat", "food near me", "restaurant near me", "restaurants"] },
  { tag: "food_support", sub: "late_night", weight: 12, patterns: [/\b(open late|late night|open now|midnight|after 10|after 11|really late)\b/] },
  { tag: "food_support", sub: "late_night", weight: 11, patterns: [/\b(hungry|starving|need food|need to eat|im hungry|i'm hungry)\b/] },
  { tag: "food_support", sub: "cheap", weight: 10, patterns: [/\b(cheap|budget|low cost|affordable)\b/] },
  { tag: "food_support", sub: "dining", weight: 9, phrases: ["dining hall", "dining halls", "campus dining", "cafeteria"] },
  { tag: "food_support", sub: "meal_plan", weight: 9, phrases: ["meal plan", "dining plan", "meal swipes"] },
  { tag: "food_support", sub: "grocery", weight: 9, patterns: [/\b(grocer(y|ies)|grocery store|supermarket)\b/] },
  { tag: "food_support", sub: "pantry", weight: 11, patterns: [/\b(food pantry|pantry|free groceries)\b/] },
  { tag: "food_support", sub: "free_meals", weight: 11, patterns: [/\b(free food|free meals|community meal)\b/] },

  // ===== HEALTH =====
  { tag: "health_support", sub: "urgent", weight: 13, patterns: [/\b(chest pain|can'?t breathe|difficulty breathing|severe pain|fainting|blood)\b/] },
  { tag: "health_support", sub: "primary", weight: 12, patterns: [/\b(stomach hurts|stomachache|nausea|throwing up|vomit|sick|fever|pain|my stomach hurts)\b/] },
  { tag: "health_support", sub: "pharmacy", weight: 10, patterns: [/\b(pharmacy|prescription|meds|medicine)\b/] },
  { tag: "health_support", sub: "sti", weight: 10, patterns: [/\b(sti|std)\b/] },
  { tag: "health_support", sub: "womens", weight: 10, patterns: [/\b(women'?s health|gynecolog(y|ist)|obgyn)\b/] },
  { tag: "health_support", sub: "vaccines", weight: 9, patterns: [/\b(vaccine|vaccination|immunization)\b/] },
  { tag: "health_support", sub: "telehealth", weight: 9, patterns: [/\b(telehealth|virtual doctor|online appointment)\b/] },
// ===== Sexual health =====
{ tag: "health_support", sub: "sti", weight: 26,
  patterns: [/\b(std|sti|std test|sti test|testing|chlamydia|gonorrhea|hiv|pregnancy test)\b/] },

{ tag: "health_support", sub: "primary", weight: 22,
  patterns: [/\b(sexual health|sexual issue|sexual problem|pain during sex|painful sex|birth control|contraception)\b/] },
  // ===== SPORTS / INJURY =====
{ tag: "health_support", sub: "primary", weight: 22,
  patterns: [/\b(ankle|sprain|sprained|injury|injured|hurt my|twisted|swollen|swelling|pain while running|sports injury)\b/] },

{ tag: "health_support", sub: "urgent", weight: 20,
  patterns: [/\b(can't walk|cannot walk|broken|fracture|fractured|bone|severe swelling|severe pain)\b/] },
  // ===== FUN / THINGS TO DO =====
  { tag: "recreation_support", sub: "default", weight: 12, patterns: [/\b(what to do|things to do|fun|bored|hang out|near campus)\b/] },
  { tag: "community_support", sub: "events", weight: 11, patterns: [/\b(events?|concert|show|festival|tonight|weekend)\b/] },
  { tag: "community_support", sub: "clubs", weight: 10, patterns: [/\b(clubs?|student orgs?|join a club|meet people|make friends)\b/] },

  // ===== ACADEMIC (kept, but NOT default fallback) =====
// ===== ACADEMIC (expanded) =====

// 1) General “I’m struggling” / workload / schoolwork
{ tag: "academic_support", sub: "default", weight: 14, patterns: [/\b(school|schoolwork|school work|class|classes|course|courses|coursework|classwork|class work|academics|academic)\b/] },
{ tag: "academic_support", sub: "default", weight: 16, patterns: [/\b(struggling|having trouble|hard time|confused|lost|don'?t understand|dont understand|need help|help me|stuck|falling behind|behind|overwhelmed)\b/] },
{ tag: "academic_support", sub: "default", weight: 15, patterns: [/\b(recover my grade|raise my grade|improve my grade|bring up my grade|grade drop|doing bad|doing poorly|failed|failing|bombed|flunked)\b/] },

// 2) Tutoring / learning support / study help
{ tag: "academic_support", sub: "tutoring", weight: 18, patterns: [/\b(tutor|tutoring|tutors|peer tutor|study help|study support|academic support|learning center|learning centre|success center|student success)\b/] },
{ tag: "academic_support", sub: "tutoring", weight: 16, patterns: [/\b(help with homework|help with schoolwork|help with school work|help with classwork|help with class work|assignment help|problem set help|pset help|homework help)\b/] },
{ tag: "academic_support", sub: "tutoring", weight: 14, patterns: [/\b(study group|study groups|study buddy|study partner|accountability partner)\b/] },

// 3) Office hours / professor / TA / recitation
{ tag: "academic_support", sub: "advising", weight: 14, patterns: [/\b(office hours|professor|prof|instructor|ta\b|teaching assistant|recitation|recitation leader)\b/] },

// 4) Exams / quizzes / midterms / finals
{ tag: "academic_support", sub: "test_prep", weight: 16, patterns: [/\b(test|tests|exam|exams|midterm|midterms|final|finals|quiz|quizzes|next test|upcoming exam|exam prep|test prep|practice exam|past exams)\b/] },
{ tag: "academic_support", sub: "test_prep", weight: 13, patterns: [/\b(study plan|study schedule|how to study|study tips|cram|cramming)\b/] },

// 5) Writing help (papers, essays, citations)
{ tag: "academic_support", sub: "writing", weight: 18, patterns: [/\b(writing center|writing centre|essay|essays|paper|papers|research paper|lab report|report|discussion post|thesis|outline|draft|revision|proofread|proofreading|editing)\b/] },
{ tag: "academic_support", sub: "writing", weight: 15, patterns: [/\b(citation|citations|apa|mla|chicago|bibliography|works cited|references)\b/] },

// 6) Math / quantitative help (broad)
{ tag: "academic_support", sub: "math", weight: 18, patterns: [/\b(math|mathematics|calc|calculus|algebra|geometry|trig|trigonometry|statistics|stats|probability|linear algebra|differential equations|discrete math)\b/] },

// 7) Advising / registration / scheduling / majors
{ tag: "academic_support", sub: "advising", weight: 18, patterns: [/\b(advising|advisor|academic advisor|course planning|degree plan|graduation|credits|credit|major|minor|double major|requirements)\b/] },
{ tag: "academic_support", sub: "advising", weight: 16, patterns: [/\b(register|registration|add\/drop|add drop|schedule|class schedule|course load|waitlist|prereq|prerequisite|override|SPN|special permission)\b/] },

// 8) Library / study spaces
{ tag: "academic_support", sub: "library", weight: 16, patterns: [/\b(library|study space|study spaces|study room|study rooms|quiet place|computer lab|printing|printer)\b/] },

// 9) Disability accommodations / accessibility
{ tag: "academic_support", sub: "disability", weight: 18, patterns: [/\b(accommodations|accommodation|disability services|ods|accessibility|testing accommodations|extra time|note taker|notetaker|reduced distraction)\b/] },

// 10) Extra academic processes: extensions, appeals, withdrawal
{ tag: "academic_support", sub: "advising", weight: 14, patterns: [/\b(extension|deadline extension|late work|incomplete\b|withdraw|withdrawal|drop a class|pass\/fail|pass fail|academic probation)\b/] },

  // ===== CAREER =====
  { tag: "career_support", sub: "resume", weight: 9, patterns: [/\b(resume|cv)\b/] },
  { tag: "career_support", sub: "interview", weight: 9, patterns: [/\b(interview|mock interview)\b/] },
  { tag: "career_support", sub: "internship", weight: 9, patterns: [/\b(internship|job search|apply to jobs)\b/] },
  { tag: "career_support", sub: "networking", weight: 8, patterns: [/\b(networking|career fair)\b/] },
  { tag: "career_support", sub: "linkedin", weight: 8, patterns: [/\b(linkedin)\b/] },

  // ===== FINANCIAL =====
  { tag: "financial_support", sub: "aid", weight: 9, patterns: [/\b(financial aid|fafsa)\b/] },
  { tag: "financial_support", sub: "grants", weight: 9, patterns: [/\b(emergency grant|hardship grant)\b/] },
  { tag: "financial_support", sub: "scholarships", weight: 8, patterns: [/\b(scholarship|scholarships)\b/] },
  { tag: "financial_support", sub: "budgeting", weight: 8, patterns: [/\b(budget|budgeting)\b/] },
  { tag: "financial_support", sub: "taxes", weight: 7, patterns: [/\b(taxes|tax prep)\b/] },
  { tag: "financial_support", sub: "workstudy", weight: 7, patterns: [/\b(work study|work-study|campus job)\b/] },

  // ===== HOUSING =====
  { tag: "housing_support", sub: "dorm", weight: 8, patterns: [/\b(dorm|residence life)\b/] },
  { tag: "housing_support", sub: "apartments", weight: 8, patterns: [/\b(apartment|apartments)\b/] },
  { tag: "housing_support", sub: "roommate", weight: 7, patterns: [/\b(roommate)\b/] },
  { tag: "housing_support", sub: "sublease", weight: 7, patterns: [/\b(sublease|sublet)\b/] },
  { tag: "housing_support", sub: "tenant", weight: 7, patterns: [/\b(tenant rights|renter rights)\b/] },
  { tag: "housing_support", sub: "moving", weight: 6, patterns: [/\b(moving|movers)\b/] },

  // ===== TRANSPORT =====
  { tag: "transport_support", sub: "shuttle", weight: 8, patterns: [/\b(shuttle)\b/] },
  { tag: "transport_support", sub: "bus", weight: 8, patterns: [/\b(bus|bus route|bus schedule)\b/] },
  { tag: "transport_support", sub: "train", weight: 8, patterns: [/\b(train|train station)\b/] },
  { tag: "transport_support", sub: "parking", weight: 7, patterns: [/\b(parking|parking permit)\b/] },
  { tag: "transport_support", sub: "bikeshare", weight: 6, patterns: [/\b(bike share)\b/] },
  { tag: "transport_support", sub: "bikerepair", weight: 6, patterns: [/\b(bike repair)\b/] },
  { tag: "transport_support", sub: "rideshare", weight: 6, patterns: [/\b(uber|lyft|rideshare)\b/] },

  // ===== IDENTITY =====
  { tag: "identity_support", sub: "multicultural", weight: 7, patterns: [/\b(multicultural|cultural center)\b/] },
  { tag: "identity_support", sub: "womens", weight: 7, patterns: [/\b(women'?s center)\b/] },
  { tag: "identity_support", sub: "lgbtq", weight: 7, patterns: [/\b(lgbtq|queer)\b/] },
  { tag: "identity_support", sub: "international", weight: 7, patterns: [/\b(international student|visa)\b/] },
  { tag: "identity_support", sub: "religious", weight: 6, patterns: [/\b(mosque|temple|church|synagogue)\b/] },

  // ===== LEGAL =====
  { tag: "legal_support", sub: "legal", weight: 7, patterns: [/\b(legal aid|legal services)\b/] },
  { tag: "legal_support", sub: "notary", weight: 6, patterns: [/\b(notary)\b/] },
  { tag: "legal_support", sub: "immigration", weight: 7, patterns: [/\b(immigration|visa lawyer)\b/] },
  { tag: "legal_support", sub: "appeals", weight: 6, patterns: [/\b(appeal|academic appeal)\b/] },

  // ===== TECH =====
  { tag: "tech_support", sub: "it", weight: 7, patterns: [/\b(it help|help desk|tech support)\b/] },
  { tag: "tech_support", sub: "printing", weight: 6, patterns: [/\b(printing|printer)\b/] },
  { tag: "tech_support", sub: "repair", weight: 6, patterns: [/\b(laptop repair|computer repair)\b/] },
  { tag: "tech_support", sub: "wifi", weight: 6, patterns: [/\b(wifi|internet)\b/] },
  { tag: "tech_support", sub: "study24", weight: 6, patterns: [/\b(24 hour|24-hour|late study)\b/] },

  // ===== RELATIONSHIPS =====
  { tag: "relationship_support", sub: "counseling", weight: 6, patterns: [/\b(relationship counseling)\b/] },
  { tag: "relationship_support", sub: "mediation", weight: 6, patterns: [/\b(mediation|conflict)\b/] },
  { tag: "relationship_support", sub: "mentoring", weight: 6, patterns: [/\b(mentor|mentoring)\b/] },

  // ===== CRISIS (Emergency tab handles real callouts; still detect) =====
  { tag: "crisis", sub: "default", weight: 100, patterns: [/\b(kill myself|suicidal|self harm|self-harm)\b/] },
  // ===== MENTAL HEALTH (EXPANDED) =====
// ===== COMPANIONSHIP / LONELINESS =====
{ tag: "mental_health", sub: "loneliness", weight: 24,
  patterns: [/\b(companionship|need company|want company|someone to talk to|need someone to talk to)\b/] },

{ tag: "mental_health", sub: "loneliness", weight: 22,
  patterns: [/\b(lonely|alone|isolated|no friends|left out)\b/] },

{ tag: "community_support", sub: "clubs", weight: 14,
  patterns: [/\b(make friends|meet people|new friends)\b/] },
// High-confidence crisis-ish words (still not “Emergency tab” level unless you want it)
// NOTE: Your “crisis” rule already catches self-harm; keep that separate.
{ tag: "mental_health", sub: "default", weight: 25, patterns: [/\b(panic attack|panicking|i'?m panicking|hyperventilat(e|ing)|can'?t calm down)\b/] },
{ tag: "mental_health", sub: "default", weight: 22, patterns: [/\b(can'?t stop crying|crying a lot|breakdown|meltdown)\b/] },

// Anxiety
{ tag: "mental_health", sub: "default", weight: 20, patterns: [/\b(anxious|anxiety|worried|overthinking|ruminating|fearful|nervous|on edge)\b/] },
{ tag: "mental_health", sub: "default", weight: 18, patterns: [/\b(stressed|stress|burnt out|burned out|overwhelmed|too much|pressure)\b/] },

// Depression / low mood
// Depression / low mood -> PUSH to therapy
{ tag: "mental_health", sub: "therapy", weight: 30, patterns: [/\b(depressed|depression|hopeless|empty|numb|worthless|no motivation|unmotivated)\b/] },
{ tag: "mental_health", sub: "therapy", weight: 26, patterns: [/\b(sad|down|miserable|crying|can't stop crying|cant stop crying)\b/] },

// Still keep a weaker "default" bucket for general mood
{ tag: "mental_health", sub: "default", weight: 12, patterns: [/\b(feeling off|not myself|mentally exhausted|emotionally drained)\b/] },
{ tag: "mental_health", sub: "therapy", weight: 24, patterns: [/\b(sad(ness)?|down|depress(ed|ing|ion)?|blue)\b/] },
// Loneliness / social isolation (often mental-health related)
{ tag: "mental_health", sub: "default", weight: 16, patterns: [/\b(lonely|alone|isolated|no friends|no one to talk to|left out)\b/] },

// Grief / loss / breakup
{ tag: "mental_health", sub: "default", weight: 16, patterns: [/\b(grief|grieving|loss|someone died|passed away|funeral)\b/] },
{ tag: "mental_health", sub: "default", weight: 14, patterns: [/\b(breakup|heartbroken|relationship ended|got dumped)\b/] },

// Homesickness / adjustment
{ tag: "mental_health", sub: "default", weight: 14, patterns: [/\b(homesick|miss home|can'?t adjust|can'?t fit in|out of place)\b/] },

// Sleep (keep as a specific sub-intent)
{ tag: "mental_health", sub: "sleep", weight: 15, patterns: [/\b(insomnia|can'?t sleep|trouble sleeping|sleep schedule|nightmares)\b/] },

// Therapy / counseling (specific)
{ tag: "mental_health", sub: "therapy", weight: 18, patterns: [/\b(therapy|therapist|counseling|counsell?or|mental health appointment)\b/] },
{ tag: "mental_health", sub: "group", weight: 14, patterns: [/\b(support group|group therapy|group counseling)\b/] },

// Stress tools / coping (optional)
{ tag: "mental_health", sub: "stress", weight: 14, patterns: [/\b(coping|coping skills|grounding|breathing exercise|mindfulness)\b/] },
];

// Detect intents with scoring (top 1–2)
function detectIntents(text) {
  const t = normalizeText(text);

  const scores = new Map(); // key -> score
  const hits = new Map();   // key -> {tag,sub,keyword}

  for (const rule of MATCH_RULES) {
    if (rule.phrases) {
      for (const p of rule.phrases) {
        const np = normalizeText(p);
        if (np && t.includes(np)) {
          const key = `${rule.tag}::${rule.sub}`;
          scores.set(key, (scores.get(key) || 0) + rule.weight);
          if (!hits.has(key)) hits.set(key, { tag: rule.tag, sub: rule.sub, keyword: p });
        }
      }
    }

    if (rule.patterns) {
      for (const re of rule.patterns) {
        if (re.test(t)) {
          const key = `${rule.tag}::${rule.sub}`;
          scores.set(key, (scores.get(key) || 0) + rule.weight);
          if (!hits.has(key)) hits.set(key, { tag: rule.tag, sub: rule.sub, keyword: re.toString() });
        }
      }
    }
  }

  // If nothing matched: use social/community default (NOT academic)
  if (scores.size === 0) {
    return [{ tag: "community_support", sub: "default", keyword: "" }];
  }

  // Turn into ranked list
  const rankedPairs = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, score]) => {
      const hit = hits.get(key);
      return hit ? { ...hit, score, key } : null;
    })
    .filter(Boolean);

  // Safety: if crisis was detected, only return crisis
  const crisisHit = rankedPairs.find((r) => r.tag === "crisis");
  if (crisisHit) return [crisisHit];

  // Pick up to 4, preferring DIFFERENT TAGS first
  const picked = [];
  const usedTags = new Set();

  for (const r of rankedPairs) {
    if (!usedTags.has(r.tag)) {
      picked.push({ tag: r.tag, sub: r.sub, keyword: r.keyword });
      usedTags.add(r.tag);
    }
    if (picked.length >= 4) break;
  }

  // If still fewer than 4, fill remaining (can repeat tags if needed)
  if (picked.length < 4) {
    for (const r of rankedPairs) {
      if (picked.some((x) => x.tag === r.tag && x.sub === r.sub)) continue;
      picked.push({ tag: r.tag, sub: r.sub, keyword: r.keyword });
      if (picked.length >= 4) break;
    }
  }

  return picked;
}

// ---------- Campus matching ----------
function resourceMatchesIntent(resource, intent) {
  // If the resource has structured intents (your campuses.js uses this)
  if (Array.isArray(resource.intents)) {
    // 1) Exact match
    if (resource.intents.some((it) => it?.tag === intent.tag && it?.sub === intent.sub)) {
      return true;
    }

    // 2) If user intent is "default", match any resource with same tag
    // mental_health::default should match campus mental_health::therapy
    if (intent.sub === "default") {
      return resource.intents.some((it) => it?.tag === intent.tag);
    }

    // 3) If resource is "default", match any sub-intent under that tag
    return resource.intents.some((it) => it?.tag === intent.tag && it?.sub === "default");
  }

  // Fallback if you ever use tags/subTags format
  const tags = Array.isArray(resource.tags) ? resource.tags : [];
  if (!tags.includes(intent.tag)) return false;

  if (intent.sub === "default") return true;

  const subTags = Array.isArray(resource.subTags) ? resource.subTags : [];
  if (!subTags.length) return true;

  return subTags.includes(intent.sub);
}
function buildCampusRecommendations(campusKey, intents) {
  const dir = getCampusDirectory();
  const campus = dir[campusKey];
  if (!campus || !Array.isArray(campus.resources)) return [];

  // Pass 1: match tag+sub with wildcard support
  const results = [];
  for (const res of campus.resources) {
    for (const it of intents) {
      if (resourceMatchesIntent(res, it)) {
        results.push(res);
        break;
      }
    }
  }

  // Pass 2: if none matched, do a tag-only fallback (prevents "campus is broken")
  if (results.length === 0) {
    const tagsWanted = new Set(intents.map((i) => i.tag));
    for (const res of campus.resources) {
      const resTags = Array.isArray(res.intents)
        ? res.intents.map((x) => x?.tag).filter(Boolean)
        : Array.isArray(res.tags)
        ? res.tags
        : [];
      if (resTags.some((t) => tagsWanted.has(t))) results.push(res);
    }
  }

  // De-dup by name
  const seen = new Set();
  return results.filter((r) => {
    const k = (r.name || "").toLowerCase();
    if (!k) return true;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ---------- Geolocation ----------
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

// ---------- Outside resources ----------
function makeMapsUrl(query, geo) {
  const q = encodeURIComponent(query);
  return geo?.lat && geo?.lon
    ? `https://www.google.com/maps/search/${q}/@${geo.lat},${geo.lon},13z`
    : `https://www.google.com/maps/search/${q}`;
}

function buildOutsideResources(intents, geo) {
  const picked = [];
  const seen = new Set();

  // Helpful rule: if ANY food intent appears, always include Restaurants + Late-night
  const hasFood = intents.some((i) => i.tag === "food_support");
  if (hasFood) {
    for (const base of [
      { tag: "food_support", sub: "restaurants", keyword: "" },
      { tag: "food_support", sub: "late_night", keyword: "" },
    ]) {
      const id = `${base.tag}::${base.sub}`;
      if (!seen.has(id)) {
        seen.add(id);
        picked.push(base);
      }
    }
  }

  // Fill to max 3
  for (const it of intents) {
    const id = `${it.tag}::${it.sub}`;
    if (seen.has(id)) continue;
    seen.add(id);
    picked.push(it);
    if (picked.length >= 3) break;
  }

  return picked.map((it) => {
    const def = INTENTS[it.tag]?.[it.sub] || INTENTS[it.tag]?.default;
    const label = def?.label || `${it.tag.replaceAll("_", " ")} (${it.sub})`;
    const query = def?.mapsQuery || "student support services near me";

   function makeFriendlyNote(tag, sub, geo) {
  const locationText = geo
    ? "Shows options near your current location."
    : "Shows options near you.";

  switch (tag) {
    case "academic_support":
      return `Find tutoring centers, study spaces, or academic help nearby. ${locationText}`;

    case "health_support":
      return `Locate clinics, testing centers, or medical support close to you. ${locationText}`;

    case "mental_health":
      return `Find counseling services or support centers in your area. ${locationText}`;

    case "food_support":
      return `Browse nearby food options based on what you need. ${locationText}`;

    case "career_support":
      return `Discover career centers, resume help, or interview prep nearby. ${locationText}`;

    case "financial_support":
      return `See financial aid or assistance resources in your area. ${locationText}`;

    case "housing_support":
      return `Explore housing or renter-support resources near you. ${locationText}`;

    case "transport_support":
      return `View transportation options and transit resources nearby. ${locationText}`;

    case "identity_support":
      return `Find community or cultural support centers in your area. ${locationText}`;

    case "legal_support":
      return `Locate legal or administrative help close to you. ${locationText}`;

    case "recreation_support":
      return `Discover recreation, fitness, or things to do nearby. ${locationText}`;

    case "tech_support":
      return `Find IT help, printing services, or repair options nearby. ${locationText}`;

    case "community_support":
      return `Explore social groups, events, or community spaces near you. ${locationText}`;

    default:
      return `View relevant support options nearby. ${locationText}`;
  }
}
    return {
  name: `Nearby: ${label}`,
  type: "Google Maps",
  notes: makeFriendlyNote(it.tag, it.sub, geo),
  links: [{ label: "View nearby options", url: makeMapsUrl(query, geo) }],
};
  });
}
// ---------- Personalized Next Steps ----------
function stepsForIntent(intent, { campusKey, campusLabel, geo }) {
  const onCampus = Boolean(campusKey);
  const campusText = onCampus && campusLabel ? ` at ${campusLabel}` : "";

  // Each step is short + action-based
  switch (intent.tag) {
    case "academic_support":
      if (intent.sub === "tutoring" || intent.sub === "default" || intent.sub === "test_prep") {
        return [
          { bucket: "now", text: "Pick one class to triage first (the most urgent deadline)." },
          { bucket: "now", text: `Open tutoring/learning support${campusText} and book the earliest slot.` },
          { bucket: "next", text: "Email your professor/TA: ask what to focus on this week + confirm office hours." },
          { bucket: "next", text: "Make a 45-minute plan: 25 min work → 5 min break → repeat once." },
        ];
      }
      if (intent.sub === "writing") {
        return [
          { bucket: "now", text: `Book a writing center slot${campusText} (even 20 minutes helps).` },
          { bucket: "now", text: "Write a 3-sentence thesis + 3 bullet outline before editing anything." },
          { bucket: "next", text: "Run a quick citation check (APA/MLA) and fix missing sources." },
        ];
      }
      return [
        { bucket: "now", text: "Identify the exact thing you’re stuck on (topic, assignment, or exam)." },
        { bucket: "next", text: `Use academic support${campusText} to get targeted help.` },
      ];

    case "mental_health":
      if (intent.sub === "therapy" || intent.sub === "default" || intent.sub === "stress") {
        return [
          { bucket: "now", text: "Take one tiny reset: drink water + unclench your shoulders + 3 slow breaths." },
          { bucket: "now", text: `If you can, schedule counseling/wellness support${campusText}.` },
          { bucket: "next", text: "Text a friend: “Can you check in with me tonight?”" },
          { bucket: "next", text: "Reduce load: pick 1 task to drop/postpone for 24 hours." },
        ];
      }
      if (intent.sub === "sleep") {
        return [
          { bucket: "now", text: "Set a realistic ‘lights out’ time (even 30 minutes earlier helps)." },
          { bucket: "next", text: "Stop caffeine 8 hours before sleep; dim screens 45 minutes before bed." },
          { bucket: "next", text: `If this is ongoing, consider wellness support${campusText}.` },
        ];
      }
      return [
        { bucket: "now", text: "Name what you’re feeling (stress/anxiety/loneliness) — it lowers intensity." },
        { bucket: "next", text: `Reach out for support${campusText}.` },
      ];

    case "food_support":
      if (intent.sub === "pantry" || intent.sub === "free_meals" || intent.sub === "cheap") {
        return [
          { bucket: "now", text: "Check for a campus pantry / free meal option first (fastest + lowest cost)." },
          { bucket: "next", text: "If you’re low on funds, plan 2–3 cheap staples for the week (rice/pasta/eggs/beans)." },
        ];
      }
      if (intent.sub === "late_night") {
        return [
          { bucket: "now", text: "Check what’s open late near you and pick the closest option." },
          { bucket: "next", text: "Save 2 reliable late-night spots so you don’t have to search next time." },
        ];
      }
      return [
        { bucket: "now", text: "Decide: dining hall vs quick off-campus option." },
        { bucket: "next", text: "Save a couple ‘default meals’ for stressful weeks." },
      ];

    case "health_support":
      if (intent.sub === "urgent") {
        return [
          { bucket: "now", text: "If symptoms feel severe or sudden, prioritize urgent care today." },
          { bucket: "next", text: "Write down symptoms + timing + meds so it’s easy to explain." },
        ];
      }
      if (intent.sub === "sti") {
        return [
          { bucket: "now", text: `Schedule STI testing${campusText} (or nearby clinic if faster).` },
          { bucket: "next", text: "Avoid guessing — confirm results before self-treating." },
          { bucket: "next", text: "If needed, ask about confidential options and cost." },
        ];
      }
      return [
        { bucket: "now", text: `Book a clinic appointment${campusText} or nearby provider.` },
        { bucket: "next", text: "Bring insurance info + a quick symptom list." },
      ];

    case "financial_support":
      return [
        { bucket: "now", text: `Check financial aid / basic needs support${campusText}.` },
        { bucket: "next", text: "List your next 2 bills and their due dates to reduce panic." },
        { bucket: "next", text: "Ask if emergency grants or short-term help is available." },
      ];

    case "housing_support":
      return [
        { bucket: "now", text: `Contact housing/residence life${campusText} if this affects safety or stability.` },
        { bucket: "next", text: "Document issues (photos + dates) if it’s maintenance/roommate conflict." },
      ];

    case "transport_support":
      return [
        { bucket: "now", text: "Check today’s route/schedule and screenshot it." },
        { bucket: "next", text: "Save a backup route (bus/train/rideshare pickup spot)." },
      ];

    case "community_support":
      return [
        { bucket: "now", text: "Pick ONE low-pressure option (event/club) and commit to showing up once." },
        { bucket: "next", text: "Message someone: “Want to go with me?” (reduces friction a lot)." },
      ];

    case "career_support":
      return [
        { bucket: "now", text: "Pick one goal: resume review OR internship search OR interview prep." },
        { bucket: "next", text: `Book career services${campusText} and bring your current resume.` },
      ];

    default:
      return [
        { bucket: "now", text: "Pick one immediate need and handle it first." },
        { bucket: "next", text: "Then use the resources below to follow through." },
      ];
  }
}

function buildNextSteps(intents, ctx) {
  // Crisis override
  if (intents.some((i) => i.tag === "crisis")) {
    return {
      now: [
        "If you’re in immediate danger, call 911.",
        "If you’re thinking about self-harm, call or text 988 (US) right now.",
      ],
      next: ["Open the Emergency tab for chat + hotline options."],
      also: [],
    };
  }

  // 1) Prefer distinct tags first (so one category doesn't dominate)
  const distinct = [];
  const usedTags = new Set();

  for (const it of intents) {
    if (!usedTags.has(it.tag)) {
      distinct.push(it);
      usedTags.add(it.tag);
    }
    if (distinct.length >= 3) break;
  }

  // If fewer than 3 distinct tags, fill from remaining
  if (distinct.length < 3) {
    for (const it of intents) {
      if (distinct.some((x) => x.tag === it.tag && x.sub === it.sub)) continue;
      distinct.push(it);
      if (distinct.length >= 3) break;
    }
  }

  const buckets = { now: [], next: [], also: [] };
  const seen = new Set();

  // helper to add items safely
  function add(bucket, text, limit) {
    const key = text.toLowerCase();
    if (seen.has(key)) return false;
    if (buckets[bucket].length >= limit) return false;
    seen.add(key);
    buckets[bucket].push(text);
    return true;
  }

  // 2) Give each category ONE “Do now” step first
  for (const it of distinct) {
    const steps = stepsForIntent(it, ctx);

    // try to grab the best "now" step from each intent
    const nowStep = steps.find((s) => s.bucket === "now");
    if (nowStep) add("now", nowStep.text, 3);
  }

  // 3) Then fill remaining slots using all steps
  const allIntents = distinct; // keep it tight (3 categories)
  for (const it of allIntents) {
    const steps = stepsForIntent(it, ctx);
    for (const s of steps) {
      if (add("now", s.text, 3)) continue;
      if (add("next", s.text, 3)) continue;
      add("also", s.text, 3);
    }
  }

  // Guarantee at least 2 items in "now" if possible
  if (buckets.now.length < 2 && buckets.next.length) {
    buckets.now.push(buckets.next.shift());
  }

  // Guarantee at least 1 “now”
  if (buckets.now.length === 0) {
    buckets.now.push("Take one small step: pick the most urgent issue and handle it first.");
  }

  return buckets;
}

function renderNextStepsCard(steps) {
  const renderList = (arr) =>
    arr && arr.length
      ? `<ul class="steps">${arr.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`
      : `<p class="muted">—</p>`;

  return `
    <div class="card">
      <h3>✅ Suggested next steps</h3>

      <div class="muted" style="margin-top:6px;">Do now</div>
      ${renderList(steps.now)}

      <div class="muted" style="margin-top:10px;">Next</div>
      ${renderList(steps.next)}

      ${steps.also?.length ? `<div class="muted" style="margin-top:10px;">Also helpful</div>${renderList(steps.also)}` : ""}
    </div>
  `;
}
// ---------- Rendering ----------
function renderResourceList(resources) {
  if (!resources.length) return `<p class="muted">No matching resources found.</p>`;

  return `
    <ul class="steps">
      ${resources
        .map((r) => {
          const links = Array.isArray(r.links) ? r.links : [];
          return `
            <li>
              <strong>${escapeHtml(r.name || "")}</strong>
              ${r.type ? ` — ${escapeHtml(r.type)}` : ""}
              ${r.notes ? `<div class="muted">${escapeHtml(r.notes)}</div>` : ""}
              ${
                links.length
                  ? `<div style="margin-top:6px; display:flex; gap:10px; flex-wrap:wrap;">
                      ${links
                        .map(
                          (l) => `
                        <a class="link" href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">
                          ${escapeHtml(l.label)}
                        </a>`
                        )
                        .join("")}
                    </div>`
                  : ""
              }
            </li>
          `;
        })
        .join("")}
    </ul>
  `;
}

// ---------- Saved chats ----------
const CHAT_KEY = "compass_chat_history_v1";

function loadChats() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
  } catch {
    return [];
  }
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
    ? chats.filter(
        (c) =>
          (c.title || "").toLowerCase().includes(q) ||
          (c.text || "").toLowerCase().includes(q) ||
          (c.campusLabel || "").toLowerCase().includes(q)
      )
    : chats;

  if (!filtered.length) {
    historyEl.innerHTML = `<p class="muted">No saved chats yet.</p>`;
    return;
  }

  historyEl.innerHTML = filtered
    .map(
      (c) => `
        <div class="chatItem chatClickable" data-chat-id="${escapeHtml(c.id)}">
          <div class="meta">
            <span>${escapeHtml(c.campusLabel || "No campus")}</span>
            <span>${escapeHtml(c.time || "")}</span>
          </div>
          <div style="margin-top:6px;"><strong>${escapeHtml(c.title || "")}</strong></div>
          <div class="muted" style="margin-top:4px;">Click to reopen</div>
        </div>
      `
    )
    .join("");

  historyEl.querySelectorAll(".chatClickable").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-chat-id");
      const chats = loadChats();
      const chat = chats.find((x) => x.id === id);
      if (!chat) return;

      const inputEl = document.getElementById("inputBox");
      if (inputEl) inputEl.value = chat.text || "";

      const select = document.getElementById("campusSelect");
      if (select) select.value = chat.campusKey || select.value;

      const outputEl = document.getElementById("output");
      if (outputEl) outputEl.innerHTML = chat.outputHtml || "";
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

// ---------- Main action ----------
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

  const campusRecs = showCampus ? buildCampusRecommendations(campusKey, intents) : [];

  const geo = await getGeoIfAllowed();
  const outside = buildOutsideResources(intents, geo);
  const nextSteps = buildNextSteps(intents, { campusKey, campusLabel, geo });
const nextStepsBlock = renderNextStepsCard(nextSteps);

  const chips = intents
    .slice(0, 4)
    .map((it) => {
      const def = INTENTS[it.tag]?.[it.sub] || INTENTS[it.tag]?.default;
      return `<div class="tag">${escapeHtml(def?.label || it.tag)}</div>`;
    })
    .join("");

  const header = `
    <div class="chatItem">
      <strong>You’re not alone — let’s find the right support.</strong>
      <p class="muted">Results are based on what you typed (food/health/fun route correctly + campus works).</p>
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
        ${renderResourceList(campusRecs)}
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

const html = header + nextStepsBlock + campusBlock + outsideBlock + disclaimer;
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
    campusLabel: campusLabel || "No campus",
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

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderChatHistory();

  // Warm empty state (only if output is empty)
  const outputEl = document.getElementById("output");
  if (outputEl && !outputEl.innerHTML.trim()) {
    outputEl.innerHTML = `
      <div class="chatItem">
        <strong>How can Compass help today?</strong>
        <p class="muted" style="margin-top:6px;">
          Try something like:
        </p>
        <ul class="muted" style="margin-top:6px; margin-left:18px;">
          <li>“I’m stressed and falling behind in class.”</li>
          <li>“I need cheap food near campus.”</li>
          <li>“I’m feeling lonely and want to meet people.”</li>
          <li>“I need tutoring and I feel overwhelmed.”</li>
        </ul>
      </div>
    `;
  }
});
