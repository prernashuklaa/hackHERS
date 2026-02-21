// script.js
// Compass core: theme + campus hint + on-campus + off-campus nearby

const THEME_KEY = "compass_theme_v1";
let customCampusName = "";

/* =========================
   CAMPUS DIRECTORY ACCESS
========================= */
function getCampusDirectory() {
  return window.CAMPUS_DIRECTORY || {};
}

function getSelectedCampusKey() {
  const el = document.getElementById("campusSelect");
  return el ? el.value : "";
}

/* =========================
   THEME TOGGLE
========================= */
function applyTheme(theme) {
  const t = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", t);

  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const icon = btn.querySelector(".toggleIcon");
  const text = btn.querySelector(".toggleText");
  const isDark = t === "dark";

  if (icon) icon.textContent = isDark ? "☀️" : "🌙";
  if (text) text.textContent = isDark ? "Light" : "Dark";
}

function getSavedTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === "dark" || stored === "light" ? stored : "light";
}

window.toggleTheme = function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
};

window.addEventListener("DOMContentLoaded", () => {
  applyTheme(getSavedTheme());
  // Don’t crash if elements aren’t on the page
  if (document.getElementById("campusHint")) window.renderCampusHint?.();
});

/* =========================
   UI HELPERS
========================= */
window.clearInput = function clearInput() {
  const inputEl = document.getElementById("inputBox");
  if (inputEl) inputEl.value = "";
};

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function hasAny(text, keywords) {
  return keywords.some((k) => text.includes(k));
}

/* =========================
   CAMPUS HINT
========================= */
window.renderCampusHint = function renderCampusHint() {
  const hintEl = document.getElementById("campusHint");
  if (!hintEl) return;

  const campusKey = getSelectedCampusKey();
  const dir = getCampusDirectory();

  if (campusKey && dir[campusKey]) {
    hintEl.textContent = `Showing on-campus options for ${dir[campusKey].displayName}.`;
  } else if (customCampusName) {
    hintEl.textContent = `No campus-specific data for “${customCampusName}”. Showing general resources.`;
  } else {
    hintEl.textContent = "Tip: selecting a campus shows on-campus offices first.";
  }
};

/* =========================
   ON-CAMPUS RECOMMENDATIONS
========================= */
function buildCampusRecommendations(campusKey, text) {
  const dir = getCampusDirectory();
  if (!campusKey || !dir[campusKey]) return [];

  const campus = dir[campusKey];
  if (!Array.isArray(campus.resources)) return [];

  const t = (text || "").toLowerCase();

  // map words in user text → our known tags
  const KEYWORD_TAG_MAP = {
    lonely: "social_support",
    alone: "social_support",
    friends: "social_support",
    anxious: "mental_health",
    anxiety: "mental_health",
    depressed: "mental_health",
    depression: "mental_health",
    stress: "mental_health",
    stressed: "mental_health",
    overwhelmed: "mental_health",
    panic: "mental_health",
    burnout: "mental_health",
    therapy: "mental_health",
    counseling: "mental_health",
  };

  const words = t.split(/\W+/).filter(Boolean);
  const matchedTags = [...new Set(words.map((w) => KEYWORD_TAG_MAP[w]).filter(Boolean))];

  if (matchedTags.length === 0) {
    return campus.resources.slice(0, 2);
  }

  const hits = campus.resources.filter((r) =>
    (r.tags || []).some((tag) => matchedTags.includes(tag))
  );

  return hits.length ? hits.slice(0, 4) : campus.resources.slice(0, 2);
}

/* =========================
   OFF-CAMPUS RECOMMENDATIONS
========================= */
function categorize(text) {
  const t = (text || "").toLowerCase();
  const categories = [];

  if (hasAny(t, ["suicidal", "self harm", "self-harm", "kill myself"])) categories.push("crisis");
  if (
    hasAny(t, [
      "anxious", "anxiety", "panic", "depressed", "depression", "sad",
      "hopeless", "overwhelmed", "stress", "stressed", "burnout", "therapy", "counseling",
    ])
  ) categories.push("mental_health");

  if (
    hasAny(t, ["focus", "procrast", "motivation", "cant start", "can't start", "stuck", "doomscroll"])
  ) categories.push("focus_support");

  if (
    hasAny(t, ["grade", "exam", "midterm", "final", "assignment", "deadline", "homework", "study", "gpa"])
  ) categories.push("academic_support");

  if (
    hasAny(t, ["money", "rent", "tuition", "bills", "financial", "food", "hungry", "groceries", "job", "debt"])
  ) categories.push("financial_support");

  if (
    hasAny(t, ["alone", "lonely", "isolated", "friends", "roommate", "relationship", "breakup", "unsafe", "harassed"])
  ) categories.push("social_support");

  if (!categories.length) categories.push("general_support");
  return Array.from(new Set(categories));
}

