console.log("campusSearch.js loaded");

// Keep theme/logo data separate — DO NOT overwrite CAMPUS_DIRECTORY from campuses.js
window.CAMPUS_META = window.CAMPUS_META || {
  rutgers_nb: {
    themeColor: "#cc0033",
    logo: "🛡️",
    abbr: ["nb", "rutgers", "new brunswick"],
  },
  rutgers_nk: {
    themeColor: "#cc0033",
    logo: "🧱",
    abbr: ["nk", "newark", "rutgers newark"],
  },
  nyu: {
    themeColor: "#57068c",
    logo: "🗽",
    abbr: ["nyu", "new york", "new york university"],
  },
};

window.customCampusName = window.customCampusName || "";

// Small normalizer so searching works even with — vs – vs -
function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[\u2013\u2014]/g, "-") // normalize en/em dash to hyphen
    .replace(/\s+/g, " ")
    .trim();
}

window.confirmCampusSearch = function confirmCampusSearch() {
  const input = document.getElementById("campusSearch");
  const select = document.getElementById("campusSelect");
  const hintEl = document.getElementById("campusHint");

  const dir = window.CAMPUS_DIRECTORY; // comes from campuses.js (resources live here)
  const meta = window.CAMPUS_META || {};

  if (!dir) {
    console.error("Error: CAMPUS_DIRECTORY not found. Ensure campuses.js is loaded before campusSearch.js.");
    if (hintEl) hintEl.textContent = "Error: campus database not loaded. Please refresh.";
    return;
  }
  if (!select || !hintEl) return;

  const keywordRaw = (input?.value || "").trim();
  const keyword = norm(keywordRaw);

  hintEl.classList.remove("no-results-active");

  // Reset dropdown to ALL campuses (not just matches) — optional, but safer UX:
  // If you want it to show only matches, keep it as is (we do only matches below).
  select.innerHTML = `<option value="">No campus selected</option>`;
  window.customCampusName = "";

  if (!keyword) {
    hintEl.textContent = "Please enter a school name to search.";
    return;
  }

  const entries = Object.entries(dir);

  const matches = entries.filter(([key, campus]) => {
    const displayName = norm(campus?.displayName || "");
    const keyNorm = norm(key);

    const abbr = (meta[key]?.abbr || []).map(norm);

    return (
      displayName.includes(keyword) ||
      keyNorm.includes(keyword) ||
      abbr.some((a) => a.includes(keyword) || keyword.includes(a))
    );
  });

  if (!matches.length) {
    hintEl.textContent = `No schools found matching “${keywordRaw}”.`;
    window.customCampusName = keywordRaw;

    // trigger CSS animation if you have one
    void hintEl.offsetWidth;
    hintEl.classList.add("no-results-active");
    return;
  }

  // Populate dropdown with matches (value MUST be the key)
  matches.forEach(([key, campus]) => {
    const option = document.createElement("option");
    option.value = key; // IMPORTANT: keep key, so script.js can find resources
    option.textContent = campus.displayName || key;
    select.appendChild(option);
  });

  hintEl.textContent = `Found ${matches.length} school(s). Please select one above.`;

  // Auto-select first match for convenience
  select.value = matches[0][0];
  window.renderCampusHint();
};

window.renderCampusHint = function renderCampusHint() {
  const hintEl = document.getElementById("campusHint");
  const selectEl = document.getElementById("campusSelect");
  const logoMark = document.querySelector(".logoMark");
  const body = document.body;

  if (!hintEl || !selectEl) return;

  const campusKey = (selectEl.value || "").trim();
  const dir = window.CAMPUS_DIRECTORY || {};
  const meta = window.CAMPUS_META || {};
  const campusData = dir[campusKey];
  const campusMeta = meta[campusKey];

  let mascotEl = document.getElementById("mascot-overlay");
  if (!mascotEl) {
    mascotEl = document.createElement("div");
    mascotEl.id = "mascot-overlay";
    body.appendChild(mascotEl);
  }

  if (campusKey && campusData) {
    hintEl.textContent = `Showing on-campus options for ${campusData.displayName}.`;

    if (campusMeta?.themeColor) {
      document.documentElement.style.setProperty("--primary", campusMeta.themeColor);
      document.documentElement.style.setProperty("--primary2", campusMeta.themeColor + "dd");
    }

    const icon = campusMeta?.logo || "🎓";
    if (logoMark) logoMark.textContent = icon;
    mascotEl.textContent = icon;
    mascotEl.style.opacity = "0.08";
  } else {
    document.documentElement.style.removeProperty("--primary");
    document.documentElement.style.removeProperty("--primary2");

    if (logoMark) logoMark.textContent = "🎓";
    if (mascotEl) mascotEl.style.opacity = "0";

    if (window.customCampusName) {
      hintEl.textContent = `No campus-specific data for “${window.customCampusName}”. Showing general resources.`;
    } else {
      hintEl.textContent = "Tip: selecting a campus shows on-campus offices first.";
    }
  }
};

// Enter-to-search
function wireCampusSearchEnter() {
  const input = document.getElementById("campusSearch");
  if (!input) return;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      window.confirmCampusSearch();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", wireCampusSearchEnter);
} else {
  wireCampusSearchEnter();
}
