// Compass - script.js
// Front-end MVP: problem -> recommended resource types + local search links

function analyze() {
  const inputEl = document.getElementById("inputBox");
  const outputEl = document.getElementById("output");

  const text = (inputEl.value || "").trim();
  if (!text) {
    outputEl.innerHTML = `
      <div class="card">
        <h3>Please type what’s going on</h3>
        <p>Example: “I’m overwhelmed with classes and I can’t focus.”</p>
      </div>
    `;
    return;
  }

  // Show a quick loading state (feels polished)
  outputEl.innerHTML = `
    <div class="card">
      <h3>Finding the right support…</h3>
      <p>Reading your message and matching you to the best next steps.</p>
    </div>
  `;

  // Basic categorization based on keywords (fast + reliable for a hackathon)
  const matches = categorize(text);

  // Pick top recommendations (dedupe + prioritize)
  const recs = buildRecommendations(matches);

  // Try to grab user location (optional). If blocked, we still show generic “Search near me”.
  getLocation()
    .then((loc) => renderResults(outputEl, text, recs, loc))
    .catch(() => renderResults(outputEl, text, recs, null));
}

/** Categorize text into need areas using lightweight keyword matching */
function categorize(text) {
  const t = text.toLowerCase();

  const categories = [];

  // mental health / emotional support
  if (hasAny(t, [
    "anxious", "anxiety", "panic", "depressed", "depression", "sad", "cry",
    "hopeless", "overwhelmed", "stress", "stressed", "burnout", "burned out",
    "can't cope", "cant cope", "mentally", "therapy", "counseling", "counsell",
    "suicidal", "self harm", "self-harm"
  ])) categories.push("mental_health");

  // focus / motivation / procrastination
  if (hasAny(t, [
    "focus", "distract", "distraction", "procrast", "motivation", "can't start",
    "cant start", "stuck", "doomscroll", "doom scroll", "tiktok", "instagram",
    "social media", "phone", "scrolling", "adhd", "can't concentrate", "cant concentrate"
  ])) categories.push("focus_support");

  // academic / workload / studying
  if (hasAny(t, [
    "grade", "grades", "class", "classes", "exam", "midterm", "final",
    "assignment", "deadline", "homework", "study", "studying", "failed",
    "falling behind", "behind", "professor", "course", "gpa"
  ])) categories.push("academic_support");

  // financial / basic needs
  if (hasAny(t, [
    "money", "rent", "tuition", "bills", "financial", "food", "hungry", "groceries",
    "job", "unemployed", "pay", "debt"
  ])) categories.push("financial_support");

  // social / isolation / safety
  if (hasAny(t, [
    "alone", "lonely", "isolated", "friends", "roommate", "relationship",
    "breakup", "harassed", "harassment", "unsafe", "stalking", "assault"
  ])) categories.push("social_support");

  // crisis keywords (we'll show emergency guidance)
  if (hasAny(t, ["suicidal", "self harm", "self-harm", "kill myself"])) categories.push("crisis");

  // If no matches, provide a general “start here”
  if (categories.length === 0) categories.push("general_support");

  return categories;
}

