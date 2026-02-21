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
      notes: "Crisis support, individual/group counseling, workshops, psychiatric services, and referrals.",
      url: "https://health.rutgers.edu/counseling-services"
    },
    {
      tags: ["academic_support", "focus_support"],
      name: "Rutgers Learning Centers",
      type: "Academic support",
      notes: "Peer tutoring, study groups, academic coaching, writing support, and workshops.",
      url: "https://learningcenters.rutgers.edu/"
    },
    {
      tags: ["financial"],
      name: "Scarlet Hub — Office of Financial Aid",
      type: "Financial support",
      notes: "Financial aid guidance, eligibility, awards, and counseling across Rutgers campuses.",
      url: "https://scarlethub.rutgers.edu/"
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
