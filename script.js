// script.js
// Compass - theme + chat logic (safe on every page)

let selectedCampusKey = "";
let customCampusName = null;

const STORAGE_KEY = "compass_chats_v2";
const THEME_KEY = "compass_theme_v1";

// Safe global access: campuses.js should define window.CAMPUS_DIRECTORY
function getCampusDirectory() {
  return window.CAMPUS_DIRECTORY || null;
}

/* =========================
   THEME (Light/Dark)
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
  if (stored === "dark" || stored === "light") return stored;

  // If nothing saved, default to light
  return "light";
}

// Make toggleTheme global so onclick="toggleTheme()" always works
window.toggleTheme = function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
};

// Initialize theme ASAP after DOM ready
window.addEventListener("DOMContentLoaded", () => {
  applyTheme(getSavedTheme());
});

/* =========================
   PAGE-SAFE BOOTSTRAP
   ========================= */

window.addEventListener("load", () => {
  // If index.html has these, run them; if not, do nothing.
  if (document.getElementById("campusSelect")) {
    renderCampusHint();
  }
  if (document.getElementById("history")) {
    renderChatHistory();
  }
});

/* =========================
   INPUT HELPERS
   ========================= */

window.clearInput = function clearInput() {
  const input = document.getElementById("inputBox");
  if (input) input.value = "";
};

/* =========================
   CAMPUS HELPERS (index page only)
   ========================= */

let customCampusName = "";

function getSelectedCampusKey() {
  const el = document.getElementById("campusSelect");
  return el ? el.value : "";
}

// Make it global because index.html calls it from oninput=""
window.handleCampusSearch = function handleCampusSearch() {
  const input = document.getElementById("campusSearch");
  const val = (input?.value || "").trim();

  const select = document.getElementById("campusSelect");
  const dir = getCampusDirectory();

  // If search is cleared, reset state
  if (!val) {
    customCampusName = "";
    renderCampusHint();
    return;
  }

  const normalized = val.toLowerCase();

  // Try to match a known campus
  const matchedKey = Object.keys(dir || {}).find((key) =>
    dir[key].displayName.toLowerCase().includes(normalized)
  );

  if (matchedKey) {
    // Found a campus in the directory → switch to dropdown behavior
    if (select) select.value = matchedKey;
    customCampusName = "";
  } else {
    // Not found → use custom campus name
    if (select) select.value = "";
    customCampusName = val;
  }

  renderCampusHint();
};

// Make it global because index.html calls it from onchange=""
window.renderCampusHint = function renderCampusHint() {
  const hintEl = document.getElementById("campusHint");
  if (!hintEl) return;

  const campusKey = getSelectedCampusKey();
  const dir = getCampusDirectory();

  // Case 1: dropdown / matched campus
  if (campusKey && dir?.[campusKey]) {
    hintEl.textContent =
      `Showing on-campus options for ${dir[campusKey].displayName}.`;
    return;
  }

  // Case 2: custom campus (not in list)
  if (customCampusName) {
    hintEl.textContent =
      `We don’t have campus-specific data for “${customCampusName}”. Showing general student support resources instead.`;
    return;
  }

  // Case 3: default
  hintEl.textContent =
    "Tip: selecting a campus shows on-campus offices first.";
};

function buildCampusRecommendations(campusKey, categories) {
  const dir = getCampusDirectory();
  if (!campusKey || !dir?.[campusKey]) return [];

  const campus = dir[campusKey];
  if (!Array.isArray(campus.resources)) return [];

  const hits = campus.resources.filter((r) =>
    (r.tags || []).some((tag) => categories.includes(tag))
  );

  if (hits.length === 0) return campus.resources.slice(0, 2);
  return hits.slice(0, 4);
}

/* =========================
   ANALYZE (index page only)
   ========================= */

