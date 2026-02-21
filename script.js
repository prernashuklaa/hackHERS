// ============================
// script.js — Compass Support (FULL FIX + EXPANDED)
// - Buttons work
// - Saved chats clickable
// - Theme toggle works + persists
// - Campus resources ONLY show if a campus is selected
// - Outside resources are Google Maps "near me" links by category
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

// ---------- Keyword map (keeps your originals + expands massively) ----------
const KEYWORD_TAG_MAP = {
  // ----------------------------
  // ✅ Your originals (kept)
  // ----------------------------
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

  // ----------------------------
  // 1) Mental Health & Emotional Support
  // ----------------------------
  "counseling center": "mental_health",
  "individual therapy": "mental_health",
  "group therapy": "mental_health",
  "crisis hotline": "crisis",
  "suicide prevention": "crisis",
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
  "social anxiety": "mental_health",
  "feeling numb": "mental_health",
  "need help": "mental_health",

  // ----------------------------
  // 2) Physical Health & Medical Care
  // ----------------------------
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
  "doctor appointment": "health_support",
  "feel sick": "health_support",
  fever: "health_support",
  cough: "health_support",
  injury: "health_support",
  "hurt my": "health_support",

  // ----------------------------
  // 3) Emergency & Safety
  // ----------------------------
  "campus police": "crisis",
  "emergency": "crisis",
  "safe walk": "crisis",
  escort: "crisis",
  "sexual assault": "crisis",
  "title ix": "crisis",
  "domestic violence": "crisis",
  shelter: "crisis",
  shelters: "crisis",
  "crisis intervention": "crisis",

  // ----------------------------
  // 4) Food & Basic Needs (NEW — Food recs)
  // ----------------------------
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

  // ----------------------------
  // 5) Academic Support
  // ----------------------------
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
  procrastination: "academic_support",
  procrastinating: "academic_support",
  "time management": "academic_support",

  // ----------------------------
  // 6) Career & Professional Development
  // ----------------------------
  "career center": "career_support",
  resume: "career_support",
  "resume review": "career_support",
  "mock interview": "career_support",
  interviews: "career_support",
  internship: "career_support",
  internships: "career_support",
  "part time job": "career_support",
  "part-time job": "career_support",
  "on campus job": "career_support",
  "on-campus job": "career_support",
  networking: "career_support",
  "linkedin workshop": "career_support",
  headshots: "career_support",
  "professional headshot": "career_support",

  // ----------------------------
  // 7) Financial Support & Money Help
  // ----------------------------
  "financial aid": "financial_support",
  "emergency grant": "financial_support",
  "emergency grants": "financial_support",
  scholarship: "financial_support",
  scholarships: "financial_support",
  "payment plan": "financial_support",
  budgeting: "financial_support",
  "free tax prep": "financial_support",
  "work study": "financial_support",
  "work-study": "financial_support",

  // ----------------------------
  // 8) Housing & Living
  // ----------------------------
  housing: "housing_support",
  apartment: "housing_support",
  apartments: "housing_support",
  sublease: "housing_support",
  subleases: "housing_support",
  "roommate search": "housing_support",
  landlord: "housing_support",
  "renter rights": "housing_support",
  "tenant rights": "housing_support",
  "moving services": "housing_support",
  dorm: "housing_support",
  eviction: "housing_support",
  lease: "housing_support",
  homeless: "housing_support",

  // ----------------------------
  // 9) Transportation & Mobility
  // ----------------------------
  shuttle: "transport_support",
  "bus route": "transport_support",
  "bus routes": "transport_support",
  train: "transport_support",
  "train station": "transport_support",
  airport: "transport_support",
  parking: "transport_support",
  "parking permit": "transport_support",
  "bike share": "transport_support",
  "bike repair": "transport_support",
  rental: "transport_support",
  "car rental": "transport_support",
  rideshare: "transport_support",
  uber: "transport_support",
  lyft: "transport_support",

  // ----------------------------
  // 10) Identity-Based & Cultural Support
  // ----------------------------
  multicultural: "identity_support",
  "women's center": "identity_support",
  "womens center": "identity_support",
  lgbtq: "identity_support",
  "international student": "identity_support",
  religion: "identity_support",
  mosque: "identity_support",
  temple: "identity_support",
  church: "identity_support",
  synagogue: "identity_support",
  "language support": "identity_support",

  // ----------------------------
  // 11) Legal & Administrative Help
  // ----------------------------
  "legal services": "legal_support",
  notary: "legal_support",
  immigration: "legal_support",
  "academic appeal": "legal_support",
  disciplinary: "legal_support",
  "tenant law": "legal_support",

  // ----------------------------
  // 12) Physical Wellness & Recreation
  // ----------------------------
  gym: "recreation_support",
  fitness: "recreation_support",
  "fitness class": "recreation_support",
  yoga: "recreation_support",
  meditation: "recreation_support",
  intramural: "recreation_support",
  recreation: "recreation_support",
  running: "recreation_support",
  "outdoor spaces": "recreation_support",

  // ----------------------------
  // 13) Tech & Study Infrastructure
  // ----------------------------
  "computer lab": "tech_support",
  "computer labs": "tech_support",
  printing: "tech_support",
  printer: "tech_support",
  wifi: "tech_support",
  "free wifi": "tech_support",
  "laptop repair": "tech_support",
  "it help": "tech_support",
  "help desk": "tech_support",
  "charging station": "tech_support",
  "charging stations": "tech_support",
  "24 hour study": "tech_support",
  "24-hour study": "tech_support",

  // ----------------------------
  // 14) Social Connection & Community
  // ----------------------------
  clubs: "community_support",
  "club fair": "community_support",
  events: "community_support",
  volunteer: "community_support",
  volunteering: "community_support",
  faith: "community_support",
  mixer: "community_support",
  "student mixer": "community_support",

  // ----------------------------
  // 15) Relationship & Personal Support
  // ----------------------------
  mediation: "relationship_support",
  "conflict resolution": "relationship_support",
  "peer mentoring": "relationship_support",
  "relationship counseling": "relationship_support",
  "sexual health education": "relationship_support",
};

