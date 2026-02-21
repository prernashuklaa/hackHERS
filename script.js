// ============================
// script.js — Compass Support (FULL)
// - Buttons work
// - Saved chats clickable
// - Theme toggle works + persists
// - Campus resources ONLY show if a campus is selected
// - EVERY matched tag gets:
//    (1) On-campus link (curated if available, otherwise campus web search)
//    (2) Off-campus link (Google Maps search near user/campus)
// - Adds Food recommendations on and off campus
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
  return String(str)
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

window.toggleTheme = function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
};

// ---------- Tags (categories) ----------
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

// ---------- Tag → intent text (used for campus searches + maps queries) ----------
const TAG_INTENTS = {
  mental_health: {
    campus: "counseling center therapy group counseling wellness",
    maps: "counseling therapy mental health clinic near me",
  },
  health_support: {
    campus: "student health center clinic urgent care pharmacy vaccinations telehealth",
    maps: "urgent care clinic pharmacy near me",
  },
  crisis: {
    campus: "campus police emergency title ix sexual assault response safe walk",
    maps: "crisis center near me",
  },
  food_support: {
    campus: "dining meal plan food pantry basic needs free meals halal kosher vegan vegetarian",
    maps: "cheap food late night food grocery store food pantry halal kosher vegan vegetarian near me",
  },
  academic_support: {
    campus: "tutoring writing center learning center academic advising study rooms library hours disability services",
    maps: "tutoring center near me Kumon Sylvan learning center",
  },
  career_support: {
    campus: "career center resume review mock interview internship workshops on-campus jobs headshots linkedin workshop",
    maps: "career coaching resume help interview prep near me",
  },
  financial_support: {
    campus: "financial aid scholarships emergency grants payment plan work-study budgeting",
    maps: "financial assistance food pantry SNAP help near me",
  },
  housing_support: {
    campus: "housing residence life off-campus housing roommate search tenant support",
    maps: "housing assistance tenant help near me",
  },
  transport_support: {
    campus: "campus shuttle bus routes train station parking permits bike share",
    maps: "train station bus terminal bike repair near me",
  },
  identity_support: {
    campus: "multicultural center women’s center lgbtq center international student office religious spaces",
    maps: "LGBTQ center multicultural center community center near me",
  },
  legal_support: {
    campus: "student legal services notary immigration help academic appeals disciplinary support",
    maps: "legal aid notary immigration lawyer near me",
  },
  recreation_support: {
    campus: "campus gym fitness classes yoga meditation intramurals recreation center outdoor spaces",
    maps: "gym yoga fitness classes near me",
  },
  tech_support: {
    campus: "IT help desk computer labs printing wifi laptop repair charging stations 24-hour study",
    maps: "computer repair laptop repair printing services near me",
  },
  community_support: {
    campus: "clubs student organizations campus events club fair volunteering faith-based groups mixers",
    maps: "community events student groups volunteer opportunities near me",
  },
  relationship_support: {
    campus: "relationship counseling mediation conflict resolution peer mentoring sexual health education",
    maps: "relationship counseling mediation services near me",
  },
};

