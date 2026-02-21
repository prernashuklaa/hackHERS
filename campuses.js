// campuses.js
// Simple campus directory. Add/edit entries for your campus.

// campuses.js
window.CAMPUS_DIRECTORY = {
  rutgers_nb: {
    displayName: "Rutgers — New Brunswick",
    resources: [
      {
        name: "Counseling & Psychological Services",
        type: "Campus resource",
        notes: "Schedule an appointment online or by phone.",
        tags: ["mental_health"],
        links: [
          { label: "CAPS Website", url: "https://health.rutgers.edu/counseling-services/" }
        ]
      },
      {
        name: "Group Therapy Options",
        type: "Campus resource",
        notes: "Peer and professional-led therapy groups.",
        tags: ["social_support"],
        links: [
          { label: "Group Therapy Options", url: "https://health.rutgers.edu/counseling-services/therapy-options/group-offerings" }
        ]
      },
      {
        name: "Academic Support Center",
        type: "Campus resource",
        notes: "Tutoring and study support for all courses.",
        tags: ["academic_support"],
        links: [
          { label: "ASC Website", url: "https://sasundergrad.rutgers.edu/academic-support" }
        ]
      }
    ]
  },
  rutgers_nk: {
    displayName: "Rutgers — Newark",
    resources: [
      {
        name: "Counseling Services Newark",
        type: "Campus resource",
        tags: ["mental_health"],
        links: [
          { label: "Counseling Newark", url: "https://www.newark.rutgers.edu/student-life/counseling" }
        ]
      }
    ]
  },
  nyu: {
    displayName: "NYU",
    resources: [
      {
        name: "NYU Counseling Center",
        type: "Campus resource",
        tags: ["mental_health", "social_support"],
        links: [
          { label: "NYU Counseling Center", url: "https://www.nyu.edu/students/health-wellness/counseling.html" }
        ]
      }
    ]
  }
};
  rutgers_nk: {
    displayName: "Rutgers — Newark",
    resources: [
      {
        tags: ["mental_health", "crisis"],
        name: "Rutgers Newark Counseling Center",
        type: "On-campus counseling",
        notes: "Counseling and mental health support.",
        links: [{ label: "Rutgers Newark Website", url: "https://www.newark.rutgers.edu" }]
      }
    ]
  },

  nyu: {
    displayName: "NYU",
    resources: [
      {
        tags: ["mental_health", "crisis"],
        name: "NYU Counseling and Wellness Center",
        type: "On-campus counseling",
        notes: "Mental health and wellness support for students.",
        links: [{ label: "NYU Website", url: "https://www.nyu.edu" }]
      }
    ]
  }
};
