// search.js
import { CAMPUS_DIRECTORY } from "./campuses.js";

export function findResources(userInput, campusKey = "rutgers_nb") {
  const campus = CAMPUS_DIRECTORY[campusKey];
  userInput = userInput.toLowerCase();

  // FILTERING LOGIC GOES HERE
  return campus.resources.filter(resource =>
    resource.tags.some(tag => userInput.includes(tag))
  );
}
