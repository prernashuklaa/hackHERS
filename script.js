function getCampusDirectory() {
  return window.CAMPUS_DIRECTORY || {};
}

function getSelectedCampusKey() {
  const el = document.getElementById("campusSelect");
  return el ? el.value : "";
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

// Map keywords to resource tags
const KEYWORD_TAG_MAP = {
  // Social support
  "lonely": "social_support",
  "alone": "social_support",
  "friends": "social_support",
  // Mental health
  "drained": "mental_health",
  "anxious": "mental_health",
  "anxiety": "mental_health",
  "depressed": "mental_health",
  "stress": "mental_health",
  "stressed": "mental_health",
  "therapy": "mental_health",
  "overwhelmed": "mental_health",
  "panic": "mental_health",
  "burnout": "mental_health",
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

// Build recommendations for a campus (or all campuses if none selected)
function buildCampusRecommendations(campusKey, text) {
  const dir = getCampusDirectory();
  const t = (text || "").toLowerCase();

  // Determine which tags match user input
  const matchedTags = new Set();
  for (const [keyword, tag] of Object.entries(KEYWORD_TAG_MAP)) {
    if (t.includes(keyword)) matchedTags.add(tag);
  }

  let campusRecs = [];

  // Search either selected campus or all campuses
  const campusesToCheck = campusKey && dir[campusKey] ? [dir[campusKey]] : Object.values(dir);

  campusesToCheck.forEach(campus => {
    if (!Array.isArray(campus.resources)) return;

    campus.resources.forEach(r => {
      // If resource matches user tags, include it
      if ((r.tags || []).some(tag => matchedTags.has(tag))) {
        campusRecs.push({
          ...r,
          campusName: campus.displayName // attach campus for display
        });
      }
    });
  });

  return campusRecs;
}

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

  if (!campusRecs.length) {
    outputEl.innerHTML = `
      <div class="chatItem">
        <strong>Finding the right support…</strong>
        <p class="muted">No campus or general resources found for that keyword.</p>
      </div>
    `;
    return;
  }

  // Group resources by category
  const categoryGroups = {};
  campusRecs.forEach(r => {
    (r.tags || []).forEach(tag => {
      if (!categoryGroups[tag]) categoryGroups[tag] = [];
      categoryGroups[tag].push(r);
    });
  });

  // Render grouped resources
  let html = `
    <div class="chatItem">
      <strong>Finding the right support…</strong>
      <p class="muted">Matching your situation to on-campus and general resources.</p>
    </div>
  `;

  for (const [category, resources] of Object.entries(categoryGroups)) {
    html += `<div class="card">
      <h3>${category.replace("_", " ").toUpperCase()}</h3>
      <ul class="steps">
        ${resources.map(r => `
          <li>
            <strong>${escapeHtml(r.name)}</strong> — ${escapeHtml(r.type || "Resource")}
            ${r.campusName ? `<div class="muted">Campus: ${escapeHtml(r.campusName)}</div>` : ""}
            ${r.notes ? `<div class="muted">${escapeHtml(r.notes)}</div>` : ""}
            ${Array.isArray(r.links) && r.links.length ? `<div style="margin-top:6px; display:flex; gap:10px; flex-wrap:wrap;">
              ${r.links.map(l => `<a class="link" href="${l.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)}</a>`).join("")}
            </div>` : ""}
          </li>
        `).join("")}
      </ul>
    </div>`;
  }

  outputEl.innerHTML = html;
};

window.clearInput = function clearInput() {
  const inputEl = document.getElementById("inputBox");
  if (inputEl) inputEl.value = "";
};