window.analyze = function analyze() {
  const inputEl = document.getElementById("inputBox");
  const outputEl = document.getElementById("output");
  if (!inputEl || !outputEl) return; // safe on emergency.html

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
  const campusRecs = buildCampusRecommendations(campusKey, categories);

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
   CHAT STORAGE (index page only)
   ========================= */

function loadChats() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveChats(chats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

function saveChat(userText, categories, recs, campusKey, customName) {
  const chats = loadChats();
  const now = new Date();
  const summary = recs?.[0]?.title ? recs[0].title : "Support recommendations";

  chats.unshift({
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: now.toISOString(),
    userText,
    categories,
    summary,
    campusKey: campusKey || "",
    customCampusName: customName || "",
    recs: recs || []
  });

  if (chats.length > 30) chats.length = 30;
  saveChats(chats);
}

// Make openChat global (onclick in rendered HTML)
window.openChat = function openChat(chatId) {
  const chats = loadChats();
  const chat = chats.find((c) => c.id === chatId);
  if (!chat) return;

  // Restore campus selection and custom campus search
  const campusSelect = document.getElementById("campusSelect");
  if (campusSelect) campusSelect.value = chat.campusKey || "";

  const campusSearch = document.getElementById("campusSearch");
  customCampusName = chat.customCampusName || "";
  if (campusSearch) campusSearch.value = customCampusName;

  renderCampusHint();

  // Restore input
  const inputEl = document.getElementById("inputBox");
  if (inputEl) inputEl.value = chat.userText || "";

  const outputEl = document.getElementById("output");
  if (!outputEl) return;

  const categories = chat.categories || categorize(chat.userText || "");
  const recs = Array.isArray(chat.recs) && chat.recs.length
    ? chat.recs
    : buildRecommendations(categories);

  const campusRecs = buildCampusRecommendations(chat.campusKey || "", categories);

  getLocation()
    .then((loc) =>
      renderResults(outputEl, chat.userText || "", recs, campusRecs, chat.campusKey || "", loc, true)
    )
    .catch(() =>
      renderResults(outputEl, chat.userText || "", recs, campusRecs, chat.campusKey || "", null, true)
    );

  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.renderChatHistory = function renderChatHistory() {
  const historyEl = document.getElementById("history");
  if (!historyEl) return;

  const q = (document.getElementById("searchBox")?.value || "").trim().toLowerCase();
  const chats = loadChats();
  const dir = getCampusDirectory();

  const filtered = chats.filter((c) => {
    const campusName = c.campusKey && dir?.[c.campusKey]
      ? dir[c.campusKey].displayName
      : (c.customCampusName || "");

    const blob = `${c.userText} ${c.summary} ${(c.categories || []).join(" ")} ${campusName}`.toLowerCase();
    return !q || blob.includes(q);
  });

  if (filtered.length === 0) {
    historyEl.innerHTML = `<p class="muted">No chats yet. Try getting guidance on the left.</p>`;
    return;
  }

  historyEl.innerHTML = filtered
    .map((c) => {
      const dt = new Date(c.createdAt);

      const campusLabel =
        (c.campusKey && dir?.[c.campusKey])
          ? ` • ${dir[c.campusKey].displayName}`
          : (c.customCampusName ? ` • ${c.customCampusName}` : "");

      return `
        <div class="chatItem chatClickable" onclick="openChat('${escapeAttr(c.id)}')">
          <div class="meta">
            <span>${escapeHtml(dt.toLocaleString())}${escapeHtml(campusLabel)}</span>
            <span>${escapeHtml(c.summary)}</span>
          </div>
          <p class="chatPreview">“${escapeHtml(c.userText)}”</p>
          <div>
            ${(c.categories || []).map((t) => `<span class="tag">${escapeHtml(prettyTag(t))}</span>`).join("")}
          </div>
        </div>
      `;
    })
    .join("");
};

window.deleteAllChats = function deleteAllChats() {
  if (!confirm("Delete all saved chats from this browser?")) return;
  localStorage.removeItem(STORAGE_KEY);
  renderChatHistory();
};

window.exportChats = function exportChats() {
  const chats = loadChats();
  const blob = new Blob([JSON.stringify(chats, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "compass_chats.json";
  a.click();
  URL.revokeObjectURL(url);
};

function prettyTag(key) {
  const map = {
    crisis: "Urgent",
    mental_health: "Mental health",
    focus_support: "Focus",
    academic_support: "Academics",
    financial_support: "Financial",
    social_support: "Social",
    general_support: "General"
  };
  return map[key] || key;
}

/* =========================
   MATCHING LOGIC
   ========================= */

function categorize(text) {
  const t = text.toLowerCase();
  const categories = [];

  if (hasAny(t, ["suicidal", "self harm", "self-harm", "kill myself"])) categories.push("crisis");

  if (hasAny(t, ["anxious","anxiety","panic","depressed","depression","sad","hopeless","overwhelmed","stress","stressed","burnout","therapy","counseling"])) {
    categories.push("mental_health");
  }

  if (hasAny(t, ["focus","distract","distraction","procrast","motivation","can't start","cant start","stuck","doomscroll","tiktok","instagram","social media","phone"])) {
    categories.push("focus_support");
  }

  if (hasAny(t, ["grade","grades","class","classes","exam","midterm","final","assignment","deadline","homework","study","studying","falling behind","behind","gpa"])) {
    categories.push("academic_support");
  }

  if (hasAny(t, ["money","rent","tuition","bills","financial","food","hungry","groceries","job","debt"])) {
    categories.push("financial_support");
  }

  if (hasAny(t, ["alone","lonely","isolated","friends","roommate","relationship","breakup","unsafe","harassed","harassment"])) {
    categories.push("social_support");
  }

  if (categories.length === 0) categories.push("general_support");
  return Array.from(new Set(categories));
}

function buildRecommendations(categories) {
  const library = {
    crisis: {
      title: "Urgent / Crisis Support",
      why: "If you might harm yourself or feel unsafe, real-time help matters most.",
      next: [
        "If you’re in the U.S., call or text 988 (Suicide & Crisis Lifeline).",
        "If you’re in immediate danger, call local emergency services.",
        "If you’re on campus, contact campus security or an RA/Dean on call."
      ],
      searchQuery: "crisis hotline"
    },
    mental_health: {
      title: "Counseling / Mental Health Support",
      why: "Your message suggests high stress or emotional strain — support can help.",
      next: [
        "Look for campus counseling or community mental health centers.",
        "If cost is a concern, search for sliding-scale therapy.",
        "If you prefer privacy, look for telehealth options."
      ],
      searchQuery: "counseling services"
    },
    focus_support: {
      title: "Focus & Executive Function Support",
      why: "This sounds like attention drift or procrastination — supports exist beyond “try harder.”",
      next: [
        "Look for academic coaching or learning specialist support.",
        "Try structured study spaces (library, tutoring center).",
        "Use accountability: a friend or study group check-in."
      ],
      searchQuery: "academic coaching"
    },
    academic_support: {
      title: "Academic Support (Tutoring / Advising)",
      why: "This sounds like deadlines, grades, or coursework pressure — help can reduce the load fast.",
      next: [
        "Find a tutoring/learning center for your subject.",
        "Meet with an academic advisor to triage deadlines.",
        "Ask a TA/professor for the minimum path forward."
      ],
      searchQuery: "tutoring center"
    },
    financial_support: {
      title: "Financial / Basic Needs Support",
      why: "Money stress can overwhelm everything — there are often quick resources available.",
      next: [
        "Search for campus emergency funds and assistance programs.",
        "Look for food pantries (campus or community).",
        "Check financial aid office options (appeals, short-term aid)."
      ],
      searchQuery: "student emergency financial assistance"
    },
    social_support: {
      title: "Social Support & Community",
      why: "Feeling isolated can make school much harder — support networks help you stabilize.",
      next: [
        "Look for peer support groups and student organizations.",
        "Try low-pressure events (go for 15 minutes, then leave).",
        "If safety is involved, contact campus resources."
      ],
      searchQuery: "student support groups"
    },
    general_support: {
      title: "Start Here (Student Support Services)",
      why: "A general student support office can route you to the right place.",
      next: [
        "Search for “student support services” or “student care team”.",
        "If academics are involved, start with advising/tutoring.",
        "If emotions are involved, start with counseling."
      ],
      searchQuery: "student support services"
    }
  };

  const ordered = [...categories].sort((a, b) => (a === "crisis" ? -1 : b === "crisis" ? 1 : 0));
  return ordered.map((k) => library[k]).filter(Boolean).slice(0, 4);
}

/* =========================
   LOCATION + RENDERING
   ========================= */

function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("no geolocation"));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => reject(new Error("denied")),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
    );
  });
}

function renderResults(outputEl, userText, recs, campusRecs, campusKey, loc, isReopen = false) {
  const dir = getCampusDirectory();
  const campus = campusKey && dir?.[campusKey] ? dir[campusKey] : null;
  const campusLabel = campus ? campus.displayName : (customCampusName || "");

  const campusSection = (campusRecs && campusRecs.length > 0)
    ? `
      <div class="card">
        <h3>On-campus options${campus ? ` — ${escapeHtml(campus.displayName)}` : ""}</h3>
        <ul class="steps">
          ${campusRecs.map(r => {
            const links = Array.isArray(r.links) ? r.links : (r.url ? [{ label: "Open site", url: r.url }] : []);
            return `
              <li>
                <strong>${escapeHtml(r.name)}</strong> — ${escapeHtml(r.type || "Campus resource")}
                ${r.notes ? `<div class="muted">${escapeHtml(r.notes)}</div>` : ""}
                ${links.length ? `
                  <div style="margin-top:6px; display:flex; gap:10px; flex-wrap:wrap;">
                    ${links.map(l => `
                      <a class="link" href="${l.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)}</a>
                    `).join("")}
                  </div>
                ` : ""}
              </li>
            `;
          }).join("")}
        </ul>
      </div>
    `
    : "";

  const offCampusCards = recs.map((r) => {
    const mapsLink = buildMapsLink(r.searchQuery, loc, campusLabel);
    return `
      <div class="card">
        <h3>${escapeHtml(r.title)}</h3>
        <p class="why">${escapeHtml(r.why)}</p>
        <ul class="steps">${r.next.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
        <div class="actions">
          <a class="linkBtn" href="${mapsLink}" target="_blank" rel="noopener noreferrer">
            Search near me
          </a>
        </div>
      </div>
    `;
  }).join("");

  outputEl.innerHTML = `
    <div class="disclaimer">
      <strong>Note:</strong> Compass provides informational guidance, not medical or legal advice.
      If you feel unsafe or in immediate danger, seek urgent help right away.
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

  if (loc) return `https://www.google.com/maps/search/?api=1&query=${q}&center=${loc.lat},${loc.lon}`;
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/* =========================
   UTILS
   ========================= */

function hasAny(text, keywords) {
  return keywords.some((k) => text.includes(k));
}

function escapeAttr(str) {
  return String(str).replaceAll("'", "\\'");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
