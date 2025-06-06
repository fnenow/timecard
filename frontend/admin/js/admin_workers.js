document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return;

    const workersTableBody = document.getElementById('workersTableBody');
    const workerForm = document.getElementById('workerForm');
    const workerFormTitle = document.getElementById('workerFormTitle');
    const workerIdInput = document.getElementById('workerIdInput');
    const workerNameInput = document.getElementById('workerName');
    const workerEmployeeIdInput = document.getElementById('workerEmployeeId');
    const workerPhoneNumberInput = document.getElementById('workerPhoneNumber');
    const workerAddressInput = document.getElementById('workerAddress');
    const saveWorkerBtn = document.getElementById('saveWorkerBtn');
    const cancelWorkerEditBtn = document.getElementById('cancelWorkerEditBtn');
    const showAddWorkerFormBtn = document.getElementById('showAddWorkerFormBtn');

    const payRateSection = document.getElementById('payRateSection');
    const payRateWorkerName = document.getElementById('payRateWorkerName');
    const payRateWorkerIdInput = document.getElementById('payRateWorkerIdInput');
    const addPayRateForm = document.getElementById('addPayRateForm');
    const rateAmountInput = document.getElementById('rateAmount');
    const effectiveStartDateInput = document.getElementById('effectiveStartDate');
    const payRatesTableBody = document.getElementById('payRatesTableBody');
    const closePayRateSectionBtn = document.getElementById('closePayRateSectionBtn');

    const messageArea = document.getElementById('messageArea');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');

    // === SET THIS TO YOUR DEPLOYED BACKEND ===
    const API_BASE_URL = 'https://backend-timeclock.up.railway.app';

    let editingWorkerId = null;

    async function loadWorkers() {
        workersTableBody.innerHTML = '<tr><td colspan="4">Loading workers...</td></tr>';
        try {
            const workers = await makeApiCall(`${API_BASE_URL}/api/workers`);
            if (workers && Array.isArray(workers)) {
                renderWorkers(workers);
            } else {
                workersTableBody.innerHTML = '<tr><td colspan="4">No workers found.</td></tr>';
            }
        } catch (error) {
            showMessage(`Error loading workers: ${error.message}`, 'error');
            workersTableBody.innerHTML = `<tr><td colspan="4">Error: ${error.message}</td></tr>`;
        }
    }

    function renderWorkers(workers) {
        workersTableBody.innerHTML = '';
        if (!workers.length) {
            workersTableBody.innerHTML = '<tr><td colspan="4">No workers found. Add one!</td></tr>';
            return;
        }
        workers.forEach(worker => {
            const row = workersTableBody.insertRow();
            row.insertCell().textContent = worker.name;
            row.insertCell().textContent = worker.employee_id_number || '-';
            row.insertCell().textContent = worker.phone_number || '-';

            const actionsCell = row.insertCell();
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit Info';
            editBtn.onclick = () => populateWorkerFormForEdit(worker);
            actionsCell.appendChild(editBtn);

            const payRateBtn = document.createElement('button');
            payRateBtn.textContent = 'Manage Pay Rates';
            payRateBtn.style.marginLeft = '5px';
            payRateBtn.onclick = () => openPayRateSection(worker);
            actionsCell.appendChild(payRateBtn);
        });
    }

    function populateWorkerFormForEdit(worker) {
        editingWorkerId = worker.id;
        workerFormTitle.textContent = 'Edit Worker';
        workerIdInput.value = editingWorkerId;
        workerNameInput.value = worker.name || '';
        workerEmployeeIdInput.value = worker.employee_id_number || '';
        workerPhoneNumberInput.value = worker.phone_number || '';
        workerAddressInput.value = worker.address || '';
        workerForm.style.display = 'block';
        showAddWorkerFormBtn.style.display = 'none';
        cancelWorkerEditBtn.style.display = 'inline-block';
        saveWorkerBtn.textContent = 'Update Worker';
        payRateSection.style.display = 'none';
    }

    function resetWorkerForm() {
        editingWorkerId = null;
        workerForm.reset();
        workerFormTitle.textContent = 'Add New Worker';
        workerIdInput.value = '';
        workerForm.style.display = 'none';
        showAddWorkerFormBtn.style.display = 'inline-block';
        cancelWorkerEditBtn.style.display = 'none';
        saveWorkerBtn.textContent = 'Save Worker';
    }

    showAddWorkerFormBtn.addEventListener('click', () => {
        resetWorkerForm();
        workerForm.style.display = 'block';
        showAddWorkerFormBtn.style.display = 'none';
        cancelWorkerEditBtn.style.display = 'inline-block';
        payRateSection.style.display = 'none';
    });

    cancelWorkerEditBtn.addEventListener('click', resetWorkerForm);

    workerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const workerData = {
            name: workerNameInput.value,
            employee_id_number: workerEmployeeIdInput.value,
            phone_number: workerPhoneNumberInput.value,
            address: workerAddressInput.value
        };

        if (!workerData.name) {
            showMessage('Worker name is required.', 'error');
            return;
        }

        try {
            if (editingWorkerId) {
                await makeApiCall(`${API_BASE_URL}/api/workers/${editingWorkerId}`, 'PUT', workerData);
                showMessage('Worker updated successfully!', 'success');
            } else {
                await makeApiCall(`${API_BASE_URL}/api/workers`, 'POST', workerData);
                showMessage('Worker added successfully!', 'success');
            }
            resetWorkerForm();
            loadWorkers();
        } catch (error) {
            showMessage(`Error saving worker: ${error.message}`, 'error');
        }
    });

    // --- Pay Rate Management ---
    async function openPayRateSection(worker) {
        resetWorkerForm();
        workerForm.style.display = 'none';
        showAddWorkerFormBtn.style.display = 'inline-block';
        payRateWorkerIdInput.value = worker.id;
        payRateWorkerName.textContent = `Pay Rates for ${worker.name}`;
        payRateSection.style.display = 'block';
        addPayRateForm.reset();
        await loadPayRates(worker.id);
    }

    closePayRateSectionBtn.addEventListener('click', () => {
        payRateSection.style.display = 'none';
    });

    async function loadPayRates(currentWorkerId) {
        payRatesTableBody.innerHTML = '<tr><td colspan="3">Loading pay rates...</td></tr>';
        try {
            const rates = await makeApiCall(`${API_BASE_URL}/api/workers/${currentWorkerId}/pay-rates`);
            if (rates && Array.isArray(rates)) {
                renderPayRates(rates);
            } else {
                payRatesTableBody.innerHTML = '<tr><td colspan="3">No pay rates found.</td></tr>';
            }
        } catch (error) {
            showMessage(`Error loading pay rates: ${error.message}`, 'error');
            payRatesTableBody.innerHTML = `<tr><td colspan="3">Error: ${error.message}</td></tr>`;
        }
    }

    function renderPayRates(rates) {
        payRatesTableBody.innerHTML = '';
        if (!rates.length) {
            payRatesTableBody.innerHTML = '<tr><td colspan="3">No pay rates found. Add one.</td></tr>';
            return;
        }
        rates.sort((a,b) => new Date(b.effective_start_date) - new Date(a.effective_start_date));
        rates.forEach(rate => {
            const row = payRatesTableBody.insertRow();
            row.insertCell().textContent = `$${parseFloat(rate.rate_amount || rate.payRate || 0).toFixed(2)}`;
            row.insertCell().textContent = rate.effective_start_date ? new Date(rate.effective_start_date).toLocaleDateString() : '-';
            row.insertCell().textContent = rate.effective_end_date ? new Date(rate.effective_end_date).toLocaleDateString() : 'Current';
        });
    }

    addPayRateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const workerIdForPayRate = payRateWorkerIdInput.value;
        const payRateData = {
            rateAmount: parseFloat(rateAmountInput.value),
            effectiveStartDate: effectiveStartDateInput.value
        };

        if (!payRateData.rateAmount || !payRateData.effectiveStartDate) {
            showMessage('Rate amount and start date are required.', 'error');
            return;
        }

        try {
            await makeApiCall(`${API_BASE_URL}/api/workers/${workerIdForPayRate}/pay-rates`, 'POST', payRateData);
            showMessage('Pay rate added successfully!', 'success');
            addPayRateForm.reset();
            loadPayRates(workerIdForPayRate);
        } catch (error) {
            showMessage(`Error adding pay rate: ${error.message}`, 'error');
        }
    });

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
            setTimeout(() => { messageArea.style.display = 'none'; }, 3000);
        }
    }

    loadWorkers();
});
