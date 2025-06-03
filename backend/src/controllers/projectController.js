const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// CREATE PROJECT
exports.createProject = async (req, res) => {
    const { project_name, description, is_active } = req.body;
    if (!project_name) return res.status(400).json({ error: 'Project name is required' });
    try {
        const result = await pool.query(
            `INSERT INTO projects (project_name, description, is_active)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [project_name, description, is_active !== undefined ? is_active : true]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error creating project', error: error.message });
    }
};

// GET ALL PROJECTS
exports.getAllProjects = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM projects ORDER BY project_id ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error: error.message });
    }
};

// GET PROJECT BY ID
exports.getProjectById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM projects WHERE project_id = $1', [req.params.projectId]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project', error: error.message });
    }
};

// UPDATE PROJECT
exports.updateProject = async (req, res) => {
    const { project_name, description, is_active } = req.body;
    try {
        const result = await pool.query(
            `UPDATE projects SET project_name = $1, description = $2, is_active = $3, updated_at = NOW()
             WHERE project_id = $4 RETURNING *`,
            [project_name, description, is_active, req.params.projectId]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating project', error: error.message });
    }
};
