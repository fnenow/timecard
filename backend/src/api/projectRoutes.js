const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
// const { protect, admin } = require('../middleware/authMiddleware'); // Future

// Only use the controller, not a local pool.query here!
router.get('/', projectController.getAllProjects);
router.post('/', /* admin, */ projectController.createProject);
router.get('/:projectId', projectController.getProjectById);
router.put('/:projectId', /* admin, */ projectController.updateProject);
// router.delete('/:projectId', /* admin, */ projectController.deleteProject);

module.exports = router;
