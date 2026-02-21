// ============================
// script.js — Compass Support (FULL)
// - Theme toggle works + persists
// - Saved chats clickable
// - Campus resources ONLY show if a campus is selected
// - Uses INTENTS (tag + sub-intent) to produce SPECIFIC suggestions
// - Off-campus results are Google Maps links based on the matched intent/sub-intent
// - Food now includes dining halls + meal plans + restaurants + cheap + late-night + pantry/free food
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

// GLOBAL for onclick
window.toggleTheme = function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
};

// ---------- INTENTS: tag + sub-intent (this is the core of “more specific” results) ----------
const INTENTS = {
  mental_health: {
    therapy: { label: "Therapy & counseling", mapsQuery: "therapy counseling center near me" },
    group: { label: "Group therapy / support groups", mapsQuery: "support group group therapy near me" },
    stress: { label: "Stress / burnout support", mapsQuery: "stress management burnout support near me" },
    sleep: { label: "Sleep support", mapsQuery: "sleep clinic insomnia help near me" },
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
    late_night: { label: "Late-night food", mapsQuery: "late night food near me" },
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
    tutoring: { label: "Tutoring / learning centers", mapsQuery: "tutoring center near me Kumon Sylvan tutoring" },
    writing: { label: "Writing help", mapsQuery: "writing tutor near me writing center" },
    math: { label: "Math help", mapsQuery: "math tutor near me" },
    advising: { label: "Academic advising", mapsQuery: "academic advising near me college advising" },
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
    default: { label: "Wellness & recreation", mapsQuery: "fitness classes near me" },
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
    events: { label: "Campus/community events", mapsQuery: "events near me" },
    volunteer: { label: "Volunteer opportunities", mapsQuery: "volunteer opportunities near me" },
    faith: { label: "Faith-based groups", mapsQuery: "faith groups near me" },
    default: { label: "Social connection", mapsQuery: "community groups near me" },
  },

  relationship_support: {
    counseling: { label: "Relationship counseling", mapsQuery: "relationship counseling near me" },
    mediation: { label: "Mediation / conflict resolution", mapsQuery: "mediation services near me" },
    mentoring: { label: "Peer mentoring", mapsQuery: "peer mentoring near me" },
    sexual_health: { label: "Sexual health education", mapsQuery: "sexual health clinic near me" },
    default: { label: "Relationship & personal support", mapsQuery: "counseling services near me" },
  },
};

