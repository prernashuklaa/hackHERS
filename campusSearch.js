console.log("campusSearch.js loaded");

window.customCampusName = window.customCampusName || "";

window.confirmCampusSearch = function confirmCampusSearch() {
  const input = document.getElementById("campusSearch");
  const select = document.getElementById("campusSelect");
  const hintEl = document.getElementById("campusHint");
  if (!window.CAMPUS_DIRECTORY) {
    console.error("Error: CAMPUS_DIRECTORY not found. Ensure campuses.js is loaded before this script.");
    if (hintEl) hintEl.textContent = "Error: Database not loaded. Please refresh.";
    return;
  }
  
  const dir = window.CAMPUS_DIRECTORY;
  
  if (!dir || !select || !hintEl) return;

  const keyword = (input?.value || "").trim().toLowerCase();

  hintEl.classList.remove("no-results-active");
  // Reset dropdown
  select.innerHTML = `<option value="">No campus selected</option>`;
  window.customCampusName = "";

  hintEl.classList.remove("no-results-active");
  if (!keyword) {
    hintEl.textContent = "Please enter a school name to search.";
    return;
  }

  const matches = Object.entries(dir).filter(([key, campus]) => {
    const name = (campus.displayName || "").toLowerCase();
    const searchKey = key.toLowerCase();
    return name.includes(keyword) || searchKey.includes(keyword);
});
  
  if (!matches.length) {
    hintEl.textContent = `No schools found matching “${input.value}”.`;
    window.customCampusName = input.value;

    void hintEl.offsetWidth; 
    hintEl.classList.add("no-results-active");
    return;
  }

  matches.forEach(([key, campus]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = campus.displayName;
    select.appendChild(option);
  });

  hintEl.textContent = `Found ${matches.length} school(s). Please select one above.`;
  
  if (matches.length > 0) {
    select.value = matches[0][0]; 
    window.renderCampusHint();    
  }
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
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("campusSearch");
    if (searchInput) {
        searchInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                window.confirmCampusSearch();
            }
        });
    }
});
