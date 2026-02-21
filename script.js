// script.js
// Compass - theme + chat + campus logic

const STORAGE_KEY = "compass_chats_v2";
const THEME_KEY = "compass_theme_v1";

let customCampusName = "";

// Safe access to campuses
function getCampusDirectory() {
  return window.CAMPUS_DIRECTORY || {};
}

/* =========================
   THEME
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
});

window.addEventListener("load", () => {
  if (document.getElementById("campusHint")) renderCampusHint();
  if (document.getElementById("history")) renderChatHistory();
});

/* =========================
   BASIC UI
========================= */
window.clearInput = function clearInput() {
  const inputEl = document.getElementById("inputBox");
  if (inputEl) inputEl.value = "";
};

/* =========================
   CAMPUS SEARCH
========================= */
function getSelectedCampusKey() {
  const el = document.getElementById("campusSelect");
  return el ? el.value : "";
}

window.handleCampusSearch = function handleCampusSearch() {
  const input = document.getElementById("campusSearch");
  const rawVal = (input?.value || "").trim();
  const val = rawVal.toLowerCase();

  const select = document.getElementById("campusSelect");
  const dir = getCampusDirectory();

  const matchedKey = Object.keys(dir).find(
    (k) => (dir[k].displayName || "").toLowerCase().includes(val)
  );

  if (matchedKey) {
    if (select) select.value = matchedKey;
    customCampusName = "";
  } else {
    if (select) select.value = "";
    customCampusName = rawVal;
  }

  renderCampusHint();
};

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
   CAMPUS RECOMMENDATIONS
========================= */
function buildCampusRecommendations(campusKey, text) {
  const dir = getCampusDirectory();
  let resources = [];

  if (campusKey && dir[campusKey]) {
    resources = dir[campusKey].resources || [];
  } else {
    // NEW: If no campus selected, include resources from all campuses
    resources = Object.values(dir).flatMap(c => c.resources || []);
  }

  // OPTIONAL: filter by text keywords (e.g., show relevant resources)
  if (text) {
    const words = text.toLowerCase().split(/\W+/);
    resources = resources.filter(r => 
      (r.tags || []).some(tag => words.includes(tag.toLowerCase()))
    );
    // If none matched, return all resources anyway
    if (resources.length === 0) {
      resources = Object.values(dir).flatMap(c => c.resources || []);
    }
  }

  return resources;
}

/* =========================
   ANALYZE + RENDER
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

  const categories = categorize(text);
  const recs = buildRecommendations(categories);
  const campusKey = getSelectedCampusKey();
  const campusRecs = buildCampusRecommendations(campusKey, text);

  getLocation()
    .then((loc) => {
      renderResults(outputEl, text, recs, campusRecs, campusKey, loc, false);
      saveChat(text, categories, recs, campusKey, customCampusName);
      renderChatHistory();
    })
    .catch(() => {
      renderResults(outputEl, text, recs, campusRecs, campusKey, null, false);
      saveChat(text, categories, recs, campusKey, customCampusName);
      renderChatHistory();
    });
};

/* =========================
   CATEGORIZATION
========================= */
function categorize(text) {
  const t = text.toLowerCase();
  const categories = [];
  if (hasAny(t, ["suicidal","self harm","self-harm","kill myself"])) categories.push("crisis");
  if (hasAny(t, ["anxious","anxiety","panic","depressed","depression","sad","hopeless","overwhelmed","stress","stressed","burnout","therapy","counseling"])) categories.push("mental_health");
  if (hasAny(t, ["focus","distract","distraction","procrast","motivation","can't start","cant start","stuck","doomscroll","tiktok","instagram","social media","phone"])) categories.push("focus_support");
  if (hasAny(t, ["grade","grades","class","classes","exam","midterm","final","assignment","deadline","homework","study","studying","falling behind","behind","gpa"])) categories.push("academic_support");
  if (hasAny(t, ["money","rent","tuition","bills","financial","food","hungry","groceries","job","debt"])) categories.push("financial_support");
  if (hasAny(t, ["alone","lonely","isolated","friends","roommate","relationship","breakup","unsafe","harassed","harassment"])) categories.push("social_support"); // "lonely" included
  if (!categories.length) categories.push("general_support");
  return Array.from(new Set(categories));
}

function hasAny(text, keywords) {
  return keywords.some(k => text.includes(k));
}
