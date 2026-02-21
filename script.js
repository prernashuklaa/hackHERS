// ============================
// script.js — Compass Support (UPDATED FOR FINANCE)
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
  lonely: "social_support",
  alone: "social_support",
  friends: "social_support",
  isolated: "social_support",
  roommate: "social_support",
  relationship: "social_support",
  breakup: "social_support",
  harassed: "social_support",

  // Safety / urgent
  unsafe: "crisis",
  assaulted: "crisis",

  // Mental health
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

  // Financial
  money: "financial_support",
  rent: "financial_support",
  bills: "financial_support",
  tuition: "financial_support",
  food: "financial_support",
  groceries: "financial_support",
  job: "financial_support",
  debt: "financial_support",
  finance: "financial_support",
  financial: "financial_support",

  // Crisis / suicidal
  suicidal: "crisis",
  "self harm": "crisis",
  "self-harm": "crisis",
  "kill myself": "crisis",
};

// ============================
// Tag matching
// ============================
function getMatchedTags(text) {
  const t = (text || "").toLowerCase();
  const matched = new Set();

  for (const [keyword, tag] of Object.entries(KEYWORD_TAG_MAP)) {
    if (t.includes(keyword)) matched.add(tag);
  }

  // Default fallback
  if (matched.size === 0) matched.add("mental_health");

  return matched;
}

// ============================
// Campus recommendations
// ============================
function buildCampusRecommendations(campusKey, text) {
  const dir = getCampusDirectory();
  const matchedTags = getMatchedTags(text);
  const campusRecs = [];

  Object.entries(dir).forEach(([key, campus]) => {
    if (campusKey && key !== campusKey) return;

    // Ensure financial support resources exist
    if (
      matchedTags.has("financial_support") &&
      campusKey === key &&
      Array.isArray(campus.resources) &&
      !campus.resources.some((r) => r.tags.includes("financial_support"))
    ) {
      campus.resources.push({
        name: "Financial Aid Office",
        type: "Financial Support",
        tags: ["financial_support"],
        notes: "Assistance with tuition, bills, and other financial concerns",
        links: [
          { label: "Visit Financial Aid", url: "https://financialaid.rutgers.edu/" },
        ],
      });
    }

    if (Array.isArray(campus.resources)) {
      campus.resources.forEach((resource) => {
        if ((resource.tags || []).some((tag) => matchedTags.has(tag))) {
          campusRecs.push(resource);
        }
      });
    }
  });

  return campusRecs;
}

// ============================
// Outside resources + location-based
// ============================
function buildOutsideResources({ text, campusKey, customCampusName, geo }) {
  const tags = getMatchedTags(text);

  const base = [
    // Crisis / mental health
    {
      name: "988 Suicide & Crisis Lifeline",
      type: "Crisis Support",
      tags: ["crisis", "mental_health"],
      notes: "24/7 support (call/text/chat).",
      links: [
        { label: "Call 988", url: "tel:988" },
        { label: "Text 988", url: "sms:988" },
        { label: "988 Website", url: "https://988lifeline.org/" },
      ],
    },
    {
      name: "Crisis Text Line",
      type: "Crisis Support",
      tags: ["crisis", "mental_health"],
      notes: "Text HOME to 741741 (US).",
      links: [{ label: "Text HOME to 741741", url: "sms:741741?body=HOME" }],
    },
    // Financial support
    {
      name: "211 (Local help by area)",
      type: "General Support",
      tags: ["financial_support", "mental_health", "social_support", "crisis"],
      notes: "Helps find local services: housing, food, bills, healthcare.",
      links: [{ label: "Open 211", url: "https://www.211.org/" }],
    },
    {
      name: "FindHelp (ZIP-based resource search)",
      type: "General Support",
      tags: ["financial_support", "mental_health", "social_support"],
      notes: "Search free/reduced-cost resources by ZIP code.",
      links: [{ label: "Open FindHelp", url: "https://www.findhelp.org/" }],
    },
  ];

  // Filter by relevant tags
  return base.filter((r) => (r.tags || []).some((t) => tags.has(t)));
}

// ============================
// Render resource list
// ============================
function renderResourceList(resources) {
  if (!resources.length) return `<p class="muted">No matching resources found.</p>`;
  return `
    <ul class="steps">
      ${resources
        .map(
          (r) => `<li>
            <strong>${escapeHtml(r.name)}</strong>
            ${r.type ? ` — ${escapeHtml(r.type)}` : ""}
            ${r.notes ? `<div class="muted">${escapeHtml(r.notes)}</div>` : ""}
            ${
              Array.isArray(r.links) && r.links.length
                ? `<div style="margin-top:6px; display:flex; gap:10px; flex-wrap:wrap;">
                  ${r.links
                    .map(
                      (l) => `<a class="link" href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
                        l.label
                      )}</a>`
                    )
                    .join("")}
                </div>`
                : ""
            }
          </li>`
        )
        .join("")}
    </ul>
  `;
}

// ============================
// Analyze + render output
// ============================
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
  const campusLabel = campusKey && getCampusDirectory()[campusKey]?.displayName;

  const campusRecs = buildCampusRecommendations(campusKey, text);
  const outsideRecs = buildOutsideResources({
    text,
    campusKey,
    customCampusName: window.customCampusName || "",
    geo: await getGeoIfAllowed(),
  });

  outputEl.innerHTML = `
    <div class="chatItem">
      <strong>Finding the right support…</strong>
      <p class="muted">Matching your situation to on-campus and outside resources.</p>
    </div>
    <div class="card">
      <h3>Campus resources${campusLabel ? ` — ${escapeHtml(campusLabel)}` : ""}</h3>
      ${renderResourceList(campusRecs)}
    </div>
    <div class="card">
      <h3>Outside resources</h3>
      ${renderResourceList(outsideRecs)}
    </div>
    <div class="disclaimer" style="margin-top:14px;">
      Compass is not a substitute for professional care. If you’re in immediate danger, use Emergency resources.
    </div>
  `;
};
