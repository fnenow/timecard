async function loadProjects() {
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