// ---------- Keyword map ----------
const KEYWORD_TAG_MAP = {
  // Originals kept (mapped into your new tag system)
  lonely: "community_support",
  alone: "community_support",
  friends: "community_support",
  isolated: "community_support",
  roommate: "relationship_support",
  relationship: "relationship_support",
  breakup: "relationship_support",
  harassed: "crisis",

  unsafe: "crisis",
  assaulted: "crisis",

  drained: "mental_health",
  anxious: "mental_health",
  anxiety: "mental_health",
  depressed: "mental_health",
  depression: "mental_health",
  stress: "mental_health",
  stressed: "mental_health",
  therapy: "mental_health",
  overwhelmed: "mental_health",
  panic: "mental_health",
  burnout: "mental_health",
  sad: "mental_health",
  hopeless: "mental_health",
  counseling: "mental_health",

  money: "financial_support",
  rent: "financial_support",
  bills: "financial_support",
  tuition: "financial_support",
  food: "food_support",
  groceries: "food_support",
  job: "career_support",
  debt: "financial_support",
  finance: "financial_support",
  financial: "financial_support",

  suicidal: "crisis",
  "self harm": "crisis",
  "self-harm": "crisis",
  "kill myself": "crisis",

  // Mental health
  "counseling center": "mental_health",
  "individual therapy": "mental_health",
  "group therapy": "mental_health",
  "stress management": "mental_health",
  workshop: "mental_health",
  workshops: "mental_health",
  "peer support": "mental_health",
  "support group": "mental_health",
  "support groups": "mental_health",
  "mental health": "mental_health",
  "can’t sleep": "mental_health",
  "cant sleep": "mental_health",
  insomnia: "mental_health",
  "panic attack": "mental_health",

  // Health
  "health center": "health_support",
  "campus health": "health_support",
  "urgent care": "health_support",
  "after hours": "health_support",
  telehealth: "health_support",
  "std testing": "health_support",
  "sti testing": "health_support",
  "women's health": "health_support",
  "womens health": "health_support",
  vaccination: "health_support",
  vaccinations: "health_support",
  pharmacy: "health_support",
  prescription: "health_support",
  insurance: "health_support",

  // Emergency & safety
  "campus police": "crisis",
  emergency: "crisis",
  "safe walk": "crisis",
  escort: "crisis",
  "sexual assault": "crisis",
  "title ix": "crisis",
  "domestic violence": "crisis",
  shelter: "crisis",
  shelters: "crisis",
  "crisis intervention": "crisis",

  // Food
  "cheap food": "food_support",
  "cheap eats": "food_support",
  "late night food": "food_support",
  "late-night food": "food_support",
  "food pantry": "food_support",
  pantry: "food_support",
  "free meals": "food_support",
  "free food": "food_support",
  halal: "food_support",
  kosher: "food_support",
  vegetarian: "food_support",
  vegan: "food_support",
  "community kitchen": "food_support",
  "snap help": "food_support",
  ebt: "food_support",
  "basic needs": "food_support",

  // Academic
  tutoring: "academic_support",
  tutor: "academic_support",
  "tutoring center": "academic_support",
  "writing center": "academic_support",
  "math help": "academic_support",
  "study group": "academic_support",
  "study groups": "academic_support",
  advising: "academic_support",
  advisor: "academic_support",
  "academic advising": "academic_support",
  "disability accommodations": "academic_support",
  accommodations: "academic_support",
  "library hours": "academic_support",
  "study room": "academic_support",
  "study rooms": "academic_support",
  "test prep": "academic_support",
  exam: "academic_support",
  test: "academic_support",
  midterm: "academic_support",
  final: "academic_support",
  failing: "academic_support",
  failed: "academic_support",
  grades: "academic_support",
  gpa: "academic_support",
  homework: "academic_support",
  "bad in school": "academic_support",
  "can't focus": "academic_support",
  "cant focus": "academic_support",

  // Career
  "career center": "career_support",
  resume: "career_support",
  "resume review": "career_support",
  "mock interview": "career_support",
  internship: "career_support",
  internships: "career_support",
  networking: "career_support",
  headshots: "career_support",
  "linkedin workshop": "career_support",

  // Financial
  "financial aid": "financial_support",
  scholarship: "financial_support",
  scholarships: "financial_support",
  "emergency grant": "financial_support",
  "payment plan": "financial_support",
  budgeting: "financial_support",
  "work study": "financial_support",
  "work-study": "financial_support",

  // Housing
  housing: "housing_support",
  apartment: "housing_support",
  apartments: "housing_support",
  sublease: "housing_support",
  "roommate search": "housing_support",
  landlord: "housing_support",
  lease: "housing_support",
  eviction: "housing_support",

  // Transport
  shuttle: "transport_support",
  bus: "transport_support",
  train: "transport_support",
  airport: "transport_support",
  parking: "transport_support",
  "bike share": "transport_support",
  "bike repair": "transport_support",
  uber: "transport_support",
  lyft: "transport_support",

  // Identity
  multicultural: "identity_support",
  "women's center": "identity_support",
  lgbtq: "identity_support",
  "international student": "identity_support",
  religion: "identity_support",
  mosque: "identity_support",
  temple: "identity_support",
  church: "identity_support",
  synagogue: "identity_support",

  // Legal
  "legal services": "legal_support",
  notary: "legal_support",
  immigration: "legal_support",
  "academic appeal": "legal_support",
  disciplinary: "legal_support",
  "tenant law": "legal_support",

  // Recreation
  gym: "recreation_support",
  fitness: "recreation_support",
  yoga: "recreation_support",
  meditation: "recreation_support",
  intramural: "recreation_support",

  // Tech
  "computer lab": "tech_support",
  printing: "tech_support",
  wifi: "tech_support",
  "laptop repair": "tech_support",
  "it help": "tech_support",
  "help desk": "tech_support",
  "charging stations": "tech_support",

  // Community
  clubs: "community_support",
  events: "community_support",
  volunteer: "community_support",
  volunteering: "community_support",
  faith: "community_support",

  // Relationship
  mediation: "relationship_support",
  "conflict resolution": "relationship_support",
  "peer mentoring": "relationship_support",
  "relationship counseling": "relationship_support",
};

