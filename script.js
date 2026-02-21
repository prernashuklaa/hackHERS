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
  const matchedTags = new Set();

  // Determine which tags match user input
  for (const [keyword, tag] of Object.entries(KEYWORD_TAG_MAP)) {
    if (t.includes(keyword)) matchedTags.add(tag);
  }

  let campusRecs = [];

  if (campusKey && dir[campusKey]) {
    const campus = dir[campusKey];
    if (Array.isArray(campus.resources)) {
      campus.resources.forEach(r => {
        if ((r.tags || []).some(tag => matchedTags.has(tag))) campusRecs.push(r);
      });
    }
  } else {
    // No campus selected → search all campuses
    Object.values(dir).forEach(campus => {
      if (Array.isArray(campus.resources)) {
        campus.resources.forEach(r => {
          if ((r.tags || []).some(tag => matchedTags.has(tag))) campusRecs.push(r);
        });
      }
    });
  }

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

  outputEl.innerHTML = `
    <div class="chatItem">
      <strong>Finding the right support…</strong>
      <p class="muted">Matching your situation to on-campus and nearby resources.</p>
    </div>

    ${campusRecs.length ? `<div class="card">
      <h3>Resources${campusKey ? ` — ${escapeHtml(getCampusDirectory()[campusKey].displayName)}` : ""}</h3>
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

window.clearInput = function clearInput() {
  const inputEl = document.getElementById("inputBox");
  if (inputEl) inputEl.value = "";
};
