// script.js
// Compass core: theme + campus hint + on-campus + off-campus nearby

const THEME_KEY = "compass_theme_v1";
let customCampusName = "";

function buildCampusRecommendations(campusKey, text) {
  const dir = getCampusDirectory();
  let campusRecs = [];
  const t = (text || "").toLowerCase();

  // Map input keywords to resource tags
  const KEYWORD_TAG_MAP = {
    // Social support
    "lonely": "social_support",
    "alone": "social_support",
    "friends": "social_support",
    "drained": "social_support",
    // Mental health
    "anxious": "mental_health",
    "anxiety": "mental_health",
    "depressed": "mental_health",
    "stress": "mental_health",
    "stressed": "mental_health",
    "therapy": "mental_health",
    "overwhelmed": "mental_health",
    "panic": "mental_health",
    "burnout": "mental_health",
    // Financial
    "money": "financial_support",
    "rent": "financial_support",
    "bills": "financial_support",
    "tuition": "financial_support",
    "food": "financial_support",
    "groceries": "financial_support",
    "job": "financial_support",
    "debt": "financial_support",
    // Crisis / suicidal
    "suicidal": "crisis",
    "self harm": "crisis",
    "self-harm": "crisis",
    "kill myself": "crisis"
  };

  // Determine which tags appear in user input
  const matchedTags = new Set();
  for (const [keyword, tag] of Object.entries(KEYWORD_TAG_MAP)) {
    if (t.includes(keyword)) matchedTags.add(tag);
  }

  if (campusKey && dir[campusKey]) {
    const campus = dir[campusKey];

    // Push multiple on-campus & off-campus resources for Mental Health
    if (!campus.resources.some(r => r.name === "Group Offerings")) {
      campus.resources.push(
        {
          name: "Group Offerings",
          type: "Mental Health / Therapy",
          tags: ["mental_health"],
          notes: "Peer and therapy groups at Rutgers",
          links: [
            { label: "View group offerings", url: "https://health.rutgers.edu/counseling-services/therapy-options/group-offerings" }
          ]
        },
        {
          name: "Counseling Services",
          type: "Mental Health",
          tags: ["mental_health"],
          notes: "Individual counseling on campus",
          links: [
            { label: "Learn more", url: "https://health.rutgers.edu/counseling-services/" }
          ]
        },
        {
          name: "Nearby Therapists",
          type: "Mental Health",
          tags: ["mental_health"],
          notes: "Off-campus therapy options",
          links: [
            { label: "Find a therapist", url: "https://www.psychologytoday.com/us/therapists/new-brunswick-nj" }
          ]
        }
      );
    }

    // Push multiple Financial Support options
    if (!campus.resources.some(r => r.name === "Financial Aid Office")) {
      campus.resources.push(
        {
          name: "Financial Aid Office",
          type: "Financial Support",
          tags: ["financial_support"],
          notes: "Assistance with tuition and bills",
          links: [
            { label: "Visit Financial Aid", url: "https://financialaid.rutgers.edu/" }
          ]
        },
        {
          name: "Food & Essentials",
          type: "Financial Support",
          tags: ["financial_support"],
          notes: "Food pantries and student support nearby",
          links: [
            { label: "Find food support", url: "https://www.foodpantries.org/st/new_brunswick-nj" }
          ]
        }
      );
    }

    // Push multiple Crisis / Suicide resources
    if (!campus.resources.some(r => r.name === "Crisis Hotline")) {
      campus.resources.push(
        {
          name: "Crisis Hotline",
          type: "Crisis Support",
          tags: ["crisis"],
          notes: "24/7 support for urgent mental health needs",
          links: [
            { label: "Call 988 (US)", url: "tel:988" },
            { label: "Learn more", url: "https://988lifeline.org/" }
          ]
        },
        {
          name: "Campus Safety & Crisis Center",
          type: "Crisis Support",
          tags: ["crisis"],
          notes: "Immediate support for students on campus",
          links: [
            { label: "Campus Crisis Info", url: "https://rutgers.edu/safety" }
          ]
        }
      );
    }

    // Filter campus resources based on matched tags
    if (Array.isArray(campus.resources)) {
      campusRecs = campus.resources.filter(r =>
        (r.tags || []).some(tag => matchedTags.has(tag))
      );
    }
  } else {
    // No campus selected → search all campuses for matching tags
    Object.values(dir).forEach(campus => {
      if (Array.isArray(campus.resources)) {
        campus.resources.forEach(r => {
          if ((r.tags || []).some(tag => matchedTags.has(tag))) campusRecs.push(r);
        });
      }
    });
  }

  return campusRecs;
}
