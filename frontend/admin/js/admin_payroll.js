document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return;

    const payrollFilterForm = document.getElementById('payrollFilterForm');
    const payrollStartDateInput = document.getElementById('payrollStartDate');
    const payrollEndDateInput = document.getElementById('payrollEndDate');
    const payrollWorkerFilterSelect = document.getElementById('payrollWorkerFilter');
    const payrollProjectFilterSelect = document.getElementById('payrollProjectFilter');
    const reportPeriodDisplay = document.getElementById('reportPeriodDisplay');
    const payrollReportContainer = document.getElementById('payrollReportContainer');
    const reportTotalsDisplay = document.getElementById('reportTotalsDisplay');
    const messageArea = document.getElementById('messageArea');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');

    // === Use your real backend API URL here ===
    const API_BASE_URL = 'https://backend-production-1ac9.up.railway.app';

    // --- Dropdowns ---
    async function loadFilterDropdowns() {
        // Workers
        try {
            const workers = await makeApiCall(`${API_BASE_URL}/api/workers`);
            workers.forEach(worker => {
                const option = document.createElement('option');
                option.value = worker.worker_id;
                option.textContent = worker.name;
                payrollWorkerFilterSelect.appendChild(option);
            });
        } catch (error) {
            showMessage(`Error loading workers: ${error.message}`, 'error');
        }

        // Projects
        try {
            const projects = await makeApiCall(`${API_BASE_URL}/api/projects`);
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.project_id;
                option.textContent = project.project_name;
                payrollProjectFilterSelect.appendChild(option);
            });
        } catch (error) {
            showMessage(`Error loading projects: ${error.message}`, 'error');
        }
    }

    // --- Generate Payroll ---
    payrollFilterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const startDate = payrollStartDateInput.value;
        const endDate = payrollEndDateInput.value;
        const workerId = payrollWorkerFilterSelect.value;
        const projectId = payrollProjectFilterSelect.value;

        if (!startDate || !endDate) {
            showMessage('Start date and end date are required.', 'error');
            return;
        }

        // Query string for API
        let params = [];
        if (startDate) params.push(`start=${startDate}`);
        if (endDate) params.push(`end=${endDate}`);
        if (workerId) params.push(`worker=${workerId}`);
        if (projectId) params.push(`project=${projectId}`);
        const query = params.length ? `?${params.join('&')}` : '';

        payrollReportContainer.innerHTML = '<p>Generating report...</p>';
        reportPeriodDisplay.innerHTML = '';
        reportTotalsDisplay.innerHTML = '';

        try {
            // GET payroll report
            const entries = await makeApiCall(`${API_BASE_URL}/api/payroll${query}`);
            renderPayrollReport(entries);

            // Display period
            reportPeriodDisplay.innerHTML =
                `<strong>Report for Period:</strong> ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
        } catch (error) {
            showMessage(`Error generating payroll report: ${error.message}`, 'error');
            payrollReportContainer.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    });

    // --- Render Payroll ---
    function renderPayrollReport(entries) {
        payrollReportContainer.innerHTML = ''; // Clear previous
        if (!entries.length) {
            payrollReportContainer.innerHTML = '<p>No payroll data for the selected period.</p>';
            return;
        }
        let html = '<table><thead><tr>' +
            '<th>Worker</th><th>Project</th><th>Date</th><th>Clock In</th><th>Clock Out</th>' +
            '<th>Duration (m)</th><th>Pay Rate</th><th>Amount ($)</th>' +
            '<th>Bill #</th><th>Paid Date</th>' +
            '</tr></thead><tbody>';
        let totalAmount = 0, totalMinutes = 0;
        entries.forEach(entry => {
            const duration = entry.duration_minutes || 0;
            const payRate = entry.recorded_pay_rate || 0;
            const amount = duration && payRate ? ((duration / 60) * payRate).toFixed(2) : '';
            totalAmount += Number(amount) || 0;
            totalMinutes += duration;

            html += `<tr>
                <td>${entry.worker_name || entry.worker_id}</td>
                <td>${entry.project_name || entry.project_id}</td>
                <td>${entry.clock_in_time ? new Date(entry.clock_in_time).toLocaleDateString() : ''}</td>
                <td>${entry.clock_in_time ? new Date(entry.clock_in_time).toLocaleTimeString() : ''}</td>
                <td>${entry.clock_out_time ? new Date(entry.clock_out_time).toLocaleTimeString() : ''}</td>
                <td>${duration}</td>
                <td>${payRate}</td>
                <td>${amount}</td>
                <td>
                    <input type="text" value="${entry.bill_number || ''}" data-entry-id="${entry.entry_id}" class="billNumberInput">
                </td>
                <td>
                    <input type="date" value="${entry.worker_paid_date ? entry.worker_paid_date.split('T')[0] : ''}" data-entry-id="${entry.entry_id}" class="paidDateInput">
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        payrollReportContainer.innerHTML = html;
        reportTotalsDisplay.innerHTML =
            `<h3>Report Totals</h3>
             <p><strong>Total Hours:</strong> ${(totalMinutes/60).toFixed(2)}</p>
             <p><strong>Total Pay:</strong> $${totalAmount.toFixed(2)}</p>`;

        // --- Add Update Buttons ---
        document.querySelectorAll('.billNumberInput, .paidDateInput').forEach(input => {
            input.addEventListener('change', () => {
                const entryId = input.dataset.entryId;
                const billNumber = document.querySelector(`input.billNumberInput[data-entry-id="${entryId}"]`).value;
                const paidDate = document.querySelector(`input.paidDateInput[data-entry-id="${entryId}"]`).value;
                updateBillingInfo(entryId, billNumber, paidDate);
            });
        });
    }

    async function updateBillingInfo(entryId, billNumber, paidDate) {
        try {
            await makeApiCall(`${API_BASE_URL}/api/clock/${entryId}/billing`, 'PUT', {
                bill_number: billNumber,
                worker_paid_date: paidDate || null
            });
            showMessage(`Billing info updated.`, 'success');
        } catch (error) {
            showMessage(`Error updating billing: ${error.message}`, 'error');
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

    // Set default dates (e.g., this month)
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    payrollStartDateInput.value = firstDayOfMonth;
    payrollEndDateInput.value = lastDayOfMonth;

    loadFilterDropdowns();
});
