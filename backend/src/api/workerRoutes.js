const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
// const { protect, admin } = require('../middleware/authMiddleware'); // Future

// Public or Worker-specific (adjust middleware as needed)
router.get('/:workerId/time-entries', workerController.getWorkerTimeEntries); // For worker to see their own

// Admin routes (example, protect them later)
router.post('/', /* admin, */ workerController.createWorker);
router.get('/', /* admin, */ workerController.getAllWorkers);
router.get('/statuses', /* admin, */ workerController.getWorkerStatuses); // For admin dashboard
router.get('/:workerId', /* admin, */ workerController.getWorkerById);
router.put('/:workerId', /* admin, */ workerController.updateWorker);
// router.delete('/:workerId', /* admin, */ workerController.deleteWorker); // If needed

router.post('/:workerId/pay-rates', /* admin, */ workerController.addPayRate);
router.get('/:workerId/pay-rates', /* admin, */ workerController.getPayRatesForWorker);

module.exports = router;