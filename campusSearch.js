console.log("campusSearch.js loaded");

window.customCampusName = window.customCampusName || "";

window.confirmCampusSearch = function confirmCampusSearch() {
  const input = document.getElementById("campusSearch");
  const select = document.getElementById("campusSelect");
  const hintEl = document.getElementById("campusHint");
  const dir = window.CAMPUS_DIRECTORY || {};

  if (!select || !hintEl) return;

  const keyword = (input?.value || "").trim().toLowerCase();

  // Reset dropdown
  select.innerHTML = `<option value="">No campus selected</option>`;
  window.customCampusName = "";

  if (!keyword) {
    hintEl.textContent = "Please enter a school name to search.";
    return;
  }

  const matches = Object.entries(dir).filter(
    ([_, campus]) => (campus.displayName || "").toLowerCase().includes(keyword)
  );

  if (!matches.length) {
    hintEl.textContent = `No schools found matching “${input.value}”.`;
    window.customCampusName = input.value;
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

window.renderCampusHint = function renderCampusHint() {
  const hintEl = document.getElementById("campusHint");
  if (!hintEl) return;

  const campusKey = document.getElementById("campusSelect")?.value;
  const dir = window.CAMPUS_DIRECTORY || {};

  if (campusKey && dir[campusKey]) {
    hintEl.textContent = `Showing on-campus options for ${dir[campusKey].displayName}.`;
  } else if (window.customCampusName) {
    hintEl.textContent = `No campus-specific data for “${window.customCampusName}”. Showing general resources.`;
  } else {
    hintEl.textContent = "Tip: selecting a campus shows on-campus offices first.";
  }
};
