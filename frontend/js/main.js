document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const loginSection = document.getElementById('loginSection');
    const workerLoginInput = document.getElementById('workerLoginInput');
    const workerLoginBtn = document.getElementById('workerLoginBtn');
    const clockSection = document.getElementById('clockSection');
    const workerIdInput = document.getElementById('workerId');
    const projectRadiosDiv = document.getElementById('projectRadios');
    const noteInput = document.getElementById('noteInput');
    const clockInBtn = document.getElementById('clockInBtn');
    const clockOutBtn = document.getElementById('clockOutBtn');
    const messageArea = document.getElementById('messageArea');
    const currentStatusText = document.getElementById('currentStatusText');
    const currentProjectText = document.getElementById('currentProjectText');
    const clockInTimeText = document.getElementById('clockInTimeText');
    const API_BASE_URL = 'https://backend-production-1ac9.up.railway.app';

    let projectsAssigned = [];
    let currentWorker = null;

    // --- Worker Login ---
    workerLoginBtn.addEventListener('click', async () => {
        const loginValue = workerLoginInput.value.trim();
        if (!loginValue) {
            showMessage('Enter your Worker Email or ID.', 'error');
            return;
        }
        try {
            // Try by email first, fallback to ID
            let worker = null;
            let workers = await makeApiCall(`${API_BASE_URL}/api/workers?email=${encodeURIComponent(loginValue)}`);
            if (Array.isArray(workers) && workers.length > 0) {
                worker = workers[0];
            } else if (!isNaN(Number(loginValue))) {
                worker = await makeApiCall(`${API_BASE_URL}/api/workers/${loginValue}`);
            }
            if (!worker || !worker.worker_id) {
                showMessage('Worker not found.', 'error');
                return;
            }
            currentWorker = worker;
            workerIdInput.value = worker.worker_id;
            await loadAssignedProjects(worker.worker_id);
            loginSection.style.display = 'none';
            clockSection.style.display = '';
            showMessage(`Welcome, ${worker.name}!`, 'success');
            updateClockUI(false);
            // Optionally: fetch and show last clock status
        } catch (err) {
            showMessage(`Login failed: ${err.message}`, 'error');
        }
    });

    // --- Load Assigned Projects (radio buttons) ---
    async function loadAssignedProjects(workerId) {
        projectRadiosDiv.innerHTML = 'Loading projects...';
        try {
            // Backend should return only projects assigned to this worker
            const projects = await makeApiCall(`${API_BASE_URL}/api/workers/${workerId}/projects`);
            if (Array.isArray(projects) && projects.length > 0) {
                projectsAssigned = projects;
                projectRadiosDiv.innerHTML = '';
                projects.forEach((project, idx) => {
                    const label = document.createElement('label');
                    label.style.display = 'block';
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = 'projectRadio';
                    radio.value = project.project_id;
                    if (idx === 0) radio.checked = true;
                    label.appendChild(radio);
                    label.appendChild(document.createTextNode(' ' + project.project_name));
                    projectRadiosDiv.appendChild(label);
                });
            } else {
                projectRadiosDiv.innerHTML = '<em>No projects assigned. Contact admin.</em>';
            }
        } catch (error) {
            projectRadiosDiv.innerHTML = `<em>Error loading projects: ${error.message}</em>`;
        }
    }

    // --- UI Update for Clock Status ---
    function updateClockUI(isClockedIn, projectDetails = {}, clockInTime = null) {
        if (isClockedIn) {
            currentStatusText.textContent = 'Clocked In';
            currentProjectText.textContent = projectDetails.name || 'N/A';
            clockInTimeText.textContent = clockInTime ? new Date(clockInTime).toLocaleTimeString() : 'N/A';
            clockInBtn.style.display = 'none';
            clockOutBtn.style.display = '';
            Array.from(document.getElementsByName('projectRadio')).forEach(radio => radio.disabled = true);
            noteInput.disabled = true;
        } else {
            currentStatusText.textContent = 'Not Clocked In';
            currentProjectText.textContent = '-';
            clockInTimeText.textContent = '-';
            clockInBtn.style.display = '';
            clockOutBtn.style.display = 'none';
            Array.from(document.getElementsByName('projectRadio')).forEach(radio => radio.disabled = false);
            noteInput.disabled = false;
        }
    }

    // --- Clock In ---
    clockInBtn.addEventListener('click', async () => {
        const workerId = workerIdInput.value;
        const selectedRadio = document.querySelector('input[name="projectRadio"]:checked');
        const note = noteInput.value.trim();
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (!workerId) {
            showMessage('Worker not found. Please log in.', 'error');
            return;
        }
        if (!selectedRadio) {
            showMessage('Please select a project.', 'error');
            return;
        }

        try {
            const result = await makeApiCall(`${API_BASE_URL}/api/clock/in`, 'POST', {
                workerId,
                projectId: selectedRadio.value,
                note,
                timezone
            });
            showMessage('Successfully clocked in!', 'success');
            const project = projectsAssigned.find(p => p.project_id == selectedRadio.value);
            updateClockUI(true, { id: project.project_id, name: project.project_name }, result.clockInTime || new Date());
        } catch (error) {
            showMessage(`Clock-in failed: ${error.message}`, 'error');
        }
    });

    // --- Clock Out ---
    clockOutBtn.addEventListener('click', async () => {
        const workerId = workerIdInput.value;
        if (!workerId) {
            showMessage('Worker not found.', 'error');
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
});
