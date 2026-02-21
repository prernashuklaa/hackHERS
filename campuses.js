// campuses.js
// Simple campus directory. Add/edit entries for your campus.

const CAMPUS_DIRECTORY = {
  rutgers_nb: {
    displayName: "Rutgers — New Brunswick",
    resources: [
      {
        tags: ["mental_health", "crisis"],
        name: "CAPS (Counseling, ADAP & Psychiatric Services)",
        type: "On-campus counseling",
        notes: "Confidential counseling and support for students.",
        url: "https://health.rutgers.edu"
      },
      {
        tags: ["academic_support", "focus_support"],
        name: "Learning Centers / Tutoring",
        type: "Academic support",
        notes: "Course support, tutoring, study skills.",
        url: "https://sas.rutgers.edu"
      },
      {
        tags: ["financial_support"],
        name: "Student Financial Aid Office",
        type: "Financial support",
        notes: "Aid questions, emergency funding info, guidance.",
        url: "https://studentaid.rutgers.edu"
      }
    ]
  },

  rutgers_nk: {
    displayName: "Rutgers — Newark",
    resources: [
      {
        tags: ["mental_health", "crisis"],
        name: "Counseling Center",
        type: "On-campus counseling",
        notes: "Counseling and mental health support.",
        url: "https://www.newark.rutgers.edu"
      }
    ]
  },

  nyu: {
    displayName: "NYU",
    resources: [
      {
        tags: ["mental_health", "crisis"],
        name: "Counseling and Wellness Center",
        type: "On-campus counseling",
        notes: "Mental health and wellness support for students.",
        url: "https://www.nyu.edu"
      }
    ]
  }
};
