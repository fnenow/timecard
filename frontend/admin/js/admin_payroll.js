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

    const API_BASE_URL = '..';

    async function loadFilterDropdowns() {
        // Load Workers
        try {
            const workerResponse = await makeApiCall(`${API_BASE_URL}/api/workers`);
            const workers = workerResponse.data || workerResponse; // Adjust
            if (workers && workers.message === 'Worker.findAll called') { // Placeholder
                 [{ id: 1, name: 'Alice Mock' }, { id: 2, name: 'Bob Mock' }].forEach(worker => {
                    const option = document.createElement('option');
                    option.value = worker.id;
                    option.textContent = worker.name;
                    payrollWorkerFilterSelect.appendChild(option);
                });
            } else if (workers && Array.isArray(workers)) {
                workers.forEach(worker => {
                    const option = document.createElement('option');
                    option.value = worker.id || worker.worker_id;
                    option.textContent = worker.name;
                    payrollWorkerFilterSelect.appendChild(option);
                });
            }
        } catch (error) {
            showMessage(`Error loading workers for filter: ${error.message}`, 'error');
        }

        // Load Projects
        try {
            const projectResponse = await makeApiCall(`${API_BASE_URL}/api/projects`);
            const projects = projectResponse.data || projectResponse; // Adjust
             if (projects && projects.message === 'Project.findAll called') { // Placeholder
                [{ id: 1, project_name: 'Alpha Mock' }, { id: 2, project_name: 'Beta Mock' }].forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id;
                    option.textContent = project.project_name;
                    payrollProjectFilterSelect.appendChild(option);
                });
            } else if (projects && Array.isArray(projects)) {
                projects.forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id || project.project_id;
                    option.textContent = project.project_name;
                    payrollProjectFilterSelect.appendChild(option);
                });
            }
        } catch (error) {
            showMessage(`Error loading projects for filter: ${error.message}`, 'error');
        }
    }


    payrollFilterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const startDate = payrollStartDateInput.value;
        const endDate = payrollEndDateInput.value;
        const workerId = payrollWorkerFilterSelect.value;
        const projectId = payrollProjectFilterSelect.value;

        if (!startDate || !endDate) {
            showMessage('Start date and end date are required for the report.', 'error');
            return;
        }

        let queryParams = `?startDate=${startDate}&endDate=${endDate}`;
        if (workerId) queryParams += `&workerId=${workerId}`;
        if (projectId) queryParams += `&projectId=${projectId}`;

        payrollReportContainer.innerHTML = '<p>Generating report...</p>';
        reportPeriodDisplay.innerHTML = '';
        reportTotalsDisplay.innerHTML = '';

        try {
            const response = await makeApiCall(`${API_BASE_URL}/api/payroll/report${queryParams}`);
            // The actual report data is expected in response.report based on backend controller
            const reportData = response.report;

            if (reportData && reportData.workers_payroll) {
                renderPayrollReport(reportData);
                 reportPeriodDisplay.innerHTML = `<strong>Report for Period:</strong> ${new Date(reportData.report_period.start_date).toLocaleDateString()} - ${new Date(reportData.report_period.end_date).toLocaleDateString()}`;
            } else {
                payrollReportContainer.innerHTML = `<p>No payroll data found for the selected criteria. API Message: ${response.message || 'No data'}</p>`;
            }
        } catch (error) {
            showMessage(`Error generating payroll report: ${error.message}`, 'error');
            payrollReportContainer.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    });

    function renderPayrollReport(reportData) {
        payrollReportContainer.innerHTML = ''; // Clear previous
        if (!reportData.workers_payroll || reportData.workers_payroll.length === 0) {
            payrollReportContainer.innerHTML = '<p>No payroll data for any workers in this period.</p>';
            return;
        }

        let grandTotalAllPay = 0;
        let grandTotalAllHours = 0;

        reportData.workers_payroll.forEach(workerPayroll => {
            const workerTable = document.createElement('table');
            workerTable.innerHTML = `
                <caption>Payroll for: ${workerPayroll.worker_name} (ID: ${workerPayroll.worker_id})</caption>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Hours</th>
                        <th>Pay Rate ($)</th>
                        <th>Amount ($)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Regular</td><td>${workerPayroll.regular_hours.toFixed(2)}</td><td>Avg.</td><td>${workerPayroll.regular_pay.toFixed(2)}</td></tr>
                    <tr><td>Daily OT</td><td>${workerPayroll.daily_ot_hours.toFixed(2)}</td><td>Avg. x1.5</td><td>${workerPayroll.daily_ot_pay.toFixed(2)}</td></tr>
                    <tr><td>Weekly OT</td><td>${workerPayroll.weekly_ot_hours.toFixed(2)}</td><td>Avg. x1.5</td><td>${workerPayroll.weekly_ot_pay.toFixed(2)}</td></tr>
                    <tr><td colspan="3"><strong>Total Hours for Worker</strong></td><td><strong>${workerPayroll.total_hours.toFixed(2)}</strong></td></tr>
                    <tr><td colspan="3"><strong>Total Pay for Worker</strong></td><td><strong>${workerPayroll.grand_total_pay.toFixed(2)}</strong></td></tr>
                </tbody>
            `;
            payrollReportContainer.appendChild(workerTable);
            payrollReportContainer.appendChild(document.createElement('hr'));

            grandTotalAllPay += workerPayroll.grand_total_pay;
            grandTotalAllHours += workerPayroll.total_hours;

            // Optional: Render detailed entries if available in workerPayroll.entries_detail
            if(workerPayroll.entries_detail && workerPayroll.entries_detail.length > 0) {
                const detailsHeader = document.createElement('h4');
                detailsHeader.textContent = 'Time Entries Detail:';
                payrollReportContainer.appendChild(detailsHeader);
                const detailsTable = document.createElement('table');
                detailsTable.innerHTML = `
                    <thead><tr><th>Date</th><th>Project</th><th>In</th><th>Out</th><th>Duration (m)</th><th>Rate</th><th>Bill #</th><th>Paid Date</th><th>Action</th></tr></thead>
                    <tbody></tbody>
                `;
                const detailsTbody = detailsTable.querySelector('tbody');
                workerPayroll.entries_detail.forEach(entry => {
                    const tr = detailsTbody.insertRow();
                    tr.insertCell().textContent = new Date(entry.clock_in_time).toLocaleDateString();
                    tr.insertCell().textContent = entry.project_name || entry.project_id;
                    tr.insertCell().textContent = new Date(entry.clock_in_time).toLocaleTimeString();
                    tr.insertCell().textContent = new Date(entry.clock_out_time).toLocaleTimeString();
                    tr.insertCell().textContent = entry.duration_minutes;
                    tr.insertCell().textContent = entry.recorded_pay_rate.toFixed(2);
                    
                    const billInput = document.createElement('input');
                    billInput.type = 'text';
                    billInput.value = entry.bill_number || '';
                    billInput.dataset.entryId = entry.entry_id;
                    billInput.classList.add('billNumberInput');
                    tr.insertCell().appendChild(billInput);

                    const paidDateInput = document.createElement('input');
                    paidDateInput.type = 'date';
                    paidDateInput.value = entry.worker_paid_date ? entry.worker_paid_date.split('T')[0] : '';
                    paidDateInput.dataset.entryId = entry.entry_id;
                    paidDateInput.classList.add('paidDateInput');
                    tr.insertCell().appendChild(paidDateInput);

                    const updateBtn = document.createElement('button');
                    updateBtn.textContent = 'Update';
                    updateBtn.onclick = () => updateBillingInfo(entry.entry_id || entry.id, billInput.value, paidDateInput.value);
                    tr.insertCell().appendChild(updateBtn);
                });
                payrollReportContainer.appendChild(detailsTable);
                payrollReportContainer.appendChild(document.createElement('hr'));
            }
        });

        reportTotalsDisplay.innerHTML = `
            <h3>Report Grand Totals</h3>
            <p><strong>Total Hours (All Workers):</strong> ${grandTotalAllHours.toFixed(2)}</p>
            <p><strong>Total Pay (All Workers):</strong> $${grandTotalAllPay.toFixed(2)}</p>
        `;
    }

    async function updateBillingInfo(entryId, billNumber, paidDate) {
        try {
            await makeApiCall(`${API_BASE_URL}/api/payroll/time-entries/${entryId}/billing`, 'PUT', {
                bill_number: billNumber,
                worker_paid_date: paidDate || null // Send null if date is cleared
            });
            showMessage(`Billing info for entry ${entryId} updated. Regenerate report to see changes reflected if needed, or handle UI update directly.`, 'success');
            // Optionally, re-fetch or update the specific entry in the UI.
            // For simplicity, we'll just show a message.
        } catch (error) {
            showMessage(`Error updating billing for entry ${entryId}: ${error.message}`, 'error');
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