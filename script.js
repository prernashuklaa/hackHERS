// script.js

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
  const words = (text || "").toLowerCase().split(/\W+/);

  // Map input words to resource tags
  const KEYWORD_TAG_MAP = {
    "lonely": "social_support",
    "drained": "mental_health",   // only one key
    "alone": "social_support",
    "friends": "social_support",
    "anxious": "mental_health",
    "anxiety": "mental_health",
    "depressed": "mental_health",
    "stress": "mental_health",
    "stressed": "mental_health",
    "therapy": "mental_health",
    "overwhelmed": "mental_health",
    "panic": "mental_health",
    "burnout": "mental_health"
  };

  const matchedTags = words.map(w => KEYWORD_TAG_MAP[w]).filter(Boolean);

  if (campusKey && dir[campusKey]) {
    const campus = dir[campusKey];

    // Add the group offering under Rutgers NB mental health
    if (campusKey === "rutgers_nb") {
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

    if (Array.isArray(campus.resources)) {
      campusRecs = campus.resources.filter(r =>
        r.tags.some(tag => matchedTags.includes(tag))
      );
    }
  } else {
    // No campus selected → show general matching resources
    Object.values(dir).forEach(campus => {
      if (Array.isArray(campus.resources)) {
        campus.resources.forEach(r => {
          if ((r.tags || []).some(tag => matchedTags.includes(tag))) campusRecs.push(r);
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
