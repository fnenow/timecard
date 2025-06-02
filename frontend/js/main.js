document.addEventListener('DOMContentLoaded', () => {
    const workerIdInput = document.getElementById('workerId'); // Assuming this is set
    const projectSelect = document.getElementById('projectSelect');
    const clockInBtn = document.getElementById('clockInBtn');
    const clockOutBtn = document.getElementById('clockOutBtn');
    const messageArea = document.getElementById('messageArea');

    const currentStatusText = document.getElementById('currentStatusText');
    const currentProjectText = document.getElementById('currentProjectText');
    const clockInTimeText = document.getElementById('clockInTimeText');

    const API_BASE_URL = 'https://backend-production-1ac9.up.railway.app'; // Relative to current host, or set full like 'http://localhost:3001'

    // --- Load Projects ---
    async function loadProjects() {
        try {
            const projects = await makeApiCall(`${API_BASE_URL}/api/projects?active=true`);
            projectSelect.innerHTML = '<option value="">-- Select Project --</option>'; // Clear loading
            if (projects && projects.data && Array.isArray(projects.data.message === 'Project.findAll called' ? projects.data.query : projects.data)) { // Adjust based on actual API response structure
                // This condition is a bit complex due to placeholder API response.
                // For a real API, it would be simpler: projects.forEach(...)
                let projectList = projects.data.message === 'Project.findAll called' ? [{id:1, project_name:'Demo Project 1'},{id:2, project_name:'Demo Project 2'}] : projects.data;

                projectList.forEach(project => {
                    if (project.is_active !== false) { // Filter active if not done by API
                         const option = document.createElement('option');
                         option.value = project.project_id || project.id; // Adjust based on actual property name
                         option.textContent = project.project_name;
                         projectSelect.appendChild(option);
                    }
                });
            } else {
                 projectSelect.innerHTML = '<option value="">No active projects found</option>';
            }
        } catch (error) {
            showMessage(`Error loading projects: ${error.message}`, 'error');
            projectSelect.innerHTML = '<option value="">Error loading</option>';
        }
    }

    // --- Check Current Clock Status (Simplified) ---
    // A real app might get this from a dedicated status endpoint or on page load
    function updateClockUI(isClockedIn, projectDetails = {}, clockInTime = null) {
        if (isClockedIn) {
            currentStatusText.textContent = 'Clocked In';
            currentProjectText.textContent = projectDetails.name || 'N/A';
            clockInTimeText.textContent = clockInTime ? new Date(clockInTime).toLocaleTimeString() : 'N/A';
            clockInBtn.style.display = 'none';
            clockOutBtn.style.display = 'inline-block';
            projectSelect.disabled = true;
        } else {
            currentStatusText.textContent = 'Not Clocked In';
            currentProjectText.textContent = '-';
            clockInTimeText.textContent = '-';
            clockInBtn.style.display = 'inline-block';
            clockOutBtn.style.display = 'none';
            projectSelect.disabled = false;
        }
    }
    // Placeholder for initial status check if needed
    // async function checkInitialStatus() {
    //     const workerId = workerIdInput.value;
    //     // const status = await makeApiCall(`${API_BASE_URL}/api/workers/${workerId}/status`);
    //     // if (status && status.isClockedIn) {
    //     //     updateClockUI(true, status.project, status.clockInTime);
    //     //     projectSelect.value = status.project.id;
    //     // } else {
    //     //     updateClockUI(false);
    //     // }
    // }


    // --- Clock In ---
    clockInBtn.addEventListener('click', async () => {
        const workerId = workerIdInput.value;
        const projectId = projectSelect.value;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (!workerId) {
            showMessage('Worker ID not found. Please log in or select worker.', 'error');
            return;
        }
        if (!projectId) {
            showMessage('Please select a project.', 'error');
            return;
        }

        try {
            const result = await makeApiCall(`${API_BASE_URL}/api/clock/in`, 'POST', { workerId, projectId, timezone });
            showMessage('Successfully clocked in!', 'success');
            // Assuming result.data contains project info and clockInTime
            const projectName = projectSelect.options[projectSelect.selectedIndex].text;
            updateClockUI(true, { id: projectId, name: projectName }, result.data.clockInTime || new Date());
        } catch (error) {
            showMessage(`Clock-in failed: ${error.message}`, 'error');
        }
    });

    // --- Clock Out ---
    clockOutBtn.addEventListener('click', async () => {
        const workerId = workerIdInput.value;
        if (!workerId) {
            showMessage('Worker ID not found.', 'error');
            return;
        }

        try {
            await makeApiCall(`${API_BASE_URL}/api/clock/out`, 'POST', { workerId });
            showMessage('Successfully clocked out!', 'success');
            updateClockUI(false);
        } catch (error) {
            showMessage(`Clock-out failed: ${error.message}`, 'error');
        }
    });


    function showMessage(msg, type = 'info') {
        messageArea.textContent = msg;
        messageArea.className = `message ${type}`;
        messageArea.style.display = 'block';
        setTimeout(() => { messageArea.style.display = 'none'; }, 5000);
    }

    // Initializations
    loadProjects();
    // checkInitialStatus(); // If implemented
});
