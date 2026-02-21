console.log("campusSearch.js loaded");

window.CAMPUS_DIRECTORY = {
  "rutgers_nb": {
    displayName: "Rutgers University – New Brunswick",
    themeColor: "#cc0033", 
    logo: "🛡️", 
    bgImage: "url('https://path-to-your-rutgers-shield.png')", 
  },
  "nyu": {
    displayName: "New York University",
    themeColor: "#57068c", 
    logo: "🗽", 
    bgImage: "url('https://path-to-your-nyu-logo.png')",
  }
};


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
  const selectEl = document.getElementById("campusSelect");
  const logoMark = document.querySelector(".logoMark"); // 获取 LOGO 图标位置
  const body = document.body;

  if (!hintEl || !selectEl) return;

  const campusKey = selectEl.value;
  const dir = window.CAMPUS_DIRECTORY || {};
  const campusData = dir[campusKey];

  let mascotEl = document.getElementById("mascot-overlay");
  if (!mascotEl) {
    mascotEl = document.createElement("div");
    mascotEl.id = "mascot-overlay";
    body.appendChild(mascotEl);
  }

  if (campusKey && campusData) {
    hintEl.textContent = `Showing on-campus options for ${campusData.displayName}.`;
    
    document.documentElement.style.setProperty('--primary', campusData.themeColor);
    document.documentElement.style.setProperty('--primary2', campusData.themeColor + "dd"); 
    
    if (logoMark) logoMark.textContent = campusData.logo; 
    mascotEl.textContent = campusData.logo;
    mascotEl.style.opacity = "0.08"; 

  } else {
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--primary2');
    if (logoMark) logoMark.textContent = "🎓";
    if (mascotEl) mascotEl.style.opacity = "0";

    if (window.customCampusName) {
      hintEl.textContent = `No campus-specific data for “${window.customCampusName}”. Showing general resources.`;
    } else {
      hintEl.textContent = "Tip: selecting a campus shows on-campus offices first.";
    }
  }
};

