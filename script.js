/ script.js

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

function buildCampusRecommendations(campusKey, text) {
  const dir = getCampusDirectory();
  let campusRecs = [];
  const t = (text || "").toLowerCase();

  // Map input keywords to resource tags
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

  // Determine which tags appear in user input
  const matchedTags = new Set();
  for (const [keyword, tag] of Object.entries(KEYWORD_TAG_MAP)) {
    if (t.includes(keyword)) matchedTags.add(tag);
  }

  if (campusKey && dir[campusKey]) {
    const campus = dir[campusKey];

    // Add Mental Health group offerings for Rutgers NB
    if (campusKey === "rutgers_nb" && !campus.resources.some(r => r.name === "Group Offerings")) {
      campus.resources.push({
        name: "Group Offerings",
        type: "Mental Health / Therapy",
        tags: ["mental_health"],
        notes: "Peer and therapy groups at Rutgers",
        links: [
          { label: "View group offerings", url: "https://health.rutgers.edu/counseling-services/therapy-options/group-offerings" }
        ]
      });
    }

    // Add Financial Aid link
    if (campusKey === "rutgers_nb" && !campus.resources.some(r => r.name === "Financial Aid Office")) {
      campus.resources.push({
        name: "Financial Aid Office",
        type: "Financial Support",
        tags: ["financial_support"],
        notes: "Assistance with tuition, bills, and other financial concerns",
        links: [
          { label: "Visit Financial Aid", url: "https://financialaid.rutgers.edu/" }
        ]
      });
    }

    // Add Crisis / Suicide resources
    if (campusKey === "rutgers_nb" && !campus.resources.some(r => r.name === "Crisis Hotline")) {
      campus.resources.push({
        name: "Crisis Hotline",
        type: "Crisis Support",
        tags: ["crisis"],
        notes: "24/7 support for urgent mental health needs",
        links: [
          { label: "Call 988 (US)", url: "tel:988" },
          { label: "Learn more", url: "https://988lifeline.org/" }
        ]
      });
    }

    // Filter campus resources based on matched tags
    if (Array.isArray(campus.resources)) {
      campusRecs = campus.resources.filter(r =>
        (r.tags || []).some(tag => matchedTags.has(tag))
      );
    }
  } else {
    // No campus selected → search all campuses for matching tags
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

// Categorize text
function categorize(text) {
  const t = text.toLowerCase();
  const categories = [];
  if (["suicidal","self harm","self-harm","kill myself"].some(k => t.includes(k))) categories.push("crisis");
  if (["anxious","anxiety","panic","depressed","depression","sad","hopeless","overwhelmed","stress","stressed","burnout","therapy","counseling"].some(k => t.includes(k))) categories.push("mental_health");
  if (["alone","lonely","isolated","friends","roommate","relationship","breakup","unsafe","harassed","harassment"].some(k => t.includes(k))) categories.push("social_support");
  if (!categories.length) categories.push("general_support");
  return categories;
}

// Render results
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
      <p class="muted">Matching your situation to on-campus resources.</p>
    </div>

    ${campusRecs.length ? `<div class="card">
      <h3>On-campus options${campusKey ? ` — ${escapeHtml(getCampusDirectory()[campusKey].displayName)}` : ""}</h3>
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

// Optional: clear input
window.clearInput = function clearInput() {
  const inputEl = document.getElementById("inputBox");
  if (inputEl) inputEl.value = "";
};

// Categorize text
function categorize(text) {
  const t = text.toLowerCase();
  const categories = [];
  if (["suicidal","self harm","self-harm","kill myself"].some(k => t.includes(k))) categories.push("crisis");
  if (["anxious","anxiety","panic","depressed","depression","sad","hopeless","overwhelmed","stress","stressed","burnout","therapy","counseling"].some(k => t.includes(k))) categories.push("mental_health");
  if (["alone","lonely","isolated","friends","roommate","relationship","breakup","unsafe","harassed","harassment"].some(k => t.includes(k))) categories.push("social_support");
  if (!categories.length) categories.push("general_support");
  return categories;
}

// Render results
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
      <p class="muted">Matching your situation to on-campus resources.</p>
    </div>

    ${campusRecs.length ? `<div class="card">
      <h3>On-campus options${campusKey ? ` — ${escapeHtml(getCampusDirectory()[campusKey].displayName)}` : ""}</h3>
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

// Optional: clear input
window.clearInput = function clearInput() {
  const inputEl = document.getElementById("inputBox");
  if (inputEl) inputEl.value = "";
};
