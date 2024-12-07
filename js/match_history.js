const initMtachHistory = () => {
	// Example: Fetch Match History (Assume API Endpoint Exists)
async function fetchMatchHistory() {
	const response = await fetch('/api/match-history'); // Adjust the endpoint
	const matches = await response.json();
  
	const table = document.getElementById("matchHistoryTable");
	table.innerHTML = matches
	  .map(
		(match) => `
		<tr>
		  <td>${match.date}</td>
		  <td>${match.opponent}</td>
		  <td>${match.result}</td>
		  <td>${match.score}</td>
		</tr>
	  `
	  )
	  .join("");
  }
  
  // Fetch match history on page load
  document.addEventListener("DOMContentLoaded", fetchMatchHistory);
};

export default initMtachHistory;