// ---------- Keyword → (tag, sub) mapping (MOST IMPORTANT FOR SPECIFICITY) ----------
const KEYWORD_INTENT_MAP = {
  // --- Dining / food (your request) ---
  "dining hall": { tag: "food_support", sub: "dining" },
  "dining halls": { tag: "food_support", sub: "dining" },
  cafeteria: { tag: "food_support", sub: "dining" },
  "campus dining": { tag: "food_support", sub: "dining" },
  "meal plan": { tag: "food_support", sub: "meal_plan" },
  "dining plan": { tag: "food_support", sub: "meal_plan" },
  "meal swipes": { tag: "food_support", sub: "meal_plan" },
  "where can i eat": { tag: "food_support", sub: "restaurants" },
  "places to eat": { tag: "food_support", sub: "restaurants" },
  restaurants: { tag: "food_support", sub: "restaurants" },
  "cheap food": { tag: "food_support", sub: "cheap" },
  "cheap eats": { tag: "food_support", sub: "cheap" },
  "late night food": { tag: "food_support", sub: "late_night" },
  "late-night food": { tag: "food_support", sub: "late_night" },
  groceries: { tag: "food_support", sub: "grocery" },
  "grocery store": { tag: "food_support", sub: "grocery" },
  "food pantry": { tag: "food_support", sub: "pantry" },
  "free food": { tag: "food_support", sub: "free_meals" },
  "free meals": { tag: "food_support", sub: "free_meals" },
  halal: { tag: "food_support", sub: "halal" },
  kosher: { tag: "food_support", sub: "kosher" },
  vegan: { tag: "food_support", sub: "vegan" },
  vegetarian: { tag: "food_support", sub: "vegetarian" },
  snap: { tag: "food_support", sub: "snap" },
  ebt: { tag: "food_support", sub: "snap" },

  // --- Academic ---
  tutoring: { tag: "academic_support", sub: "tutoring" },
  tutor: { tag: "academic_support", sub: "tutoring" },
  "writing center": { tag: "academic_support", sub: "writing" },
  "writing help": { tag: "academic_support", sub: "writing" },
  "math help": { tag: "academic_support", sub: "math" },
  "academic advising": { tag: "academic_support", sub: "advising" },
  advising: { tag: "academic_support", sub: "advising" },
  accommodations: { tag: "academic_support", sub: "disability" },
  "disability accommodations": { tag: "academic_support", sub: "disability" },
  library: { tag: "academic_support", sub: "library" },
  "study room": { tag: "academic_support", sub: "library" },
  "study rooms": { tag: "academic_support", sub: "library" },
  "test prep": { tag: "academic_support", sub: "test_prep" },
  failing: { tag: "academic_support", sub: "default" },
  grades: { tag: "academic_support", sub: "default" },
  gpa: { tag: "academic_support", sub: "default" },
  "bad in school": { tag: "academic_support", sub: "default" },
  "can't focus": { tag: "academic_support", sub: "default" },
  "cant focus": { tag: "academic_support", sub: "default" },

  // --- Transportation ---
  shuttle: { tag: "transport_support", sub: "shuttle" },
  "shuttle schedule": { tag: "transport_support", sub: "shuttle" },
  "bus routes": { tag: "transport_support", sub: "bus" },
  bus: { tag: "transport_support", sub: "bus" },
  train: { tag: "transport_support", sub: "train" },
  "train station": { tag: "transport_support", sub: "train" },
  parking: { tag: "transport_support", sub: "parking" },
  "parking permit": { tag: "transport_support", sub: "parking" },
  "bike share": { tag: "transport_support", sub: "bikeshare" },
  "bike repair": { tag: "transport_support", sub: "bikerepair" },
  uber: { tag: "transport_support", sub: "rideshare" },
  lyft: { tag: "transport_support", sub: "rideshare" },

  // --- Mental health ---
  anxious: { tag: "mental_health", sub: "default" },
  anxiety: { tag: "mental_health", sub: "default" },
  depressed: { tag: "mental_health", sub: "default" },
  depression: { tag: "mental_health", sub: "default" },
  therapy: { tag: "mental_health", sub: "therapy" },
  counseling: { tag: "mental_health", sub: "therapy" },
  "group therapy": { tag: "mental_health", sub: "group" },
  "support group": { tag: "mental_health", sub: "group" },
  stressed: { tag: "mental_health", sub: "stress" },
  stress: { tag: "mental_health", sub: "stress" },
  burnout: { tag: "mental_health", sub: "stress" },
  insomnia: { tag: "mental_health", sub: "sleep" },
  "cant sleep": { tag: "mental_health", sub: "sleep" },
  "can't sleep": { tag: "mental_health", sub: "sleep" },

  // --- Health ---
  "urgent care": { tag: "health_support", sub: "urgent" },
  pharmacy: { tag: "health_support", sub: "pharmacy" },
  prescription: { tag: "health_support", sub: "pharmacy" },
  "sti testing": { tag: "health_support", sub: "sti" },
  "std testing": { tag: "health_support", sub: "sti" },
  "women's health": { tag: "health_support", sub: "womens" },
  vaccinations: { tag: "health_support", sub: "vaccines" },
  vaccination: { tag: "health_support", sub: "vaccines" },
  telehealth: { tag: "health_support", sub: "telehealth" },

  // --- Career ---
  resume: { tag: "career_support", sub: "resume" },
  "resume review": { tag: "career_support", sub: "resume" },
  interview: { tag: "career_support", sub: "interview" },
  "mock interview": { tag: "career_support", sub: "interview" },
  internship: { tag: "career_support", sub: "internship" },
  networking: { tag: "career_support", sub: "networking" },
  headshots: { tag: "career_support", sub: "headshots" },
  linkedin: { tag: "career_support", sub: "linkedin" },

  // --- Financial ---
  "financial aid": { tag: "financial_support", sub: "aid" },
  scholarships: { tag: "financial_support", sub: "scholarships" },
  scholarship: { tag: "financial_support", sub: "scholarships" },
  budgeting: { tag: "financial_support", sub: "budgeting" },
  taxes: { tag: "financial_support", sub: "taxes" },
  "work study": { tag: "financial_support", sub: "workstudy" },
  "work-study": { tag: "financial_support", sub: "workstudy" },
  rent: { tag: "financial_support", sub: "default" },
  bills: { tag: "financial_support", sub: "default" },
  debt: { tag: "financial_support", sub: "default" },

  // --- Housing ---
  dorm: { tag: "housing_support", sub: "dorm" },
  housing: { tag: "housing_support", sub: "default" },
  apartments: { tag: "housing_support", sub: "apartments" },
  apartment: { tag: "housing_support", sub: "apartments" },
  sublease: { tag: "housing_support", sub: "sublease" },
  roommate: { tag: "housing_support", sub: "roommate" },
  "tenant rights": { tag: "housing_support", sub: "tenant" },
  "renter rights": { tag: "housing_support", sub: "tenant" },
  "moving services": { tag: "housing_support", sub: "moving" },

  // --- Identity / cultural ---
  multicultural: { tag: "identity_support", sub: "multicultural" },
  lgbtq: { tag: "identity_support", sub: "lgbtq" },
  "women's center": { tag: "identity_support", sub: "womens" },
  "international student": { tag: "identity_support", sub: "international" },
  mosque: { tag: "identity_support", sub: "religious" },
  temple: { tag: "identity_support", sub: "religious" },
  church: { tag: "identity_support", sub: "religious" },
  synagogue: { tag: "identity_support", sub: "religious" },

  // --- Legal ---
  notary: { tag: "legal_support", sub: "notary" },
  immigration: { tag: "legal_support", sub: "immigration" },
  "legal services": { tag: "legal_support", sub: "legal" },
  "academic appeal": { tag: "legal_support", sub: "appeals" },

  // --- Community / social ---
  lonely: { tag: "community_support", sub: "default" },
  alone: { tag: "community_support", sub: "default" },
  friends: { tag: "community_support", sub: "default" },
  clubs: { tag: "community_support", sub: "clubs" },
  events: { tag: "community_support", sub: "events" },
  volunteer: { tag: "community_support", sub: "volunteer" },

  // --- Relationships ---
  breakup: { tag: "relationship_support", sub: "default" },
  mediation: { tag: "relationship_support", sub: "mediation" },
  "conflict resolution": { tag: "relationship_support", sub: "mediation" },
  "relationship counseling": { tag: "relationship_support", sub: "counseling" },

  // --- Crisis / safety ---
  suicidal: { tag: "crisis", sub: "default" },
  "self harm": { tag: "crisis", sub: "default" },
  "self-harm": { tag: "crisis", sub: "default" },
  "kill myself": { tag: "crisis", sub: "default" },
  unsafe: { tag: "crisis", sub: "safety" },
  assaulted: { tag: "crisis", sub: "titleix" },
  "title ix": { tag: "crisis", sub: "titleix" },
  "sexual assault": { tag: "crisis", sub: "titleix" },
  shelter: { tag: "crisis", sub: "shelter" },
  "campus police": { tag: "crisis", sub: "police" },
};

