// ============================
// script.js — Compass Support
// - Buttons work
// - Saved chats clickable
// - Theme toggle works + persists
// - On-campus resources via tags
// - Outside resources via Google Maps "near me" by category
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

// ---------- Keyword map (keeps your originals + expanded) ----------
const KEYWORD_TAG_MAP = {
  // --- YOUR ORIGINALS (kept) ---
  lonely: "social_support",
  alone: "social_support",
  friends: "social_support",
  isolated: "social_support",
  roommate: "social_support",
  relationship: "social_support",
  breakup: "social_support",
  harassed: "social_support",

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
  food: "financial_support",
  groceries: "financial_support",
  job: "financial_support",
  debt: "financial_support",
  finance: "financial_support",
  financial: "financial_support",

  suicidal: "crisis",
  "self harm": "crisis",
  "self-harm": "crisis",
  "kill myself": "crisis",

  // --- Academic ---
  "bad in school": "academic_support",
  failing: "academic_support",
  failed: "academic_support",
  grades: "academic_support",
  grade: "academic_support",
  gpa: "academic_support",
  homework: "academic_support",
  assignment: "academic_support",
  exam: "academic_support",
  test: "academic_support",
  midterm: "academic_support",
  final: "academic_support",
  study: "academic_support",
  studying: "academic_support",
  "can't focus": "academic_support",
  "cant focus": "academic_support",
  procrastinating: "academic_support",
  procrastination: "academic_support",
  "time management": "academic_support",
  tutor: "academic_support",
  tutoring: "academic_support",
  "writing help": "academic_support",
  "math help": "academic_support",
  "office hours": "academic_support",
  advising: "academic_support",
  advisor: "academic_support",
  "academic advisor": "academic_support",

  // --- Career ---
  internship: "career_support",
  resume: "career_support",
  "cover letter": "career_support",
  linkedin: "career_support",
  interview: "career_support",
  networking: "career_support",
  "career fair": "career_support",
  "job search": "career_support",

  // --- Health / medical ---
  sick: "health_support",
  illness: "health_support",
  doctor: "health_support",
  clinic: "health_support",
  "urgent care": "health_support",
  medical: "health_support",
  injury: "health_support",
  hurt: "health_support",
  medication: "health_support",

  // --- Housing ---
  housing: "housing_support",
  dorm: "housing_support",
  landlord: "housing_support",
  eviction: "housing_support",
  lease: "housing_support",
  homeless: "housing_support",
};

// Match multiple tags
function getMatchedTags(text) {
  const t = (text || "").toLowerCase();
  const matched = new Set();

  for (const [keyword, tag] of Object.entries(KEYWORD_TAG_MAP)) {
    if (t.includes(keyword)) matched.add(tag);
  }

  // Student-first fallback
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

  const TAG_TO_MAP_QUERY = {
    academic_support: "tutoring center near me Kumon Sylvan learning center",
    financial_support: "financial assistance near me food pantry near me",
    mental_health: "counseling services near me therapy",
    social_support: "student support group near me peer support",
    health_support: "urgent care near me clinic near me",
    housing_support: "housing assistance near me tenant help",
    career_support: "career coaching near me resume help interview prep",
    crisis: "crisis center near me",
  };

  const dir = getCampusDirectory();
  const campusLabel =
    (campusKey && dir[campusKey]?.displayName) ||
    (customCampusName || "").trim();

  const makeMapsUrl = (query) => {
    const finalQuery = campusLabel ? `${query} near ${campusLabel}` : query;
    const q = encodeURIComponent(finalQuery);
    return geo?.lat && geo?.lon
      ? `https://www.google.com/maps/search/${q}/@${geo.lat},${geo.lon},13z`
      : `https://www.google.com/maps/search/${q}`;
  };

  // Keep it clean: show up to 2 most relevant map links
  const picked = Array.from(tags).slice(0, 2);

  return picked.map((tag) => {
    const query = TAG_TO_MAP_QUERY[tag] || "student support services near me";
    return {
      name: `Nearby help: ${tag.replaceAll("_", " ")}`,
      type: "Google Maps",
      notes: "Opens nearby options based on what you typed.",
      links: [{ label: "Open map results", url: makeMapsUrl(query) }],
    };
  });
}

// ---------- Rendering ----------
function renderResourceList(resources) {
  if (!resources.length) return `<p class="muted">No matching resources found.</p>`;

  return `
    <ul class="steps">
      ${resources.map((r) => {
        const links = Array.isArray(r.links) ? r.links : [];
        return `
          <li>
            <strong>${escapeHtml(r.name || "")}</strong>
            ${r.type ? ` — ${escapeHtml(r.type)}` : ""}
            ${r.notes ? `<div class="muted">${escapeHtml(r.notes)}</div>` : ""}
            ${links.length ? `
              <div style="margin-top:6px; display:flex; gap:10px; flex-wrap:wrap;">
                ${links.map((l) => `
                  <a class="link" href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">
                    ${escapeHtml(l.label)}
                  </a>
                `).join("")}
              </div>` : ""}
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

// ---------- Saved chats ----------
const CHAT_KEY = "compass_chat_history_v1";

function loadChats() {
  try { return JSON.parse(localStorage.getItem(CHAT_KEY) || "[]"); }
  catch { return []; }
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
    ? chats.filter((c) =>
        (c.title || "").toLowerCase().includes(q) ||
        (c.text || "").toLowerCase().includes(q) ||
        (c.campusLabel || "").toLowerCase().includes(q)
      )
    : chats;

  if (!filtered.length) {
    historyEl.innerHTML = `<p class="muted">No saved chats yet.</p>`;
    return;
  }

  historyEl.innerHTML = filtered.map((c) => `
    <div class="chatItem chatClickable" data-chat-id="${escapeHtml(c.id)}">
      <div class="meta">
        <span>${escapeHtml(c.campusLabel || "No campus")}</span>
        <span>${escapeHtml(c.time || "")}</span>
      </div>
      <div style="margin-top:6px;"><strong>${escapeHtml(c.title || "")}</strong></div>
      <div class="muted" style="margin-top:4px;">Click to reopen</div>
    </div>
  `).join("");

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
  const blob = new Blob([JSON.stringify(chats, null, 2)], { type: "application/json" });
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
  const dir = getCampusDirectory();
  const campusLabel = campusKey && dir[campusKey] ? dir[campusKey].displayName : "";

  const campusRecs = buildCampusRecommendations(campusKey, text);

  // triggers browser prompt IF served via http(s)
  const geo = await getGeoIfAllowed();

  const outside = buildOutsideResources({
    text,
    campusKey,
    customCampusName: window.customCampusName || "",
    geo
  });

  const header = `
    <div class="chatItem">
      <strong>Finding the right support…</strong>
      <p class="muted">Campus links + nearby options based on what you typed.</p>
      ${geo ? `<div class="tag">Location enabled</div>` : `<div class="tag">Location not shared</div>`}
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
      <h3>Nearby resources (off-campus)</h3>
      ${renderResourceList(outside)}
    </div>
  `;

  const disclaimer = `
    <div class="disclaimer" style="margin-top:14px;">
      For emergencies, use the Emergency tab. This tool provides guidance and links.
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
    outputHtml: html
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
