// campuses.js — Compass Support Campus Directory (FULL TAG COVERAGE)
// Load this BEFORE script.js in index.html
// Example:
// <script src="campuses.js"></script>
// <script src="script.js"></script>

(function () {
  const makeSearchLink = (campusName, query) => ({
    label: `Search: ${query}`,
    url: `https://www.google.com/search?q=${encodeURIComponent(
      `${campusName} ${query}`
    )}`,
  });

  function campusPack(displayName, knownLinks = {}) {
    // knownLinks can override any default search link you want to “pin” to a real URL
    const link = (queryKey, fallbackQuery) =>
      knownLinks[queryKey] || makeSearchLink(displayName, fallbackQuery);

    return {
      displayName,
      resources: [
        // 1️⃣ Mental Health & Emotional Support
        {
          name: "Counseling & Mental Health Services",
          type: "Mental Health",
          tags: ["mental_health"],
          notes: "Counseling, therapy options, group support, stress/burnout resources.",
          links: [
            link("mental_health", "counseling services"),
            makeSearchLink(displayName, "group therapy"),
            makeSearchLink(displayName, "stress management workshop"),
          ],
        },

        // 2️⃣ Physical Health & Medical Care
        {
          name: "Student Health / Medical Services",
          type: "Health",
          tags: ["health_support"],
          notes: "Health center, urgent care info, pharmacy, STI testing, insurance/telehealth resources.",
          links: [
            link("health_support", "student health center"),
            makeSearchLink(displayName, "urgent care after hours"),
            makeSearchLink(displayName, "pharmacy"),
            makeSearchLink(displayName, "STD STI testing"),
          ],
        },

        // 3️⃣ Emergency & Safety
        {
          name: "Safety, Emergency, Title IX, Reporting",
          type: "Emergency & Safety",
          tags: ["crisis"],
          notes: "Campus safety resources (non-emergency + reporting). For emergencies, use your Emergency tab.",
          links: [
            link("crisis", "campus police emergency contacts"),
            makeSearchLink(displayName, "safe walk escort service"),
            makeSearchLink(displayName, "Title IX office"),
            makeSearchLink(displayName, "sexual assault response"),
          ],
        },

        // 4️⃣ Food & Basic Needs
        {
          name: "Food & Basic Needs Support",
          type: "Food",
          tags: ["food_support"],
          notes: "Dining info + basic needs support: pantry/free meals/meal assistance.",
          links: [
            link("food_support", "food pantry"),
            makeSearchLink(displayName, "free meals"),
            makeSearchLink(displayName, "basic needs resources"),
            makeSearchLink(displayName, "halal kosher vegan dining"),
          ],
        },

        // 5️⃣ Academic Support
        {
          name: "Tutoring, Writing, Academic Success",
          type: "Academic Support",
          tags: ["academic_support"],
          notes: "Tutoring, writing support, advising, study resources.",
          links: [
            link("academic_support", "learning center tutoring"),
            makeSearchLink(displayName, "writing center"),
            makeSearchLink(displayName, "academic advising"),
            makeSearchLink(displayName, "disability accommodations"),
            makeSearchLink(displayName, "library hours study rooms"),
          ],
        },

        // 6️⃣ Career & Professional Development
        {
          name: "Career Center & Professional Development",
          type: "Career Support",
          tags: ["career_support"],
          notes: "Resume reviews, mock interviews, internships, jobs, networking.",
          links: [
            link("career_support", "career center"),
            makeSearchLink(displayName, "resume review"),
            makeSearchLink(displayName, "mock interview"),
            makeSearchLink(displayName, "student employment on campus jobs"),
            makeSearchLink(displayName, "internship resources"),
          ],
        },

        // 7️⃣ Financial Support & Money Help
        {
          name: "Financial Aid, Billing, Emergency Funds",
          type: "Financial Support",
          tags: ["financial_support"],
          notes: "Aid, scholarships, emergency grants, budgeting help.",
          links: [
            link("financial_support", "financial aid office"),
            makeSearchLink(displayName, "emergency grant"),
            makeSearchLink(displayName, "scholarships"),
            makeSearchLink(displayName, "tuition payment plan"),
            makeSearchLink(displayName, "free tax prep"),
          ],
        },

        // 8️⃣ Housing & Living
        {
          name: "Housing & Residence Life",
          type: "Housing Support",
          tags: ["housing_support"],
          notes: "On-campus housing resources + off-campus living support.",
          links: [
            link("housing_support", "residence life housing"),
            makeSearchLink(displayName, "off campus housing"),
            makeSearchLink(displayName, "roommate search"),
            makeSearchLink(displayName, "tenant rights"),
          ],
        },

        // 9️⃣ Transportation & Mobility
        {
          name: "Transportation: Shuttles, Transit, Parking, Bikes",
          type: "Transportation",
          tags: ["transport_support"],
          notes: "Shuttle schedules, bus/train info, parking permits, bike options.",
          links: [
            link("transport_support", "campus shuttle schedule"),
            makeSearchLink(displayName, "bus routes"),
            makeSearchLink(displayName, "train station directions"),
            makeSearchLink(displayName, "parking permits"),
            makeSearchLink(displayName, "bike share bike repair"),
          ],
        },

        // 🔟 Identity-Based & Cultural Support
        {
          name: "Identity & Cultural Support Centers",
          type: "Identity Support",
          tags: ["identity_support"],
          notes: "Multicultural, LGBTQ+, women’s center, international student support, faith/religious spaces.",
          links: [
            link("identity_support", "multicultural center"),
            makeSearchLink(displayName, "LGBTQ center"),
            makeSearchLink(displayName, "women's center"),
            makeSearchLink(displayName, "international student office"),
            makeSearchLink(displayName, "religious spaces campus"),
          ],
        },

        // 1️⃣1️⃣ Legal & Administrative Help
        {
          name: "Legal & Administrative Support",
          type: "Legal Support",
          tags: ["legal_support"],
          notes: "Student legal services, notary, immigration help, academic appeals.",
          links: [
            link("legal_support", "student legal services"),
            makeSearchLink(displayName, "notary services"),
            makeSearchLink(displayName, "immigration help"),
            makeSearchLink(displayName, "academic appeal"),
            makeSearchLink(displayName, "disciplinary support"),
          ],
        },

        // 1️⃣2️⃣ Physical Wellness & Recreation
        {
          name: "Recreation & Wellness",
          type: "Wellness / Recreation",
          tags: ["recreation_support"],
          notes: "Gym, fitness classes, yoga/meditation, intramurals, outdoor spaces.",
          links: [
            link("recreation_support", "campus gym recreation center"),
            makeSearchLink(displayName, "fitness classes"),
            makeSearchLink(displayName, "yoga meditation"),
            makeSearchLink(displayName, "intramural sports"),
            makeSearchLink(displayName, "outdoor spaces running clubs"),
          ],
        },

        // 1️⃣3️⃣ Tech & Study Infrastructure
        {
          name: "IT Help, Printing, Labs, Study Spaces",
          type: "Tech Support",
          tags: ["tech_support"],
          notes: "Computer labs, printing, WiFi, laptop repair, charging, 24-hour study spots.",
          links: [
            link("tech_support", "IT help desk"),
            makeSearchLink(displayName, "printing services"),
            makeSearchLink(displayName, "computer labs"),
            makeSearchLink(displayName, "free wifi locations"),
            makeSearchLink(displayName, "charging stations"),
            makeSearchLink(displayName, "24 hour study spaces"),
          ],
        },

        // 1️⃣4️⃣ Social Connection & Community
        {
          name: "Student Life, Clubs, Events, Volunteering",
          type: "Community Support",
          tags: ["community_support"],
          notes: "Clubs/orgs, student events, mixers, volunteering, faith-based groups.",
          links: [
            link("community_support", "student clubs organizations"),
            makeSearchLink(displayName, "campus events calendar"),
            makeSearchLink(displayName, "volunteer opportunities"),
            makeSearchLink(displayName, "club fair"),
            makeSearchLink(displayName, "faith based groups"),
          ],
        },

        // 1️⃣5️⃣ Relationship & Personal Support
        {
          name: "Relationship & Personal Support",
          type: "Personal Support",
          tags: ["relationship_support"],
          notes: "Conflict resolution, mediation, peer mentoring, relationship counseling resources.",
          links: [
            link("relationship_support", "relationship counseling"),
            makeSearchLink(displayName, "mediation services"),
            makeSearchLink(displayName, "peer mentoring"),
            makeSearchLink(displayName, "conflict resolution"),
            makeSearchLink(displayName, "sexual health education"),
          ],
        },
      ],
    };
  }

  // ✅ Build each campus with a mix of REAL pinned links + safe fallback search links.
  // You can swap any search link with a real URL anytime.
  window.CAMPUS_DIRECTORY = {
    rutgers_nb: campusPack("Rutgers — New Brunswick", {
      academic_support: { label: "Rutgers Learning Centers", url: "https://learningcenters.rutgers.edu/" },
      financial_support: { label: "Rutgers Financial Aid", url: "https://financialaid.rutgers.edu/" },
      career_support: { label: "Rutgers Careers", url: "https://careers.rutgers.edu/" },
      mental_health: { label: "Rutgers Counseling Services", url: "https://health.rutgers.edu/counseling-services" },
      housing_support: { label: "Rutgers Residence Life", url: "https://ruoncampus.rutgers.edu/" },
      // Keep these as searches unless you want to pin official pages later:
      // crisis, health_support, food_support, transport_support, identity_support, legal_support, recreation_support, tech_support, community_support, relationship_support
    }),

    rutgers_nk: campusPack("Rutgers — Newark", {
      mental_health: { label: "RU Newark Counseling Center", url: "https://www.newark.rutgers.edu/student-life/counseling-center" },
      financial_support: { label: "RU Newark Financial Aid", url: "https://www.newark.rutgers.edu/financial-aid" },
      academic_support: { label: "RU Newark Student Life", url: "https://www.newark.rutgers.edu/student-life" },
    }),

    nyu: campusPack("New York University", {
      academic_support: { label: "NYU Academic Services", url: "https://www.nyu.edu/students/academic-services.html" },
      mental_health: { label: "NYU Wellness", url: "https://www.nyu.edu/students/wellness.html" },
      financial_support: { label: "NYU Financial Aid", url: "https://www.nyu.edu/admissions/financial-aid-and-scholarships.html" },
      career_support: { label: "NYU Career Development", url: "https://www.nyu.edu/students/student-information-and-resources/career-development.html" },
    }),
  };
})();
