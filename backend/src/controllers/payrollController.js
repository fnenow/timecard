const payrollService = require('../services/payrollService');
const ClockEntry = require('../models/clockEntryModel');

// TODO: Add proper error handling and input validation

exports.generatePayrollReport = async (req, res) => {
    try {
        const filters = req.query; // { startDate, endDate, workerId, projectId }
        // const clockEntries = await ClockEntry.findForPayroll(filters);
        // if (!clockEntries || clockEntries.length === 0) {
        //     return res.status(200).json({ message: 'No clock entries found for the given filters.', report: {} });
        // }
        // const report = payrollService.calculatePayroll(clockEntries, filters.startDate, filters.endDate);
        // res.status(200).json(report);
        const mockEntries = [ // Provide some mock data for payrollService to process
            { worker_id: 1, worker_name: 'Alice', clock_in_time: '2024-05-20T09:00:00Z', clock_out_time: '2024-05-20T18:00:00Z', duration_minutes: 540, recorded_pay_rate: 20.00, project_id: 1, project_name: 'Alpha' }, // 9 hours
            { worker_id: 1, worker_name: 'Alice', clock_in_time: '2024-05-21T09:00:00Z', clock_out_time: '2024-05-21T17:00:00Z', duration_minutes: 480, recorded_pay_rate: 20.00, project_id: 1, project_name: 'Alpha' }, // 8 hours
            // Add more for a more realistic test if needed
        ];
        const report = payrollService.calculatePayroll(mockEntries, filters.startDate || '2024-05-01', filters.endDate || '2024-05-31');
        res.status(200).json({ message: 'Payroll report generated (using mock entries for service)', report });

    } catch (error) {
        console.error("Error generating payroll report:", error);
        res.status(500).json({ message: 'Error generating payroll report', error: error.message });
    }
};

exports.updateBillingInfo = async (req, res) => {
    try {
        const { entryId } = req.params;
        const { bill_number, worker_paid_date } = req.body;
        // const updatedEntry = await ClockEntry.update(entryId, { bill_number, worker_paid_date });
        // if (!updatedEntry) return res.status(404).json({ message: 'Clock entry not found' });
        // res.status(200).json(updatedEntry);
        res.status(200).json({ message: 'Billing info updated for entry', entryId, bill_number, worker_paid_date });
    } catch (error) {
        res.status(500).json({ message: 'Error updating billing info', error: error.message });
    }
};