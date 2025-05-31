const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
// const { protect, admin } = require('../middleware/authMiddleware'); // Future

router.post('/', /* admin, */ projectController.createProject);
router.get('/', projectController.getAllProjects); // Could be public or admin
router.get('/:projectId', projectController.getProjectById);
router.put('/:projectId', /* admin, */ projectController.updateProject);
// router.delete('/:projectId', /* admin, */ projectController.deleteProject);

module.exports = router;