/* =========================
   CAMPUS SEARCH
========================= */

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

  // Find all campuses whose displayName includes the keyword
  const matches = Object.entries(dir).filter(
    ([_, campus]) =>
      (campus.displayName || "").toLowerCase().includes(keyword)
  );

  if (!matches.length) {
    hintEl.textContent = `No schools found matching “${input.value}”.`;
    customCampusName = input.value;
    return;
  }

  // Populate dropdown with all matching campuses
  matches.forEach(([key, campus]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = campus.displayName;
    select.appendChild(option);
  });

  hintEl.textContent = `Found ${matches.length} school(s). Please select one above.`;
};

// Update campus hint when selection changes
window.renderCampusHint = function renderCampusHint() {
  const hintEl = document.getElementById("campusHint");
  if (!hintEl) return;

  const campusKey = document.getElementById("campusSelect")?.value;
  const dir = getCampusDirectory();

  if (campusKey && dir[campusKey]) {
    hintEl.textContent = `Showing on-campus options for ${dir[campusKey].displayName}.`;
  } else if (customCampusName) {
    hintEl.textContent = `No campus-specific data for “${customCampusName}”. Showing general resources.`;
  } else {
    hintEl.textContent = "Tip: selecting a campus shows on-campus offices first.";
  }
};