// Detect matched intents (prioritize longer phrases so “dining hall” beats “food”)
function detectIntents(text) {
  const t = (text || "").toLowerCase();
  const keys = Object.keys(KEYWORD_INTENT_MAP).sort((a, b) => b.length - a.length);

  const found = [];
  const seen = new Set();

  for (const k of keys) {
    if (!t.includes(k)) continue;
    const intent = KEYWORD_INTENT_MAP[k];
    const id = `${intent.tag}::${intent.sub}`;
    if (seen.has(id)) continue;
    seen.add(id);
    found.push({ ...intent, keyword: k });
  }

  // Fallback: if nothing matched, assume academic support default
  if (found.length === 0) {
    found.push({ tag: "academic_support", sub: "default", keyword: "" });
  }

  return found;
}

// ---------- Campus recommendations (supports resource.intents = [{tag, sub}] ) ----------
function resourceMatchesIntent(resource, intent) {
  // Preferred: structured intents
  if (Array.isArray(resource.intents)) {
    return resource.intents.some((it) => it?.tag === intent.tag && it?.sub === intent.sub);
  }

  // Backward-compatible: tags only
  const tags = Array.isArray(resource.tags) ? resource.tags : [];
  if (!tags.includes(intent.tag)) return false;

  // If resource has subTags, use them
  const subTags = Array.isArray(resource.subTags) ? resource.subTags : [];
  if (intent.sub && intent.sub !== "default" && subTags.length) {
    return subTags.includes(intent.sub);
  }

  // If no sub info, allow tag match
  return true;
}

