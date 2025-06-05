document.addEventListener('DOMContentLoaded', () => {
    const workerIdInput = document.getElementById('workerId');
    const startDateFilter = document.getElementById('startDateFilter');
    const endDateFilter = document.getElementById('endDateFilter');
    const filterBtn = document.getElementById('filterBtn');
    const timeEntriesTbody = document.getElementById('timeEntriesTbody');
    const messageArea = document.getElementById('messageArea');
    const API_BASE_URL = 'https://backend-timeclock.up.railway.app'; // Relative

    async function fetchTimeEntries() {
        const workerId = workerIdInput.value;
        if (!workerId) {
            showMessage('Worker ID not found.', 'error');
            timeEntriesTbody.innerHTML = '<tr><td colspan="6">Worker ID not found.</td></tr>';
            return;
        }

        let queryParams = '';
        if (startDateFilter.value) queryParams += `&startDate=${startDateFilter.value}`;
        if (endDateFilter.value) queryParams += `&endDate=${endDateFilter.value}`;
        if (queryParams) queryParams = '?' + queryParams.substring(1);


        timeEntriesTbody.innerHTML = '<tr><td colspan="6">Loading entries...</td></tr>';
        try {
            const response = await makeApiCall(`${API_BASE_URL}/api/workers/${workerId}/time-entries${queryParams}`);
            // Assuming response is the array of entries or response.data is the array
            // The actual structure depends on your backend (e.g., if it's wrapped in a 'data' object)
            const entries = response.data || response; // Adjust based on actual API structure

            if (entries && entries.message === 'ClockEntry.findByWorkerId for worker view called') { // Placeholder check
                 // Use mock data if placeholder response
                renderTimeEntries([{ entry_id: 1, project_name: 'Demo Project', clock_in_time: '2024-05-29T09:00:00Z', clock_out_time: '2024-05-29T17:00:00Z', duration_minutes: 480, notes: 'Worked on feature X' }]);
                return;
            }


            if (entries && Array.isArray(entries) && entries.length > 0) {
                renderTimeEntries(entries);
            } else {
                timeEntriesTbody.innerHTML = '<tr><td colspan="6">No time entries found for the selected criteria.</td></tr>';
            }
        } catch (error) {
            showMessage(`Error fetching time entries: ${error.message}`, 'error');
            timeEntriesTbody.innerHTML = `<tr><td colspan="6">Error loading entries: ${error.message}</td></tr>`;
        }
    }

    function renderTimeEntries(entries) {
        timeEntriesTbody.innerHTML = ''; // Clear existing rows
        entries.forEach(entry => {
            const row = timeEntriesTbody.insertRow();
            const clockIn = new Date(entry.clock_in_time);
            const clockOut = entry.clock_out_time ? new Date(entry.clock_out_time) : null;
            const durationHours = Math.floor((entry.duration_minutes || 0) / 60);
            const durationMins = (entry.duration_minutes || 0) % 60;

            row.insertCell().textContent = clockIn.toLocaleDateString();
            row.insertCell().textContent = entry.project_name || entry.project_id || 'N/A'; // Adjust based on API response
            row.insertCell().textContent = clockIn.toLocaleTimeString();
            row.insertCell().textContent = clockOut ? clockOut.toLocaleTimeString() : 'Still Clocked In';
            row.insertCell().textContent = `${durationHours}h ${durationMins}m`;
            row.insertCell().textContent = entry.notes || '';
        });
    }

    filterBtn.addEventListener('click', fetchTimeEntries);

    function showMessage(msg, type = 'info') {
        messageArea.textContent = msg;
        messageArea.className = `message ${type}`;
        messageArea.style.display = 'block';
        setTimeout(() => { messageArea.style.display = 'none'; }, 5000);
    }

    // Initial load
    fetchTimeEntries();
});
