// ============================
// script.js — Compass Support (WORKING)
// - Fixes: buttons, saved chats, theme toggle
// - Adds: outside resources + location-based links
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
// THEME (Light/Dark) — persists
// ============================
const THEME_KEY = "compass_theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  // Update toggle button text/icon if present
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

// Make toggleTheme callable from onclick=""
window.toggleTheme = function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
};

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

  // Default fallback so you don’t return “nothing”
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

  // Filter base by tags (keep it relevant)
  const filteredBase = base.filter((r) =>
    (r.tags || []).some((t) => tags.has(t))
  );

  const external = [...filteredBase];

  // Location-based map searches if geo available
  if (geo?.lat && geo?.lon) {
    const lat = geo.lat;
    const lon = geo.lon;

    const mapSearches = [
      { q: "counseling services", tag: "mental_health" },
      { q: "food pantry", tag: "financial_support" },
      { q: "financial assistance", tag: "financial_support" },
      { q: "student support center", tag: "social_support" },
    ];

    mapSearches.forEach((s) => {
      if (!tags.has(s.tag)) return;
      const q = encodeURIComponent(s.q + " near me");
      external.push({
        name: `Nearby: ${s.q} (map)`,
        type: "Nearby resources",
        tags: [s.tag],
        notes: "Opens a map search based on your location.",
        links: [
          {
            label: "Open map search",
            url: `https://www.google.com/maps/search/${q}/@${lat},${lon},12z`,
          },
        ],
      });
    });
  }

  // If user typed a campus but didn’t pick a known campus, add a helpful search
  const campusLabel =
    (campusKey && getCampusDirectory()[campusKey]?.displayName) ||
    (customCampusName || "").trim();

  if (campusLabel) {
    const q1 = encodeURIComponent(`${campusLabel} counseling center`);
    const q2 = encodeURIComponent(`${campusLabel} financial aid office`);
    external.push(
      {
        name: `Search: ${campusLabel} counseling center`,
        type: "Outside resources",
        tags: ["mental_health"],
        notes: "Quick search for school counseling resources.",
        links: [{ label: "Search", url: `https://www.google.com/search?q=${q1}` }],
      },
      {
        name: `Search: ${campusLabel} financial aid office`,
        type: "Outside resources",
        tags: ["financial_support"],
        notes: "Quick search for school financial aid resources.",
        links: [{ label: "Search", url: `https://www.google.com/search?q=${q2}` }],
      }
    );
  }

  return external;
}

function getGeoIfAllowed() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 3500, maximumAge: 600000 }
    );
  });
}

// ============================
// Render resources (campus + outside)
// ============================
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
                          (l) =>
                            `<a class="link" href="${escapeHtml(
                              l.url
                            )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
                              l.label
                            )}</a>`
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

// ============================
// SAVED CHATS (localStorage)
// ============================
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

  // Click to reopen
  historyEl.querySelectorAll(".chatClickable").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-chat-id");
      const chats = loadChats();
      const chat = chats.find((x) => x.id === id);
      if (!chat) return;

      // Restore inputs
      const inputEl = document.getElementById("inputBox");
      if (inputEl) inputEl.value = chat.text || "";

      const select = document.getElementById("campusSelect");
      if (select) select.value = chat.campusKey || "";

      // Restore output exactly as saved
      const outputEl = document.getElementById("output");
      if (outputEl) outputEl.innerHTML = chat.outputHtml || "";

      // Update hint
      if (typeof window.renderCampusHint === "function") window.renderCampusHint();
    });
  });
}

// Make these callable from onclick=""
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
  const dir = getCampusDirectory();
  const campusLabel = campusKey && dir[campusKey] ? dir[campusKey].displayName : "";

  // campus-specific
  const campusRecs = buildCampusRecommendations(campusKey, text);

  // outside + location
  const geo = await getGeoIfAllowed();
  const outside = buildOutsideResources({
    text,
    campusKey,
    customCampusName: window.customCampusName || "",
    geo,
  });

  // Render output
  const header = `
    <div class="chatItem">
      <strong>Finding the right support…</strong>
      <p class="muted">Matching your situation to on-campus and outside resources.</p>
      ${
        geo
          ? `<div class="tag">Location-aware links enabled</div>`
          : `<div class="tag">Location not shared (still showing general options)</div>`
      }
    </div>
  `;

  const campusBlock = `
    <div class="card">
      <h3>Campus resources${campusLabel ? ` — ${escapeHtml(campusLabel)}` : ""}</h3>
      ${renderResourceList(campusRecs)}
    </div>
  `;

  const outsideBlock = `
    <div class="card">
      <h3>Outside resources</h3>
      ${renderResourceList(outside)}
    </div>
  `;

  const disclaimer = `
    <div class="disclaimer" style="margin-top:14px;">
      Compass is not a substitute for professional care. If you’re in immediate danger, use Emergency resources.
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
    campusLabel: campusLabel || (window.customCampusName ? `“${window.customCampusName}”` : "No campus"),
    outputHtml: html,
  });
  saveChats(chats);
  renderChatHistory();
};

// ============================
// Clear input
// ============================
window.clearInput = function clearInput() {
  const inputEl = document.getElementById("inputBox");
  const outputEl = document.getElementById("output");
  if (inputEl) inputEl.value = "";
  if (outputEl) outputEl.innerHTML = "";
};

// ============================
// Boot
// ============================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderChatHistory();
});
// ============================
// Theme toggle (FIX)
// ============================
const THEME_KEY = "compass_theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved || "light");
}

// Make it GLOBAL so onclick works
window.toggleTheme = function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
};

// Run when page loads
document.addEventListener("DOMContentLoaded", initTheme);
