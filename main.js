// main.js
import { findResources } from "./search.js";

const form = document.getElementById("searchForm");
const inputField = document.getElementById("userInput");
const resultsDiv = document.getElementById("results");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const userText = inputField.value;

  // Get matching resources
  const matches = findResources(userText);

  // Clear previous results
  resultsDiv.innerHTML = "";

  if (!matches.length) {
    resultsDiv.innerHTML = "<p>No matching resources found.</p>";
    return;
  }

  // Render each resource
  matches.forEach(resource => {
    const div = document.createElement("div");
    let linksHTML = "";

    // Loop through all links for this resource
    resource.links.forEach(link => {
      linksHTML += `<li><a href="${link.url}" target="_blank">${link.label}</a></li>`;
    });

    div.innerHTML = `
      <h3>${resource.name}</h3>
      <p><strong>Type:</strong> ${resource.type}</p>
      <p>${resource.notes}</p>
      <ul>${linksHTML}</ul>
      <hr/>
    `;

    resultsDiv.appendChild(div);
  });
});
