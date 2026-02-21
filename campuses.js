// campuses.js
// Campus-specific resources used by script.js (window.CAMPUS_DIRECTORY)

window.CAMPUS_DIRECTORY = {
  rutgers_nb: {
    displayName: "Rutgers — New Brunswick",
    resources: [
      {
        name: "Learning Centers / Tutoring",
        type: "Academic Support",
        tags: ["academic_support"],
        notes: "Tutoring, workshops, academic coaching.",
        links: [
          { label: "Rutgers Learning Centers", url: "https://learningcenters.rutgers.edu/" }
        ]
      },
      {
        name: "Academic Advising / Student Success",
        type: "Academic Support",
        tags: ["academic_support"],
        notes: "Help with course planning, academic difficulty, and next steps.",
        links: [
          { label: "Student Success", url: "https://studentsuccess.rutgers.edu/" }
        ]
      },
      {
        name: "Financial Aid Office",
        type: "Financial Support",
        tags: ["financial_support"],
        notes: "Assistance with tuition, aid, loans, and billing support.",
        links: [
          { label: "Rutgers Financial Aid", url: "https://financialaid.rutgers.edu/" }
        ]
      },
      {
        name: "Counseling / Mental Health Support",
        type: "Mental Health",
        tags: ["mental_health"],
        notes: "Counseling and wellness resources.",
        links: [
          { label: "Rutgers Counseling Services", url: "https://health.rutgers.edu/counseling-services" }
        ]
      },
      {
        name: "Career Services",
        type: "Career Support",
        tags: ["career_support"],
        notes: "Resume reviews, career coaching, internships/jobs.",
        links: [
          { label: "Rutgers Career Services", url: "https://careers.rutgers.edu/" }
        ]
      },
      {
        name: "Housing / Residence Life",
        type: "Housing Support",
        tags: ["housing_support"],
        notes: "Dorm-related support and housing information.",
        links: [
          { label: "Rutgers Residence Life", url: "https://ruoncampus.rutgers.edu/" }
        ]
      },

      // ✅ NEW: Transportation (Bus / Shuttle schedules)
      {
        name: "Campus Buses / Shuttle Schedules (NB)",
        type: "Transportation & Mobility",
        tags: ["transport_support"],
        notes: "Routes, schedules, and rider info for New Brunswick campus buses.",
        links: [
          { label: "Rutgers NB Bus Schedules", url: "https://ipo.rutgers.edu/transportation/buses/nb" }
        ]
      },

      // ✅ NEW: Dining (Dining halls / places to eat)
      {
        name: "Dining Halls & Places to Eat (NB)",
        type: "Food & Basic Needs",
        tags: ["food_support"],
        notes: "Dining halls, cafes, and food options around campus.",
        links: [
          { label: "Rutgers Dining — Places to Eat", url: "https://food.rutgers.edu/places-to-eat" }
        ]
      }
    ]
  },

  rutgers_nk: {
    displayName: "Rutgers — Newark",
    resources: [
      {
        name: "Counseling Center",
        type: "Mental Health",
        tags: ["mental_health"],
        notes: "Support and counseling resources.",
        links: [
          { label: "Rutgers Newark Counseling", url: "https://www.newark.rutgers.edu/student-life/counseling-center" }
        ]
      },
      {
        name: "Financial Aid Office — Newark",
        type: "Financial Support",
        tags: ["financial_support"],
        notes: "Help with tuition, billing, and aid.",
        links: [
          { label: "Rutgers Newark Financial Aid", url: "https://www.newark.rutgers.edu/financial-aid" }
        ]
      },
      {
        name: "Academic Support (Newark)",
        type: "Academic Support",
        tags: ["academic_support"],
        notes: "Academic success support and tutoring resources.",
        links: [
          { label: "Rutgers Newark Student Life", url: "https://www.newark.rutgers.edu/student-life" }
        ]
      },

      // ✅ NEW: Transportation (Bus / Shuttle schedules)
      {
        name: "Campus Buses / Shuttle Schedules (Newark)",
        type: "Transportation & Mobility",
        tags: ["transport_support"],
        notes: "Routes, schedules, and rider info for Newark campus transportation.",
        links: [
          { label: "Rutgers Newark Bus Info", url: "https://ipo.rutgers.edu/transportation/buses/newark" }
        ]
      },

      // ✅ NEW: Dining (Dining halls / campus dining)
      {
        name: "Dining (Newark)",
        type: "Food & Basic Needs",
        tags: ["food_support"],
        notes: "On-campus dining options in Newark.",
        links: [
          { label: "Rutgers Newark Dining", url: "https://myrun.newark.rutgers.edu/dining" }
        ]
      }
    ]
  },

  nyu: {
    displayName: "New York University",
    resources: [
      {
        name: "Academic Support / Services",
        type: "Academic Support",
        tags: ["academic_support"],
        notes: "Academic services and support resources.",
        links: [
          { label: "NYU Academic Services", url: "https://www.nyu.edu/students/academic-services.html" }
        ]
      },
      {
        name: "Wellness Center",
        type: "Mental Health",
        tags: ["mental_health"],
        notes: "Wellness resources and support.",
        links: [
          { label: "NYU Wellness", url: "https://www.nyu.edu/students/wellness.html" }
        ]
      },
      {
        name: "Financial Aid Office",
        type: "Financial Support",
        tags: ["financial_support"],
        notes: "Aid, loans, and financial guidance.",
        links: [
          { label: "NYU Financial Aid", url: "https://www.nyu.edu/admissions/financial-aid-and-scholarships.html" }
        ]
      },
      {
        name: "Career Services",
        type: "Career Support",
        tags: ["career_support"],
        notes: "Resume help, jobs/internships, career coaching.",
        links: [
          { label: "NYU Career Services", url: "https://www.nyu.edu/students/student-information-and-resources/career-development.html" }
        ]
      },

      // ✅ NEW: Transportation (Routes / schedules)
      {
        name: "NYU Transportation — Routes & Schedules",
        type: "Transportation & Mobility",
        tags: ["transport_support"],
        notes: "NYU transportation routes and schedules.",
        links: [
          { label: "NYU Routes & Schedules", url: "https://www.nyu.edu/life/travel-and-transportation/university-transportation/routes-and-schedules.html" }
        ]
      },

      // ✅ NEW: Dining (Dining halls / meal plans)
      {
        name: "NYU Dining — Meal Plans & Dining",
        type: "Food & Basic Needs",
        tags: ["food_support"],
        notes: "Meal plans and dining options across NYU.",
        links: [
          { label: "NYU Meal Plans", url: "https://www.nyu.edu/students/student-information-and-resources/housing-and-dining/dining/meal-plans.html" }
        ]
      }
    ]
  }
};
