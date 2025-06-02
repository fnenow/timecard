const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class Project {
    static async create(projectData) {
        const { project_name, is_active = true } = projectData;
        const result = await pool.query(
            'INSERT INTO projects (project_name, is_active) VALUES ($1, $2) RETURNING *',
            [project_name, is_active]
        );
        return result.rows[0];
    }

    static async findAll(filters = {}) {
        let query = 'SELECT * FROM projects';
        const queryParams = [];
        if (filters.active === 'true') {
            query += ' WHERE is_active = true';
        }
        query += ' ORDER BY project_name ASC';
        const result = await pool.query(query, queryParams);
        return result.rows;
    }

    static async findById(projectId) {
        const result = await pool.query(
            'SELECT * FROM projects WHERE id = $1',
            [projectId]
        );
        return result.rows[0] || null;
    }

    static async update(projectId, projectData) {
        // Example: Only updating project_name and is_active, but you can adjust fields as needed
        const { project_name, is_active } = projectData;
        const result = await pool.query(
            'UPDATE projects SET project_name = $1, is_active = $2 WHERE id = $3 RETURNING *',
            [project_name, is_active, projectId]
        );
        return result.rows[0];
    }
}

module.exports = Project;
