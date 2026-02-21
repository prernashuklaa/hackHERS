// search.js
import { CAMPUS_DIRECTORY } from "./campuses.js";

// Function to filter resources based on user input
export function findResources(userInput, campusKey = "rutgers_nb") {
  const campus = CAMPUS_DIRECTORY[campusKey];
  userInput = userInput.toLowerCase();

  // FILTERING LOGIC: only show resources whose tags match user input
  return campus.resources.filter(resource =>
    resource.tags.some(tag => userInput.includes(tag))
  );
}
