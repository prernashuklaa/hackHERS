// campuses.js
// Simple campus directory. Add/edit entries for your campus.

window.CAMPUS_DIRECTORY = {

  rutgers_nb: {
    displayName: "Rutgers — New Brunswick",
    resources: [
      {
        tags: [
          "mental_health",
          "lonely",
          "alone",
          "anxious",
          "anxiety",
          "depressed",
          "depression",
          "stress",
          "burnout",
          "crisis"
        ],
        name: "CAPS (Counseling, ADAP & Psychiatric Services)",
        type: "Counseling & Mental Health",
        notes:
          "Crisis support, individual/group counseling, workshops, psychiatric services, and referrals.",
        links: [
          {
            label: "Counseling Services",
            url: "https://health.rutgers.edu/counseling-services"
          },
          {
            label: "Group Therapy Options",
            url:
              "https://health.rutgers.edu/counseling-services/therapy-options/group-offerings"
          }
        ]
      },
      {
        tags: ["academic", "study", "grades", "exam", "focus", "tutoring"],
        name: "Rutgers Learning Centers",
        type: "Academic Support",
        notes:
          "Peer tutoring, study groups, academic coaching, writing support, and workshops.",
        links: [
          {
            label: "Learning Centers Website",
            url: "https://learningcenters.rutgers.edu/"
          }
        ]
      },
      {
        tags: ["financial", "money", "tuition", "aid", "broke"],
        name: "Scarlet Hub — Office of Financial Aid",
        type: "Financial Support",
        notes:
          "Financial aid guidance, eligibility, awards, and counseling across Rutgers campuses.",
        links: [
          {
            label: "Scarlet Hub",
            url: "https://scarlethub.rutgers.edu/"
          }
        ]
      }
    ]
  },

  rutgers_nk: {
    displayName: "Rutgers — Newark",
    resources: [
      {
        tags: ["mental_health", "crisis"],
        name: "Rutgers Newark Counseling Center",
        type: "On-campus counseling",
        notes: "Counseling and mental health support.",
        links: [
          {
            label: "Rutgers Newark Website",
            url: "https://www.newark.rutgers.edu"
          }
        ]
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
        links: [
          {
            label: "NYU Website",
            url: "https://www.nyu.edu"
          }
        ]
      }
    ]
  }

};
