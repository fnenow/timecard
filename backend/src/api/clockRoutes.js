const express = require('express');
const router = express.Router();
const clockController = require('../controllers/clockController');
// const { protect } = require('../middleware/authMiddleware'); // Protect clock-in/out for logged-in workers

// These routes would typically be protected to ensure they are called by an authenticated worker
router.post('/in', /* protect, */ clockController.clockIn);
router.post('/out', /* protect, */ clockController.clockOut);

// Admin can manually adjust/create entries (more specific routes might be better)
// router.post('/admin/entry', /* protect, admin, */ clockController.manualEntry);

module.exports = router;