/** Build recommendations in a “resource type” format (not campus-specific) */
function buildRecommendations(categories) {
  // Each recommendation is a resource TYPE plus how to find it locally
  const library = {
    crisis: {
      title: "Urgent / Crisis Support",
      why: "If you’re in immediate danger or might harm yourself, getting real-time help matters most.",
      next: [
        "If you’re in the U.S., you can call or text 988 (Suicide & Crisis Lifeline).",
        "If you are in immediate danger, call local emergency services.",
        "If you’re on campus, consider contacting campus security or an RA/Dean on call."
      ],
      searchQuery: "crisis hotline near me"
    },
    mental_health: {
      title: "Counseling / Mental Health Support",
      why: "Your message suggests stress, anxiety, overwhelm, or emotional strain — talking to a professional or support service can help.",
      next: [
        "Look for campus counseling services or local community mental health centers.",
        "If you prefer, search for therapists offering telehealth.",
        "If cost is a concern, search for “sliding scale therapy”."
      ],
      searchQuery: "student counseling services"
    },
    focus_support: {
      title: "Focus & Executive Function Support",
      why: "This sounds like attention drift, procrastination, or motivation dips — supports exist beyond “just try harder.”",
      next: [
        "Look for an academic coaching center or learning specialist support.",
        "Try a structured study space (library, tutoring center, study hall).",
        "If distractions are intense, consider a focus accountability group."
      ],
      searchQuery: "academic coaching for students"
    },
    academic_support: {
      title: "Academic Support (Tutoring / Advising)",
      why: "This sounds like workload pressure, grades, deadlines, or study difficulty — academic support can reduce the load fast.",
      next: [
        "Find tutoring or a learning center for your subject.",
        "Meet with an academic advisor to triage deadlines and options.",
        "Ask a TA/professor about the minimum path to pass (very common!)."
      ],
      searchQuery: "student tutoring center"
    },
    financial_support: {
      title: "Financial / Basic Needs Support",
      why: "Your message suggests money stress, food insecurity, or financial pressure — there are often quick resources available.",
      next: [
        "Search for campus emergency funds and local assistance programs.",
        "Look for food pantries (campus or community).",
        "Check financial aid office options (appeals, short-term aid)."
      ],
      searchQuery: "student emergency financial assistance"
    },
    social_support: {
      title: "Social Support & Community",
      why: "Feeling isolated or unsafe can make everything harder — support networks and resources can help you stabilize quickly.",
      next: [
        "Look for peer support groups or student organizations aligned with your interests.",
        "If there’s safety/harassment, contact campus support resources or local services.",
        "Try a low-pressure start: attend one event and leave early if needed."
      ],
      searchQuery: "student support groups"
    },
    general_support: {
      title: "Start Here (Student Support Services)",
      why: "We couldn’t confidently match your situation to a single category — a general student support office can route you.",
      next: [
        "Search for “student support services” or “student care team”.",
        "If academics are involved, start with advising or a tutoring center.",
        "If emotions are involved, start with counseling services."
      ],
      searchQuery: "student support services"
    }
  };

  // Prioritize crisis if present
  const unique = Array.from(new Set(categories));
  unique.sort((a, b) => (a === "crisis" ? -1 : b === "crisis" ? 1 : 0));

  // Convert to recommendation objects
  return unique
    .map((key) => library[key])
    .filter(Boolean)
    .slice(0, 4); // keep it demo-friendly
}

/** Try to get user's location (optional). Returns {lat, lon} or rejects */
function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("no geolocation"));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        });
      },
      () => reject(new Error("denied")),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
    );
  });
}

/** Render results with optional location-aware Google Maps link */
function renderResults(outputEl, userText, recs, loc) {
  const disclaimer = `
    <div class="disclaimer">
      <strong>Note:</strong> Compass provides informational guidance, not medical or legal advice.
      If you feel unsafe or in immediate danger, seek urgent help right away.
    </div>
  `;

  const cards = recs.map((r) => {
    const mapsLink = buildMapsLink(r.searchQuery, loc);

    return `
      <div class="card">
        <h3>${escapeHtml(r.title)}</h3>
        <p class="why">${escapeHtml(r.why)}</p>

        <ul class="steps">
          ${r.next.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}
        </ul>

        <div class="actions">
          <a class="linkBtn" href="${mapsLink}" target="_blank" rel="noopener noreferrer">
            Search near me
          </a>
        </div>
      </div>
    `;
  }).join("");

  outputEl.innerHTML = `
    ${disclaimer}
    <div class="summary">
      <h3>Your message</h3>
      <p class="quote">“${escapeHtml(userText)}”</p>
    </div>
    ${cards}
  `;
}

/** Helpers */

function hasAny(text, keywords) {
  return keywords.some((k) => text.includes(k));
}

function buildMapsLink(query, loc) {
  // If location is available, use lat/lon to bias results
  if (loc && typeof loc.lat === "number" && typeof loc.lon === "number") {
    const q = encodeURIComponent(query);
    return `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=&center=${loc.lat},${loc.lon}`;
  }
  // Otherwise, generic search
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query + " near me")}`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
