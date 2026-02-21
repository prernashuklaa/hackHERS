/* =========================
   CAMPUS SEARCH
========================= */

// Get currently selected campus key
function getSelectedCampusKey() {
  const el = document.getElementById("campusSelect");
  return el ? el.value : "";
}

// Confirm search and populate matching campuses
window.confirmCampusSearch = function confirmCampusSearch() {
  const input = document.getElementById("campusSearch");
  const select = document.getElementById("campusSelect");
  const hintEl = document.getElementById("campusHint");
  const dir = getCampusDirectory();

  const keyword = (input?.value || "").trim().toLowerCase();

  // Reset dropdown (keep default option)
  select.innerHTML = `<option value="">No campus selected</option>`;
  customCampusName = "";

  if (!keyword) {
    hintEl.textContent = "Please enter a school name to search.";
    return;
  }

  const matches = Object.entries(dir).filter(
    ([_, campus]) =>
      (campus.displayName || "").toLowerCase().includes(keyword)
  );

  if (matches.length === 0) {
    hintEl.textContent = `No schools found matching “${input.value}”.`;
    customCampusName = input.value;
    return;
  }

  matches.forEach(([key, campus]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = campus.displayName;
    select.appendChild(option);
  });

  hintEl.textContent = `Found ${matches.length} school(s). Please select one above.`;
};

// Render campus hint based on selection
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