function buildRecommendations(categories) {
  const library = {
    crisis: {
      title: "Urgent / Crisis Support",
      why: "If you might harm yourself or feel unsafe, real-time help matters most.",
      next: [
        "If you’re in the U.S., call or text 988 (Suicide & Crisis Lifeline).",
        "If you’re in immediate danger, call local emergency services.",
        "If you’re on campus, contact campus security or an RA/Dean on call.",
      ],
      searchQuery: "crisis hotline",
    },
    mental_health: {
      title: "Counseling / Mental Health Support",
      why: "Your message suggests high stress or emotional strain — support can help.",
      next: [
        "Look for community mental health centers or counseling clinics.",
        "If cost is a concern, search for sliding-scale therapy.",
        "If you prefer privacy, look for telehealth options.",
      ],
      searchQuery: "counseling services",
    },
    focus_support: {
      title: "Focus & Executive Function Support",
      why: "This sounds like attention drift or procrastination — supports exist beyond “try harder.”",
      next: [
        "Look for academic coaching or learning specialist support.",
        "Try structured study spaces (library, tutoring center).",
        "Use accountability: a friend or study group check-in.",
      ],
      searchQuery: "academic coaching",
    },
    academic_support: {
      title: "Academic Support (Tutoring / Advising)",
      why: "This sounds like deadlines, grades, or coursework pressure — help can reduce the load fast.",
      next: [
        "Find a tutoring/learning center for your subject.",
        "Meet with an academic advisor to triage deadlines.",
        "Ask a TA/professor for the minimum path forward.",
      ],
      searchQuery: "tutoring center",
    },
    financial_support: {
      title: "Financial / Basic Needs Support",
      why: "Money stress can overwhelm everything — there are often quick resources available.",
      next: [
        "Search for emergency financial assistance programs.",
        "Look for food pantries (community).",
        "Check local benefits/aid programs you may qualify for.",
      ],
      searchQuery: "student emergency financial assistance",
    },
    social_support: {
      title: "Social Support & Community",
      why: "Feeling isolated can make school much harder — support networks help you stabilize.",
      next: [
        "Search for peer support groups in your area.",
        "Try a low-pressure event (go for 15 minutes, then leave).",
        "If safety is involved, contact local resources immediately.",
      ],
      searchQuery: "support groups",
    },
    general_support: {
      title: "Start Here (Student Support Services)",
      why: "A general support office can route you to the right place.",
      next: [
        "Search for community support services near you.",
        "If academics are involved, start with tutoring/advising nearby.",
        "If emotions are involved, start with counseling resources.",
      ],
      searchQuery: "student support services",
    },
  };

  const ordered = [...categories].sort((a, b) => (a === "crisis" ? -1 : b === "crisis" ? 1 : 0));
  return ordered.map((k) => library[k]).filter(Boolean).slice(0, 4);
}

/* =========================
   LOCATION + MAPS
========================= */
function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("no geolocation"));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => reject(new Error("denied")),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
    );
  });
}

function buildMapsLink(query, loc, campusLabel) {
  const extra = campusLabel ? ` ${campusLabel}` : "";
  const q = encodeURIComponent(`${query}${extra} near me`);
  return loc
    ? `https://www.google.com/maps/search/?api=1&query=${q}&center=${loc.lat},${loc.lon}`
    : `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/* =========================
   RENDER RESULTS
========================= */
function renderResults(outputEl, userText, campusKey, campusRecs, offCampusRecs, loc) {
  const dir = getCampusDirectory();
  const campusLabel = campusKey && dir[campusKey] ? dir[campusKey].displayName : (customCampusName || "");

  const campusSection = campusRecs.length
    ? `<div class="card">
        <h3>On-campus options${campusKey && dir[campusKey] ? ` — ${escapeHtml(dir[campusKey].displayName)}` : ""}</h3>
        <ul class="steps">
          ${campusRecs.map(r => {
            const links = Array.isArray(r.links) ? r.links : [];
            return `<li>
              <strong>${escapeHtml(r.name)}</strong> — ${escapeHtml(r.type || "Campus resource")}
              ${r.notes ? `<div class="muted">${escapeHtml(r.notes)}</div>` : ""}
              ${links.length ? `<div style="margin-top:6px; display:flex; gap:10px; flex-wrap:wrap;">
                ${links.map(l => `<a class="link" href="${l.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)}</a>`).join("")}
              </div>` : ""}
            </li>`;
          }).join("")}
        </ul>
      </div>`
    : `<div class="card"><h3>On-campus options</h3><p class="muted">No campus-specific matches found.</p></div>`;

  const offCampusCards = offCampusRecs.map(r => {
    const mapsLink = buildMapsLink(r.searchQuery, loc, campusLabel);
    return `<div class="card">
      <h3>${escapeHtml(r.title)}</h3>
      <p class="why">${escapeHtml(r.why)}</p>
      <ul class="steps">${(r.next || []).map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
      <div class="actions">
        <a class="linkBtn" href="${mapsLink}" target="_blank" rel="noopener noreferrer">Search near me</a>
      </div>
    </div>`;
  }).join("");

  outputEl.innerHTML = `
    <div class="chatItem">
      <strong>Finding the right support…</strong>
      <p class="muted">Matching your situation to on-campus and nearby resources.</p>
      <p style="margin:10px 0 0 0;">“${escapeHtml(userText)}”</p>
    </div>

    ${campusSection}

    <div class="card">
      <h3>Off-campus options nearby</h3>
      <p class="muted">Community resources you can access near your location.</p>
    </div>

    ${offCampusCards}
  `;
}

/* =========================
   ANALYZE
========================= */
window.analyze = function analyze() {
  const inputEl = document.getElementById("inputBox");
  const outputEl = document.getElementById("output");
  if (!inputEl || !outputEl) return;

  const text = (inputEl.value || "").trim();
  if (!text) {
    outputEl.innerHTML = `<div class="chatItem"><strong>Please type what’s going on.</strong></div>`;
    return;
  }

  outputEl.innerHTML = `
    <div class="chatItem">
      <strong>Finding the right support…</strong>
      <p class="muted">Matching your situation to on-campus and nearby resources.</p>
    </div>
  `;

  const campusKey = getSelectedCampusKey();
  const campusRecs = buildCampusRecommendations(campusKey, text);

  const categories = categorize(text);
  const offCampusRecs = buildRecommendations(categories);

  getLocation()
    .then((loc) => renderResults(outputEl, text, campusKey, campusRecs, offCampusRecs, loc))
    .catch(() => renderResults(outputEl, text, campusKey, campusRecs, offCampusRecs, null));
};