function buildCampusRecommendations(campusKey, intents) {
  const dir = getCampusDirectory();
  const campus = dir[campusKey];
  if (!campus || !Array.isArray(campus.resources)) return [];

  const results = [];
  for (const res of campus.resources) {
    for (const it of intents) {
      if (resourceMatchesIntent(res, it)) {
        results.push(res);
        break;
      }
    }
  }

  // De-dup by name
  const seen = new Set();
  return results.filter((r) => {
    const key = (r.name || "").toLowerCase();
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
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

// ---------- Outside resources (maps) ----------
function makeMapsUrl(query, geo) {
  const q = encodeURIComponent(query);
  return geo?.lat && geo?.lon
    ? `https://www.google.com/maps/search/${q}/@${geo.lat},${geo.lon},13z`
    : `https://www.google.com/maps/search/${q}`;
}

function buildOutsideResources(intents, geo) {
  // Keep it useful: max 3 links
  // Special rule: if ANY food intent appears, also include restaurants (people expect it)
  const picked = [];
  const seen = new Set();

  const hasFood = intents.some((i) => i.tag === "food_support");
  if (hasFood) {
    const foodRest = { tag: "food_support", sub: "restaurants", keyword: "" };
    const id = `${foodRest.tag}::${foodRest.sub}`;
    if (!seen.has(id)) {
      seen.add(id);
      picked.push(foodRest);
    }
  }

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

    return {
      name: `Nearby: ${label}`,
      type: "Google Maps",
      notes: "Opens map results based on what you typed.",
      links: [{ label: "Open map results", url: makeMapsUrl(query, geo) }],
    };
  });
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
      if (select) select.value = chat.campusKey || "";

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

  // Campus ONLY when selected
  const campusRecs = showCampus ? buildCampusRecommendations(campusKey, intents) : [];

  // Ask for location only when user clicks Guidance
  const geo = await getGeoIfAllowed();

  // Off-campus always (maps)
  const outside = buildOutsideResources(intents, geo);

  // Chips: show intent labels
  const chips = intents
    .slice(0, 4)
    .map((it) => {
      const def = INTENTS[it.tag]?.[it.sub] || INTENTS[it.tag]?.default;
      return `<div class="tag">${escapeHtml(def?.label || it.tag)}</div>`;
    })
    .join("");

  const header = `
    <div class="chatItem">
      <strong>Finding the right support…</strong>
      <p class="muted">Results are based on the specific keywords you used (not broad buzzwords).</p>
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

// ---------- Boot ----------
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderChatHistory();
});
