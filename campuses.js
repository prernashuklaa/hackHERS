// campuses.js
window.CAMPUS_DIRECTORY = {
  rutgers_nb: {
    displayName: "Rutgers — New Brunswick",
    resources: [
      {
        name: "Counseling Center",
        type: "Mental health",
        tags: ["mental_health", "social_support"],
        notes: "Call to schedule an appointment",
        links: [
          { label: "Website", url: "https://health.rutgers.edu/counseling/" }
        ]
      },
      {
        name: "Peer Support Group",
        type: "Social support",
        tags: ["social_support"],
        notes: "Join weekly meetings",
        links: []
      }
    ]
  },
  nyu: {
    displayName: "New York University",
    resources: [
      {
        name: "NYU Wellness Center",
        type: "Mental health",
        tags: ["mental_health"],
        notes: "Appointments available online",
        links: [
          { label: "Book now", url: "https://www.nyu.edu/students/wellness.html" }
        ]
      }
    ]
  }
};
