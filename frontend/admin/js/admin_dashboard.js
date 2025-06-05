document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return; // Redirects if not logged in

    const workerStatusTableBody = document.getElementById('workerStatusTableBody');
    const messageArea = document.getElementById('messageArea');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const API_BASE_URL = 'https://backend-timeclock.up.railway.app';

    async function loadWorkerStatuses() {
        workerStatusTableBody.innerHTML = '<tr><td colspan="5">Loading statuses...</td></tr>';
        try {
            const statuses = await makeApiCall(`${API_BASE_URL}/api/workers/statuses`);
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
        if (!statuses.length) {
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
                actionsCell.textContent = '-';
            }
        });
    }

    async function manualClockOut(workerId) {
        if (!confirm(`Are you sure you want to manually clock out worker ${workerId}?`)) return;
        try {
            await makeApiCall(`${API_BASE_URL}/api/clock/out`, 'POST', { workerId, manual: true });
            showMessage(`Worker ${workerId} clocked out manually.`, 'success');
            loadWorkerStatuses();
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
            messageArea.className = `message ${type}`;
            messageArea.style.display = 'block';
            setTimeout(() => { messageArea.style.display = 'none'; }, 4000);
        }
    }

    loadWorkerStatuses();
});
