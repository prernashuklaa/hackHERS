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

function buildCampusRecommendations(campusKey, text) {
  const dir = getCampusDirectory();
  if (!campusKey || !dir?.[campusKey]) return [];

  const campus = dir[campusKey];
  if (!Array.isArray(campus.resources)) return [];

  // Always return all campus resources (so links like group therapy show)
  return campus.resources.slice();
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
   RENDER RESULTS
========================= */
function renderResults(outputEl, userText, recs, campusRecs, campusKey, loc, isReopen = false) {
  const dir = getCampusDirectory();
  const campus = campusKey && dir[campusKey] ? dir[campusKey] : null;
  const campusLabel = campus ? campus.displayName : (customCampusName || "");

  const campusSection = campusRecs.length
    ? `<div class="card">
        <h3>On-campus options${campus ? ` — ${escapeHtml(campus.displayName)}` : ""}</h3>
        <ul class="steps">
          ${campusRecs.map(r => {
            const links = Array.isArray(r.links) ? r.links : [];
            return `
              <li>
                <strong>${escapeHtml(r.name)}</strong> — ${escapeHtml(r.type || "Campus resource")}
                ${r.notes ? `<div class="muted">${escapeHtml(r.notes)}</div>` : ""}
                ${links.length ? `
                  <div style="margin-top:6px; display:flex; gap:10px; flex-wrap:wrap;">
                    ${links.map(l => `
                      <a class="link" href="${l.url}" target="_blank" rel="noopener noreferrer">
                        ${escapeHtml(l.label)}
                      </a>
                    `).join("")}
                  </div>
                ` : ""}
              </li>
            `;
          }).join("")}
        </ul>
      </div>` : "";

  const offCampusCards = recs.map(r => {
    const mapsLink = buildMapsLink(r.searchQuery, loc, campusLabel);
    return `<div class="card">
      <h3>${escapeHtml(r.title)}</h3>
      <p class="why">${escapeHtml(r.why)}</p>
      <ul class="steps">${r.next.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
      <div class="actions">
        <a class="linkBtn" href="${mapsLink}" target="_blank" rel="noopener noreferrer">Search near me</a>
      </div>
    </div>`;
  }).join("");

  outputEl.innerHTML = `
    <div class="disclaimer">
      <strong>Note:</strong> Compass provides informational guidance, not medical or legal advice.
      If you feel unsafe or in immediate danger, use the Emergency tab.
    </div>

    <div class="chatItem" style="margin-top:12px;">
      <div class="meta">
        <span>${isReopen ? "Reopened chat" : "Your message"}${campusLabel ? ` • ${escapeHtml(campusLabel)}` : ""}</span>
        <span>${isReopen ? "From saved history" : "Saved to history"}</span>
      </div>
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

function buildMapsLink(query, loc, campusLabel) {
  const extra = campusLabel ? ` ${campusLabel}` : "";
  const q = encodeURIComponent(`${query}${extra} near me`);
  return loc
    ? `https://www.google.com/maps/search/?api=1&query=${q}&center=${loc.lat},${loc.lon}`
    : `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/* =========================
   LOCATION
========================= */
function getLocation() {
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation) return reject(new Error("no geolocation"));
    navigator.geolocation.getCurrentPosition(
      pos => resolve({lat: pos.coords.latitude, lon: pos.coords.longitude}),
      () => reject(new Error("denied")),
      {enableHighAccuracy:false, timeout:5000, maximumAge:600000}
    );
  });
}

/* =========================
   CHAT HISTORY
========================= */
// ... same as before; no changes needed
