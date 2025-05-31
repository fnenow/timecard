async function loadProjects() {
// Ensure API_BASE_URL is available in this scope.
// If it's a global variable set by initializeApiConfig from utils.js, it should be.

if (!API_BASE_URL) {
    console.error("API_BASE_URL is not defined. Cannot make API calls.");
    // Optionally display an error to the user
    return; // or throw an error
}

fetch(`${API_BASE_URL}/src/api`) // Assuming your backend routes are like /api/workers
  .then(response => {
    if (!response.ok) {
        // More detailed error handling
        return response.json().then(err => { throw new Error(err.message || `HTTP error ${response.status}`) });
    }
    return response.json();
  })
  .then(data => { /* ... */ })
  .catch(error => {
    console.error('Error fetching workers:', error);
    // Display this error in your messageArea
    const messageArea = document.getElementById('messageArea');
    if (messageArea) {
        messageArea.textContent = `Error fetching data: ${error.message}`;
        messageArea.style.display = 'block';
        messageArea.style.color = 'red'; // Or use a CSS class
    }
  });
    projectsTableBody.innerHTML = '<tr><td colspan="4">Loading projects...</td></tr>';
    try {
        const response = await makeApiCall('${API_BASE_URL}/api/projects');
        const projects = response.data || response;

        // Use mock data if in development mode or if API isn't available
        if (!projects || !Array.isArray(projects)) {
            console.log('Using mock data since API returned invalid response');
            renderProjects([
                { id: 1, project_name: 'Alpha Mock', description: 'Mock project Alpha', is_active: true }, 
                { id: 2, project_name: 'Beta Mock', description: 'Mock project Beta', is_active: false }
            ]);
            return;
        }

        renderProjects(projects);
    } catch (error) {
        showMessage('Error loading projects: ${error.message}', 'error');
        projectsTableBody.innerHTML = '<tr><td colspan="4">Error: ${error.message}</td></tr>';
        
        // Optionally fall back to mock data even on error
        console.log('Using mock data due to API error');
        renderProjects([
            { id: 1, project_name: 'Alpha Mock', description: 'Mock project Alpha', is_active: true }, 
            { id: 2, project_name: 'Beta Mock', description: 'Mock project Beta', is_active: false }
        ]);
    }
}