// ---------- Match tags ----------
function getMatchedTags(text) {
  const t = (text || "").toLowerCase();
  const matched = new Set();

  for (const [keyword, tag] of Object.entries(KEYWORD_TAG_MAP)) {
    if (t.includes(keyword)) matched.add(tag);
  }

  if (matched.size === 0) matched.add("academic_support");
  return matched;
}

// ---------- Campus recs: curated + autogenerated fallback per tag ----------
function buildCampusResourcesPerTag(campusKey, matchedTags) {
  const dir = getCampusDirectory();
  const campus = dir[campusKey];
  if (!campus) return [];

  const curated = Array.isArray(campus.resources) ? campus.resources : [];

  // For each tag, pick curated matches; if none exist, create a campus web search fallback
  const results = [];

  matchedTags.forEach((tag) => {
    const curatedMatches = curated.filter((r) => (r.tags || []).includes(tag));

    if (curatedMatches.length) {
      // Include all curated matches for that tag
      curatedMatches.forEach((r) => results.push(r));
    } else {
      // Auto fallback: a campus-targeted search
      const campusLabel = campus.displayName || "your campus";
      const intent = TAG_INTENTS[tag]?.campus || `${TAGS[tag] || tag} resources`;
      const q = encodeURIComponent(`${campusLabel} ${intent}`);
      results.push({
        name: `Search campus resources: ${TAGS[tag] || tag.replaceAll("_", " ")}`,
        type: "Campus web search",
        tags: [tag],
        notes: "We didn’t have a specific saved campus link for this yet — this searches the official campus resources.",
        links: [{ label: "Search", url: `https://www.google.com/search?q=${q}` }],
      });
    }
  });

  return results;
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

// ---------- Off-campus: ONE maps link per matched tag ----------
function buildOutsideResourcesPerTag({ matchedTags, campusKey, geo }) {
  const dir = getCampusDirectory();
  const campusLabel = campusKey && dir[campusKey]?.displayName ? dir[campusKey].displayName : "";

  const makeMapsUrl = (query) => {
    const finalQuery = campusLabel ? `${query} near ${campusLabel}` : query;
    const q = encodeURIComponent(finalQuery);
    return geo?.lat && geo?.lon
      ? `https://www.google.com/maps/search/${q}/@${geo.lat},${geo.lon},13z`
      : `https://www.google.com/maps/search/${q}`;
  };

  const results = [];
  matchedTags.forEach((tag) => {
    const query = TAG_INTENTS[tag]?.maps || "student support services near me";
    const label = TAGS[tag] || tag.replaceAll("_", " ");
    results.push({
      name: `Nearby: ${label}`,
      type: "Google Maps",
      notes: "Opens map results based on what you typed.",
      links: [{ label: "Open map results", url: makeMapsUrl(query) }],
    });
  });

  return results;
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

  const campusKey = getSelectedCampusKey();
  const showCampus = Boolean(campusKey);

  const geo = await getGeoIfAllowed();
  const matchedTags = getMatchedTags(text);

  const tagChips = Array.from(matchedTags)
    .slice(0, 6)
    .map((t) => `<div class="tag">${escapeHtml(TAGS[t] || t.replaceAll("_", " "))}</div>`)
    .join("");

  // Build resources
  const campusResources = showCampus ? buildCampusResourcesPerTag(campusKey, matchedTags) : [];
  const outsideResources = buildOutsideResourcesPerTag({ matchedTags, campusKey, geo });

  const dir = getCampusDirectory();
  const campusLabel = showCampus && dir[campusKey] ? dir[campusKey].displayName : "";

  const header = `
    <div class="chatItem">
      <strong>Finding the right support…</strong>
      <p class="muted">Every category you triggered gets an on-campus link + a nearby map link.</p>
      ${geo ? `<div class="tag">Location enabled</div>` : `<div class="tag">Location not shared</div>`}
      <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:6px;">
        ${tagChips}
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
    : `
      <div class="card">
        <h3>Campus resources</h3>
        <p class="muted">Choose a campus from the dropdown to see on-campus links for every category.</p>
      </div>
    `;

  const outsideBlock = `
    <div class="card">
      <h3>Nearby resources (off-campus)</h3>
      ${renderResourceList(outsideResources)}
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
