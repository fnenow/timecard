document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('loginSection');
    const clockSection = document.getElementById('clockSection');
    const workerLoginInput = document.getElementById('workerLoginInput');
    const workerLoginBtn = document.getElementById('workerLoginBtn');
    const workerIdInput = document.getElementById('workerId');
    const projectRadios = document.getElementById('projectRadios');
    const noteInput = document.getElementById('noteInput');
    const clockInBtn = document.getElementById('clockInBtn');
    const clockOutBtn = document.getElementById('clockOutBtn');
    const messageArea = document.getElementById('messageArea');
    const currentStatusText = document.getElementById('currentStatusText');
    const currentProjectText = document.getElementById('currentProjectText');
    const clockInTimeText = document.getElementById('clockInTimeText');

    // --- Use your real backend base URL! ---
    const API_BASE_URL = 'http://backend-timeclock.up.railway.app';

    let currentWorker = null;
    let currentClockIn = null; // Store current clock in data

    // --- Worker Login Logic ---
    workerLoginBtn.addEventListener('click', async () => {
        const loginValue = workerLoginInput.value.trim();
        if (!loginValue) {
            showMessage('Please enter your Worker Email or Employee ID.', 'error');
            return;
        }

        try {
            // Fetch all workers (in a real app, you'd want a dedicated login endpoint)
            const workers = await makeApiCall(`${API_BASE_URL}/api/workers`);
            let worker = null;

            if (loginValue.includes('@')) {
                // Match by email
                worker = workers.find(w => (w.email || '').toLowerCase() === loginValue.toLowerCase());
            } else {
                // Match by employee_id_number
                worker = workers.find(w =>
                    (w.employee_id_number && w.employee_id_number.toLowerCase() === loginValue.toLowerCase())
                );
            }

            if (!worker) {
                showMessage('Worker not found. Please try again.', 'error');
                return;
            }

            currentWorker = worker;
            workerIdInput.value = worker.worker_id;

            // Hide login, show clock section
            loginSection.style.display = 'none';
            clockSection.style.display = 'block';
            showMessage(`Welcome, ${worker.name}!`, 'success');
            loadProjects();
            loadClockStatus(); // Check if currently clocked in

        } catch (error) {
            showMessage(`Login failed: ${error.message}`, 'error');
        }
    });

    // --- Load all Active Projects as Radio Buttons ---
    async function loadProjects() {
        projectRadios.innerHTML = 'Loading projects...';
        try {
            const projects = await makeApiCall(`${API_BASE_URL}/api/projects`);
            projectRadios.innerHTML = '';
            if (projects && Array.isArray(projects) && projects.length > 0) {
                projects.forEach(project => {
                    if (project.is_active) {
                        const label = document.createElement('label');
                        label.style.display = 'block';
                        const radio = document.createElement('input');
                        radio.type = 'radio';
                        radio.name = 'projectRadio';
                        radio.value = project.project_id;
                        label.appendChild(radio);
                        label.appendChild(document.createTextNode(' ' + project.project_name));
                        projectRadios.appendChild(label);
                    }
                });
            } else {
                projectRadios.innerHTML = '<em>No active projects available</em>';
            }
        } catch (error) {
            projectRadios.innerHTML = `<em>Error loading projects: ${error.message}</em>`;
        }
    }

    // --- Load Current Clock In Status (if any) ---
    async function loadClockStatus() {
        try {
            const workerId = workerIdInput.value;
            if (!workerId) return updateClockUI(false);
            // Get all time entries, look for an open one (no clock_out_time)
            const entries = await makeApiCall(`${API_BASE_URL}/api/workers/${workerId}/time-entries`);
            const openEntry = entries.find(e => !e.clock_out_time);
            if (openEntry) {
                currentClockIn = openEntry;
                // Set the selected project radio
                let radio = document.querySelector(`input[name="projectRadio"][value="${openEntry.project_id}"]`);
                if (radio) radio.checked = true;
                updateClockUI(true, openEntry, openEntry.clock_in_time);
            } else {
                updateClockUI(false);
            }
        } catch (error) {
            updateClockUI(false);
        }
    }

    // --- Clock In ---
    clockInBtn.addEventListener('click', async () => {
        const workerId = workerIdInput.value;
        const projectId = (document.querySelector('input[name="projectRadio"]:checked') || {}).value;
        const note = noteInput.value;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (!workerId) {
            showMessage('Worker not found.', 'error');
            return;
        }
        if (!projectId) {
            showMessage('Please select a project.', 'error');
            return;
        }

        try {
            const result = await makeApiCall(`${API_BASE_URL}/api/clock/in`, 'POST', {
                workerId,
                projectId,
                note,
                timezone
            });
            updateClockUI(true, { project_id: projectId, clock_in_time: result.clockInTime || new Date() }, result.clockInTime || new Date());
            showMessage('Clocked in successfully!', 'success');
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
            updateClockUI(false);
            showMessage('Clocked out successfully!', 'success');
        } catch (error) {
            showMessage(`Clock-out failed: ${error.message}`, 'error');
        }
    });

    // --- Update UI based on clock-in status ---
    function updateClockUI(isClockedIn, entry = {}, clockInTime = null) {
        if (isClockedIn) {
            currentStatusText.textContent = 'Clocked In';
            // Set project name
            let projectName = '-';
            if (entry.project_id) {
                const selectedLabel = Array.from(document.querySelectorAll('input[name="projectRadio"]'))
                    .find(r => r.value == entry.project_id);
                if (selectedLabel && selectedLabel.parentNode) {
                    projectName = selectedLabel.parentNode.textContent.trim();
                }
            }
            currentProjectText.textContent = projectName;
            clockInTimeText.textContent = clockInTime ? new Date(clockInTime).toLocaleString() : '-';
            clockInBtn.style.display = 'none';
            clockOutBtn.style.display = 'inline-block';
            projectRadios.querySelectorAll('input').forEach(r => r.disabled = true);
            noteInput.disabled = true;
        } else {
            currentStatusText.textContent = 'Not Clocked In';
            currentProjectText.textContent = '-';
            clockInTimeText.textContent = '-';
            clockInBtn.style.display = 'inline-block';
            clockOutBtn.style.display = 'none';
            projectRadios.querySelectorAll('input').forEach(r => r.disabled = false);
            noteInput.disabled = false;
        }
    }

    // --- Helper for showing messages ---
    function showMessage(msg, type = 'info') {
        messageArea.textContent = msg;
        messageArea.className = `message ${type}`;
        messageArea.style.display = 'block';
        setTimeout(() => { messageArea.style.display = 'none'; }, 5000);
    }

    // Allow Enter key to trigger login
    workerLoginInput.addEventListener('keyup', e => { if (e.key === 'Enter') workerLoginBtn.click(); });
});
