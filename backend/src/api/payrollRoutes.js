const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
// const { protect, admin } = require('../middleware/authMiddleware'); // Future

router.get('/report', /* admin, */ payrollController.generatePayrollReport);
router.put('/time-entries/:entryId/billing', /* admin, */ payrollController.updateBillingInfo);

module.exports = router;