window.CAMPUS_DIRECTORY = {
  rutgers_nb: {
    displayName: "Rutgers — New Brunswick",
    resources: [
      // ---------- Academic ----------
      {
        name: "Learning Centers / Tutoring",
        type: "Academic Support",
        intents: [{ tag: "academic_support", sub: "tutoring" }],
        notes: "Tutoring, workshops, academic coaching.",
        links: [{ label: "Rutgers Learning Centers", url: "https://learningcenters.rutgers.edu/" }]
      },
      {
        name: "Academic Advising / Student Success",
        type: "Academic Support",
        intents: [{ tag: "academic_support", sub: "advising" }],
        notes: "Help with course planning, academic difficulty, and next steps.",
        links: [{ label: "Student Success", url: "https://studentsuccess.rutgers.edu/" }]
      },

      // ---------- Dining / Food ----------
      {
        name: "Rutgers Dining Services (Dining halls, locations, hours)",
        type: "Food & Dining",
        intents: [{ tag: "food_support", sub: "dining" }],
        notes: "Dining halls, hours, locations, and menus.",
        links: [{ label: "Rutgers Dining Services", url: "https://food.rutgers.edu/" }]
      },
      {
        name: "Meal Plans (Rutgers Dining)",
        type: "Food & Dining",
        intents: [{ tag: "food_support", sub: "meal_plan" }],
        notes: "Meal plan details, pricing, and how-to.",
        links: [{ label: "Rutgers Meal Plans", url: "https://food.rutgers.edu/meal-plans/" }]
      },

      // ---------- Transportation ----------
      {
        name: "Rutgers Transportation Services (Bus routes & schedules)",
        type: "Transportation",
        intents: [
          { tag: "transport_support", sub: "bus" },
          { tag: "transport_support", sub: "shuttle" }
        ],
        notes: "Campus bus routes, real-time info, and schedules.",
        links: [{ label: "Rutgers Transportation", url: "https://ipo.rutgers.edu/dots/buses-shuttle" }]
      },

      // ---------- Financial ----------
      {
        name: "Financial Aid Office",
        type: "Financial Support",
        intents: [{ tag: "financial_support", sub: "aid" }],
        notes: "Aid, loans, tuition billing guidance.",
        links: [{ label: "Rutgers Financial Aid", url: "https://financialaid.rutgers.edu/" }]
      },

      // ---------- Mental Health ----------
      {
        name: "Counseling / Mental Health Support",
        type: "Mental Health",
        intents: [{ tag: "mental_health", sub: "therapy" }],
        notes: "Counseling and wellness resources.",
        links: [{ label: "Rutgers Counseling Services", url: "https://health.rutgers.edu/counseling-services" }]
      },

      // ---------- Career ----------
      {
        name: "Career Services",
        type: "Career Support",
        intents: [{ tag: "career_support", sub: "default" }],
        notes: "Resume reviews, coaching, internships/jobs.",
        links: [{ label: "Rutgers Career Services", url: "https://careers.rutgers.edu/" }]
      },

      // ---------- Housing ----------
      {
        name: "Housing / Residence Life",
        type: "Housing Support",
        intents: [{ tag: "housing_support", sub: "dorm" }],
        notes: "Dorm-related support and housing information.",
        links: [{ label: "Rutgers Residence Life", url: "https://ruoncampus.rutgers.edu/" }]
      }
    ]
  },

  rutgers_nk: {
    displayName: "Rutgers — Newark",
    resources: [
      // ---------- Mental Health ----------
      {
        name: "Counseling Center",
        type: "Mental Health",
        intents: [{ tag: "mental_health", sub: "therapy" }],
        notes: "Support and counseling resources.",
        links: [{ label: "Rutgers Newark Counseling", url: "https://www.newark.rutgers.edu/student-life/counseling-center" }]
      },

      // ---------- Academic ----------
      {
        name: "Academic Support (Newark)",
        type: "Academic Support",
        intents: [{ tag: "academic_support", sub: "default" }],
        notes: "Academic success support and tutoring resources.",
        links: [{ label: "Rutgers Newark Student Life", url: "https://www.newark.rutgers.edu/student-life" }]
      },

      // ---------- Dining / Food ----------
      {
        name: "Rutgers Newark Dining (Food options & info)",
        type: "Food & Dining",
        intents: [{ tag: "food_support", sub: "dining" }],
        notes: "Dining/campus food resources for Newark campus.",
        links: [{ label: "Rutgers Newark Campus Life", url: "https://www.newark.rutgers.edu/student-life" }]
      },

      // ---------- Transportation ----------
      {
        name: "Transportation / Parking (Newark campus info)",
        type: "Transportation",
        intents: [
          { tag: "transport_support", sub: "bus" },
          { tag: "transport_support", sub: "train" },
          { tag: "transport_support", sub: "parking" }
        ],
        notes: "Transit and parking info relevant to Newark campus.",
        links: [{ label: "Rutgers Newark Info", url: "https://www.newark.rutgers.edu/" }]
      },

      // ---------- Financial ----------
      {
        name: "Financial Aid Office — Newark",
        type: "Financial Support",
        intents: [{ tag: "financial_support", sub: "aid" }],
        notes: "Help with tuition, billing, and aid.",
        links: [{ label: "Rutgers Newark Financial Aid", url: "https://www.newark.rutgers.edu/financial-aid" }]
      }
    ]
  },

  nyu: {
    displayName: "New York University",
    resources: [
      // ---------- Academic ----------
      {
        name: "NYU Academic Services",
        type: "Academic Support",
        intents: [{ tag: "academic_support", sub: "default" }],
        notes: "Academic services and support resources.",
        links: [{ label: "NYU Academic Services", url: "https://www.nyu.edu/students/academic-services.html" }]
      },

      // ---------- Dining / Food ----------
      {
        name: "NYU Dining (Dining halls, meal plans, locations)",
        type: "Food & Dining",
        intents: [{ tag: "food_support", sub: "dining" }],
        notes: "Dining halls, meal plans, and dining locations.",
        links: [{ label: "NYU Dining", url: "https://www.nyu.edu/students/student-information-and-resources/housing-and-dining/dining.html" }]
      },
      {
        name: "NYU Meal Plans",
        type: "Food & Dining",
        intents: [{ tag: "food_support", sub: "meal_plan" }],
        notes: "Meal plan information and management.",
        links: [{ label: "NYU Dining Plans", url: "https://www.nyu.edu/students/student-information-and-resources/housing-and-dining/dining.html" }]
      },

      // ---------- Transportation ----------
      {
        name: "NYU Transportation / Shuttle info",
        type: "Transportation",
        intents: [
          { tag: "transport_support", sub: "shuttle" },
          { tag: "transport_support", sub: "bus" }
        ],
        notes: "Transportation-related NYU resources.",
        links: [{ label: "NYU Student Info", url: "https://www.nyu.edu/students/student-information-and-resources.html" }]
      },

      // ---------- Mental Health ----------
      {
        name: "NYU Wellness Center",
        type: "Mental Health",
        intents: [{ tag: "mental_health", sub: "therapy" }],
        notes: "Wellness resources and support.",
        links: [{ label: "NYU Wellness", url: "https://www.nyu.edu/students/wellness.html" }]
      },

      // ---------- Financial ----------
      {
        name: "NYU Financial Aid Office",
        type: "Financial Support",
        intents: [{ tag: "financial_support", sub: "aid" }],
        notes: "Aid, loans, and financial guidance.",
        links: [{ label: "NYU Financial Aid", url: "https://www.nyu.edu/admissions/financial-aid-and-scholarships.html" }]
      },

      // ---------- Career ----------
      {
        name: "NYU Career Services",
        type: "Career Support",
        intents: [{ tag: "career_support", sub: "default" }],
        notes: "Resume help, jobs/internships, coaching.",
        links: [{ label: "NYU Career Development", url: "https://www.nyu.edu/students/student-information-and-resources/career-development.html" }]
      }
    ]
  }
};
