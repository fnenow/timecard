document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return; // Redirects if not logged in

    const workerStatusTableBody = document.getElementById('workerStatusTableBody');
    const messageArea = document.getElementById('messageArea');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const API_BASE_URL = '..'; // Relative to admin folder, so goes up one level

    async function loadWorkerStatuses() {
        workerStatusTableBody.innerHTML = '<tr><td colspan="5">Loading statuses...</td></tr>';
        try {
            const response = await makeApiCall(`${API_BASE_URL}/api/workers/statuses`);
            const statuses = response.data || response; // Adjust based on API structure

            if (statuses && statuses.message === 'ClockEntry.getCurrentStatuses called') { // Placeholder check
                renderWorkerStatuses([{ worker_id: 1, name: 'Alice (Mock)', project_name: 'Alpha (Mock)', clock_in_time: new Date(Date.now() - 3600000) }, { worker_id: 2, name: 'Bob (Mock)', project_name: null}]);
                return;
            }

            if (statuses && Array.isArray(statuses)) {
                renderWorkerStatuses(statuses);
            } else {
                 workerStatusTableBody.innerHTML = '<tr><td colspan="5">No worker statuses available.</td></tr>';
            }
        } catch (error) {
            showMessage(`Error loading worker statuses: ${error.message}`, 'error');
            workerStatusTableBody.innerHTML = `<tr><td colspan="5">Error: ${error.message}</td></tr>`;
        }
    }

    function renderWorkerStatuses(statuses) {
        workerStatusTableBody.innerHTML = '';
        if (statuses.length === 0) {
            workerStatusTableBody.innerHTML = '<tr><td colspan="5">No workers found or none are clocked in.</td></tr>';
            return;
        }
        statuses.forEach(status => {
            const row = workerStatusTableBody.insertRow();
            row.insertCell().textContent = status.name || `Worker ${status.worker_id}`;
            row.insertCell().textContent = status.clock_in_time ? 'Clocked In' : 'Clocked Out';
            row.insertCell().textContent = status.project_name || (status.clock_in_time ? 'N/A' : '-');
            row.insertCell().textContent = status.clock_in_time ? new Date(status.clock_in_time).toLocaleString() : '-';

            const actionsCell = row.insertCell();
            if (status.clock_in_time) {
                const clockOutBtn = document.createElement('button');
                clockOutBtn.textContent = 'Manual Clock Out';
                clockOutBtn.classList.add('danger');
                clockOutBtn.onclick = () => manualClockOut(status.worker_id);
                actionsCell.appendChild(clockOutBtn);
            } else {
                // Could add manual clock-in button here if desired
                actionsCell.textContent = '-';
            }
        });
    }

    async function manualClockOut(workerId) {
        if (!confirm(`Are you sure you want to manually clock out worker ${workerId}?`)) return;
        try {
            await makeApiCall(`${API_BASE_URL}/api/clock/out`, 'POST', { workerId, manual: true }); // Add manual flag if backend supports
            showMessage(`Worker ${workerId} clocked out manually.`, 'success');
            loadWorkerStatuses(); // Refresh table
        } catch (error) {
            showMessage(`Failed to clock out worker ${workerId}: ${error.message}`, 'error');
        }
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            adminLogout();
        });
    }

    function showMessage(msg, type = 'info') {
        if (messageArea) {
            messageArea.textContent = msg;
            messageArea.className = `message ${type}`; // Ensure messageArea is defined
            messageArea.style.display = 'block';
            setTimeout(() => { messageArea.style.display = 'none'; }, 4000);
        } else {
            console.warn("messageArea not found for:", msg);
        }
    }

    loadWorkerStatuses();
});