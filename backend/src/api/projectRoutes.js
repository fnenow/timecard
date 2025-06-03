const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
// const { protect, admin } = require('../middleware/authMiddleware'); // Future
// In backend/src/api/projectRoutes.js or similar
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY project_id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects', details: err.message });
  }
});

router.post('/', /* admin, */ projectController.createProject);
router.get('/', projectController.getAllProjects); // Could be public or admin
router.get('/:projectId', projectController.getProjectById);
router.put('/:projectId', /* admin, */ projectController.updateProject);
// router.delete('/:projectId', /* admin, */ projectController.deleteProject);

module.exports = router;
