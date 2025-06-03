//v3
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create a new worker (POST /api/workers)
exports.createWorker = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Worker name is required' });

  try {
    const result = await pool.query(
      'INSERT INTO workers (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create worker', details: err.message });
  }
};

// Get all workers (GET /api/workers)
exports.getAllWorkers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM workers ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workers', details: err.message });
  }
};

// Get a worker by ID (GET /api/workers/:workerId)
exports.getWorkerById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM workers WHERE id = $1', [req.params.workerId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch worker', details: err.message });
  }
};

// Update a worker (PUT /api/workers/:workerId)
exports.updateWorker = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE workers SET name = $1 WHERE id = $2 RETURNING *',
      [name, req.params.workerId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update worker', details: err.message });
  }
};

// You can implement delete and more fields if needed!
