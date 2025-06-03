const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');

// GET /api/payroll?start=YYYY-MM-DD&end=YYYY-MM-DD&worker=...&project=...
router.get('/', payrollController.listPayrollEntries); // New: List clock_entries with filters

// Advanced/grouped report (optional, for future): 
router.get('/report', payrollController.generatePayrollReport);

// Update billing info for a time entry
router.put('/time-entries/:entryId/billing', payrollController.updateBillingInfo);

module.exports = router;
