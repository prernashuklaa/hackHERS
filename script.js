// ============================
// script.js — Compass Support
// ============================

// Returns campus directory loaded in campuses.js
function getCampusDirectory() {
  return window.CAMPUS_DIRECTORY || {};
}

// Get currently selected campus key
function getSelectedCampusKey() {
  const el = document.getElementById("campusSelect");
  return el ? el.value : "";
}

// Escape HTML for safe rendering
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ============================
// Keyword → Tag mapping
// ============================
const KEYWORD_TAG_MAP = {
  // Social support
  "lonely": "social_support",
  "alone": "social_support",
  "friends": "social_support",
  "isolated": "social_support",
  "roommate": "social_support",
  "relationship": "social_support",
  "breakup": "social_support",
  "harassed": "social_support",
  "unsafe": "social_support",

  // Mental health
  "drained": "mental_health",
  "anxious": "mental_health",
  "anxiety": "mental_health",
  "depressed": "mental_health",
  "depression": "mental_health",
  "stress": "mental_health",
  "stressed": "mental_health",
  "therapy": "mental_health",
  "overwhelmed": "mental_health",
  "panic": "mental_health",
  "burnout": "mental_health",
  "sad": "mental_health",
  "hopeless": "mental_health",
  "counseling": "mental_health",

  // Financial
  "money": "financial_support",
  "rent": "financial_support",
  "bills": "financial_support",
  "tuition": "financial_support",
  "food": "financial_support",
  "groceries": "financial_support",
  "job": "financial_support",
  "debt": "financial_support",

  // Crisis / suicidal
  "suicidal": "crisis",
  "self harm": "crisis",
  "self-harm": "crisis",
  "kill myself": "crisis"
};

// ============================
// Find which tags match user input
// ============================
function getMatchedTags(text) {
  const t = text.toLowerCase();
  const matchedTags = new Set();

  for (const [keyword, tag] of Object.entries(KEYWORD_TAG_MAP)) {
    if (t.includes(keyword)) matchedTags.add(tag);
  }

  return matchedTags;
}

// ============================
// Build resource recommendations
// ============================
function buildCampusRecommendations(campusKey, text) {
  const dir = getCampusDirectory();
  const matchedTags = getMatchedTags(text);
  const campusRecs = [];

  // Iterate all campuses, filter by selected if needed
  Object.entries(dir).forEach(([key, campus]) => {
    if (campusKey && key !== campusKey) return;

    if (Array.isArray(campus.resources)) {
      campus.resources.forEach(resource => {
        if ((resource.tags || []).some(tag => matchedTags.has(tag))) {
          campusRecs.push(resource);
        }
      });
    }
  });

  return campusRecs;
}

// ============================
// Render results
// ============================
window.analyze = function analyze() {
  const inputEl = document.getElementById("inputBox");
  const outputEl = document.getElementById("output");
  if (!inputEl || !outputEl) return;

  const text = (inputEl.value || "").trim();
  if (!text) {
    outputEl.innerHTML = `<div class="chatItem"><strong>Please type what’s going on.</strong></div>`;
    return;
  }

  const campusKey = getSelectedCampusKey();
  const campusRecs = buildCampusRecommendations(campusKey, text);

  outputEl.innerHTML = `
    <div class="chatItem">
      <strong>Finding the right support…</strong>
      <p class="muted">Matching your situation to on-campus and nearby resources.</p>
    </div>

    ${campusRecs.length ? `<div class="card">
      <h3>Resources${campusKey ? ` — ${escapeHtml(window.CAMPUS_DIRECTORY[campusKey].displayName)}` : ""}</h3>
      <ul class="steps">
        ${campusRecs.map(r => `
          <li>
            <strong>${escapeHtml(r.name)}</strong> — ${escapeHtml(r.type || "Campus resource")}
            ${r.notes ? `<div class="muted">${escapeHtml(r.notes)}</div>` : ""}
            ${Array.isArray(r.links) && r.links.length ? `<div style="margin-top:6px; display:flex; gap:10px; flex-wrap:wrap;">
              ${r.links.map(l => `<a class="link" href="${l.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)}</a>`).join("")}
            </div>` : ""}
          </li>
        `).join("")}
      </ul>
    </div>` : `<p class="muted">No campus resources found.</p>`}
  `;
};

// ============================
// Clear input
// ============================
window.clearInput = function clearInput() {
  const inputEl = document.getElementById("inputBox");
  if (inputEl) inputEl.value = "";
};
