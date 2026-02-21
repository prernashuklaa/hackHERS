window.CAMPUS_DIRECTORY = {
  rutgers_nb: {
    displayName: "Rutgers — New Brunswick",
    resources: [
      // ---------- Food ----------
      {
        name: "Rutgers Dining Services (locations, menus, hours)",
        type: "Food & Dining",
        intents: [{ tag: "food_support", sub: "dining" }],
        notes: "Dining halls, locations, hours, menus.",
        links: [{ label: "Rutgers Dining", url: "https://food.rutgers.edu/" }],
      },
      {
        name: "Rutgers Meal Plans (pricing & details)",
        type: "Food & Dining",
        intents: [{ tag: "food_support", sub: "meal_plan" }],
        notes: "Meal plan options and how to manage them.",
        links: [{ label: "Rutgers Meal Plans", url: "https://food.rutgers.edu/meal-plans/" }],
      },
      {
        name: "Late-night food near Rutgers NB (map search)",
        type: "Food & Dining",
        intents: [{ tag: "food_support", sub: "late_night" }],
        notes: "Quick map search for food open late near campus.",
        links: [{ label: "Open late-night food map", url: "https://www.google.com/maps/search/late+night+food+near+Rutgers+New+Brunswick" }],
      },
      {
        name: "Restaurants near Rutgers NB (map search)",
        type: "Food & Dining",
        intents: [{ tag: "food_support", sub: "restaurants" }],
        notes: "Off-campus restaurants close to New Brunswick campus.",
        links: [{ label: "Open restaurants map", url: "https://www.google.com/maps/search/restaurants+near+Rutgers+New+Brunswick" }],
      },

      // ---------- Health ----------
      {
        name: "Rutgers Health Services (appointments & info)",
        type: "Health",
        intents: [{ tag: "health_support", sub: "primary" }],
        notes: "Medical care and student health resources.",
        links: [{ label: "Rutgers Health", url: "https://health.rutgers.edu/" }],
      },
      {
        name: "Urgent care near Rutgers NB (map search)",
        type: "Health",
        intents: [{ tag: "health_support", sub: "urgent" }],
        notes: "If you need same-day care off-campus.",
        links: [{ label: "Open urgent care map", url: "https://www.google.com/maps/search/urgent+care+near+Rutgers+New+Brunswick" }],
      },

      // ---------- Mental Health ----------
      {
        name: "Rutgers Counseling / Mental Health Support",
        type: "Mental Health",
        intents: [{ tag: "mental_health", sub: "therapy" }],
        notes: "Counseling and wellness support.",
        links: [{ label: "Rutgers Counseling", url: "https://health.rutgers.edu/counseling-services" }],
      },

      // ---------- Academic ----------
      {
        name: "Rutgers Learning Centers / Tutoring",
        type: "Academic Support",
        intents: [{ tag: "academic_support", sub: "tutoring" }],
        notes: "Tutoring, workshops, academic coaching.",
        links: [{ label: "Rutgers Learning Centers", url: "https://learningcenters.rutgers.edu/" }],
      },
      {
        name: "Academic Advising / Student Success",
        type: "Academic Support",
        intents: [{ tag: "academic_support", sub: "advising" }],
        notes: "Course planning + academic difficulty support.",
        links: [{ label: "Student Success", url: "https://studentsuccess.rutgers.edu/" }],
      },

      // ---------- Fun / Community ----------
      {
        name: "Rutgers Get Involved (clubs, orgs, activities)",
        type: "Community",
        intents: [{ tag: "community_support", sub: "clubs" }],
        notes: "Find clubs and student orgs.",
        links: [{ label: "Get Involved", url: "https://getinvolved.rutgers.edu/" }],
      },
      {
        name: "Events near Rutgers NB (campus + local map)",
        type: "Community",
        intents: [{ tag: "community_support", sub: "events" }],
        notes: "Quick search for events near campus.",
        links: [{ label: "Open events map", url: "https://www.google.com/maps/search/events+near+Rutgers+New+Brunswick" }],
      },
      {
        name: "Recreation / Things to do (near campus)",
        type: "Recreation",
        intents: [{ tag: "recreation_support", sub: "default" }],
        notes: "Ideas for fun nearby.",
        links: [{ label: "Things to do map", url: "https://www.google.com/maps/search/things+to+do+near+Rutgers+New+Brunswick" }],
      },

      // ---------- Transportation ----------
      {
        name: "Rutgers Transportation (buses & shuttles)",
        type: "Transportation",
        intents: [
          { tag: "transport_support", sub: "bus" },
          { tag: "transport_support", sub: "shuttle" },
        ],
        notes: "Routes, schedules, real-time info.",
        links: [{ label: "Rutgers Transportation", url: "https://ipo.rutgers.edu/dots/buses-shuttle" }],
      },

      // ---------- Financial ----------
      {
        name: "Rutgers Financial Aid",
        type: "Financial Support",
        intents: [{ tag: "financial_support", sub: "aid" }],
        notes: "Aid, loans, billing guidance.",
        links: [{ label: "Financial Aid", url: "https://financialaid.rutgers.edu/" }],
      },

      // ---------- Career ----------
      {
        name: "Rutgers Career Services",
        type: "Career Support",
        intents: [{ tag: "career_support", sub: "default" }],
        notes: "Resume reviews, internships/jobs, coaching.",
        links: [{ label: "Career Services", url: "https://careers.rutgers.edu/" }],
      },

      // ---------- Housing ----------
      {
        name: "Rutgers Residence Life / Housing",
        type: "Housing Support",
        intents: [{ tag: "housing_support", sub: "dorm" }],
        notes: "Dorm + housing information.",
        links: [{ label: "Residence Life", url: "https://ruoncampus.rutgers.edu/" }],
      },
    ],
  },

  rutgers_nk: {
    displayName: "Rutgers — Newark",
    resources: [
      // ---------- Food ----------
      {
        name: "Rutgers Newark Dining info (campus life resources)",
        type: "Food & Dining",
        intents: [{ tag: "food_support", sub: "dining" }],
        notes: "Campus info hub for student life resources (including dining pointers).",
        links: [{ label: "RU Newark Student Life", url: "https://www.newark.rutgers.edu/student-life" }],
      },
      {
        name: "Late-night food near Rutgers Newark (map search)",
        type: "Food & Dining",
        intents: [{ tag: "food_support", sub: "late_night" }],
        notes: "Food open late near Newark campus.",
        links: [{ label: "Open late-night food map", url: "https://www.google.com/maps/search/late+night+food+near+Rutgers+Newark" }],
      },
      {
        name: "Restaurants near Rutgers Newark (map search)",
        type: "Food & Dining",
        intents: [{ tag: "food_support", sub: "restaurants" }],
        notes: "Off-campus restaurants close to Newark campus.",
        links: [{ label: "Open restaurants map", url: "https://www.google.com/maps/search/restaurants+near+Rutgers+Newark" }],
      },

      // ---------- Health ----------
      {
        name: "Rutgers Newark health resources (campus info hub)",
        type: "Health",
        intents: [{ tag: "health_support", sub: "primary" }],
        notes: "Student life hub for support services and health-related resources.",
        links: [{ label: "RU Newark Student Life", url: "https://www.newark.rutgers.edu/student-life" }],
      },
      {
        name: "Urgent care near Rutgers Newark (map search)",
        type: "Health",
        intents: [{ tag: "health_support", sub: "urgent" }],
        notes: "Same-day/off-campus urgent care options.",
        links: [{ label: "Open urgent care map", url: "https://www.google.com/maps/search/urgent+care+near+Rutgers+Newark" }],
      },

      // ---------- Mental Health ----------
      {
        name: "Rutgers Newark Counseling Center",
        type: "Mental Health",
        intents: [{ tag: "mental_health", sub: "therapy" }],
        notes: "Counseling and mental health support.",
        links: [{ label: "Newark Counseling Center", url: "https://www.newark.rutgers.edu/student-life/counseling-center" }],
      },

      // ---------- Academic ----------
      {
        name: "Academic Support (Newark campus info hub)",
        type: "Academic Support",
        intents: [{ tag: "academic_support", sub: "default" }],
        notes: "Academic success support resources.",
        links: [{ label: "RU Newark Student Life", url: "https://www.newark.rutgers.edu/student-life" }],
      },

      // ---------- Fun / Community ----------
      {
        name: "Events near Rutgers Newark (map search)",
        type: "Community",
        intents: [{ tag: "community_support", sub: "events" }],
        notes: "Events happening near Newark campus.",
        links: [{ label: "Open events map", url: "https://www.google.com/maps/search/events+near+Rutgers+Newark" }],
      },
      {
        name: "Clubs / Student orgs (Newark info hub)",
        type: "Community",
        intents: [{ tag: "community_support", sub: "clubs" }],
        notes: "Find activities and student involvement resources.",
        links: [{ label: "RU Newark Student Life", url: "https://www.newark.rutgers.edu/student-life" }],
      },
      {
        name: "Things to do near Rutgers Newark (map search)",
        type: "Recreation",
        intents: [{ tag: "recreation_support", sub: "default" }],
        notes: "Ideas for fun nearby.",
        links: [{ label: "Things to do map", url: "https://www.google.com/maps/search/things+to+do+near+Rutgers+Newark" }],
      },

      // ---------- Transportation ----------
      {
        name: "Transportation / Parking (Rutgers Newark)",
        type: "Transportation",
        intents: [
          { tag: "transport_support", sub: "bus" },
          { tag: "transport_support", sub: "train" },
          { tag: "transport_support", sub: "parking" },
        ],
        notes: "Transit + parking info for Newark campus.",
        links: [{ label: "Rutgers Newark", url: "https://www.newark.rutgers.edu/" }],
      },

      // ---------- Financial ----------
      {
        name: "Financial Aid Office — Newark",
        type: "Financial Support",
        intents: [{ tag: "financial_support", sub: "aid" }],
        notes: "Help with tuition, billing, and aid.",
        links: [{ label: "Newark Financial Aid", url: "https://www.newark.rutgers.edu/financial-aid" }],
      },
    ],
  },

  nyu: {
    displayName: "New York University",
    resources: [
      {
        name: "NYU Dining",
        type: "Food & Dining",
        intents: [{ tag: "food_support", sub: "dining" }],
        notes: "Dining locations and meal plan info.",
        links: [{ label: "NYU Dining", url: "https://www.nyu.edu/students/student-information-and-resources/housing-and-dining/dining.html" }],
      },
      {
        name: "NYU Meal Plans",
        type: "Food & Dining",
        intents: [{ tag: "food_support", sub: "meal_plan" }],
        notes: "Meal plan details and management.",
        links: [{ label: "NYU Dining Plans", url: "https://www.nyu.edu/students/student-information-and-resources/housing-and-dining/dining.html" }],
      },
      {
        name: "NYU Wellness Center",
        type: "Mental Health",
        intents: [{ tag: "mental_health", sub: "therapy" }],
        notes: "Wellness resources and support.",
        links: [{ label: "NYU Wellness", url: "https://www.nyu.edu/students/wellness.html" }],
      },
      {
        name: "NYU Academic Services",
        type: "Academic Support",
        intents: [{ tag: "academic_support", sub: "default" }],
        notes: "Academic services and support.",
        links: [{ label: "NYU Academic Services", url: "https://www.nyu.edu/students/academic-services.html" }],
      },
      {
        name: "NYU Career Services",
        type: "Career Support",
        intents: [{ tag: "career_support", sub: "default" }],
        notes: "Resume help, jobs/internships, coaching.",
        links: [{ label: "NYU Career Development", url: "https://www.nyu.edu/students/student-information-and-resources/career-development.html" }],
      },
      {
        name: "NYU Financial Aid",
        type: "Financial Support",
        intents: [{ tag: "financial_support", sub: "aid" }],
        notes: "Aid, loans, and financial guidance.",
        links: [{ label: "NYU Financial Aid", url: "https://www.nyu.edu/admissions/financial-aid-and-scholarships.html" }],
      },
    ],
  },
};