// Match multiple tags
function getMatchedTags(text) {
  const t = (text || "").toLowerCase();
  const matched = new Set();

  for (const [keyword, tag] of Object.entries(KEYWORD_TAG_MAP)) {
    if (t.includes(keyword)) matched.add(tag);
  }

  // sensible fallback
  if (matched.size === 0) matched.add("academic_support");
  return matched;
}

// ---------- Campus recommendations ----------
function buildCampusRecommendations(campusKey, text) {
  const dir = getCampusDirectory();
  const matchedTags = getMatchedTags(text);
  const campusRecs = [];

  Object.entries(dir).forEach(([key, campus]) => {
    if (campusKey && key !== campusKey) return;

    (campus.resources || []).forEach((resource) => {
      const tags = resource.tags || [];
      if (tags.some((tag) => matchedTags.has(tag))) {
        campusRecs.push(resource);
      }
    });
  });

  return campusRecs;
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

// ---------- Outside resources (Google Maps links by category) ----------
function buildOutsideResources({ text, campusKey, customCampusName, geo }) {
  const tags = getMatchedTags(text);

  // IMPORTANT: these should be "search intents" (what you want the map results to show)
  const TAG_TO_MAP_QUERY = {
    // mental health + safety
    mental_health: "counseling therapy mental health clinic near me",
    crisis: "crisis center near me",
    health_support: "urgent care clinic pharmacy near me",

    // academics + career
    academic_support: "tutoring center near me Kumon Sylvan learning center",
    career_support: "career coaching resume help interview prep near me",

    // money/housing/legal/etc
    financial_support: "financial assistance food pantry SNAP help near me",
    housing_support: "housing assistance tenant help near me",
    legal_support: "student legal services legal aid notary near me",

    // identity/community/relationships
    identity_support: "community center cultural center LGBTQ center near me",
    community_support: "community events student groups near me",
    relationship_support: "relationship counseling mediation services near me",

    // recreation + tech
    recreation_support: "gym yoga fitness classes near me",
    tech_support: "computer repair laptop repair printing services near me",

    // transportation
    transport_support: "train station bus terminal bike repair near me",

    // FOOD (NEW)
    food_support:
      "cheap food late night food grocery store food pantry halal kosher vegan vegetarian near me",
  };

  const dir = getCampusDirectory();
  const campusLabel =
    (campusKey && dir[campusKey]?.displayName) ||
    (customCampusName || "").trim();

  const makeMapsUrl = (query) => {
    // if user selected a campus, bias results around that campus name
    const finalQuery = campusLabel ? `${query} near ${campusLabel}` : query;
    const q = encodeURIComponent(finalQuery);

    // if geolocation exists, open map centered on them
    return geo?.lat && geo?.lon
      ? `https://www.google.com/maps/search/${q}/@${geo.lat},${geo.lon},13z`
      : `https://www.google.com/maps/search/${q}`;
  };

  // Keep it clean: up to 3 most relevant links
  // Rule: if food_support is present, include it (people LOVE this feature)
  const tagList = Array.from(tags);
  const picked = [];

  if (tags.has("food_support")) picked.push("food_support");

  for (const t of tagList) {
    if (picked.length >= 3) break;
    if (!picked.includes(t)) picked.push(t);
  }

  return picked.map((tag) => {
    const query = TAG_TO_MAP_QUERY[tag] || "student support services near me";
    const label = TAGS[tag] || tag.replaceAll("_", " ");
    return {
      name: `Nearby: ${label}`,
      type: "Google Maps",
      notes: "Opens map results based on what you typed.",
      links: [{ label: "Open map results", url: makeMapsUrl(query) }],
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
                      <a class="link" href="${escapeHtml(
                        l.url
                      )}" target="_blank" rel="noopener noreferrer">
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

      if (typeof window.renderCampusHint === "function") window.renderCampusHint();
    });
  });
}

window.renderChatHistory = renderChatHistory;

window.exportChats = function exportChats() {
  const chats = loadChats();
  const blob = new Blob([JSON.stringify(chats, null, 2)], {
    type: "application/json",
  });
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

  const dir = getCampusDirectory();
  const campusLabel = showCampus && dir[campusKey] ? dir[campusKey].displayName : "";

  // Campus recs ONLY if a campus is selected
  const campusRecs = showCampus ? buildCampusRecommendations(campusKey, text) : [];

  // triggers browser prompt IF served via http(s)
  const geo = await getGeoIfAllowed();

  // Outside recs always show (maps)
  const outside = buildOutsideResources({
    text,
    campusKey,
    customCampusName: window.customCampusName || "",
    geo,
  });

  const matchedTags = getMatchedTags(text);
  const tagChips = Array.from(matchedTags)
    .slice(0, 4)
    .map((t) => `<div class="tag">${escapeHtml(TAGS[t] || t.replaceAll("_", " "))}</div>`)
    .join("");

  const header = `
    <div class="chatItem">
      <strong>Finding the right support…</strong>
      <p class="muted">Nearby links are map-based. Campus links appear only if you choose a campus.</p>
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
    campusLabel:
      campusLabel ||
      (window.customCampusName ? `“${window.customCampusName}”` : "No campus"),
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
