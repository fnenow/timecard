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
    const result = await pool.query('SELECT * FROM workers ORDER BY worker_id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workers', details: err.message });
  }
};

// Get a worker by ID (GET /api/workers/:workerId)
exports.getWorkerById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM workers WHERE worker_id = $1', [req.params.workerId]);
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
      'UPDATE workers SET name = $1 WHERE worker_id = $2 RETURNING *',
      [name, req.params.workerId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update worker', details: err.message });
  }
};

// GET /api/workers/statuses — LIVE worker clock-in/out status for dashboard!
exports.getWorkerStatuses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.worker_id, w.name,
        ce.project_id, p.project_name,
        ce.clock_in_time
      FROM workers w
      LEFT JOIN LATERAL (
        SELECT *
        FROM clock_entries
        WHERE worker_id = w.worker_id
          AND clock_in_time IS NOT NULL
          AND clock_out_time IS NULL
        ORDER BY clock_in_time DESC
        LIMIT 1
      ) ce ON TRUE
      LEFT JOIN projects p ON ce.project_id = p.project_id
      ORDER BY w.worker_id
    `);
    // Each row: if clock_in_time is NOT NULL, worker is clocked in
    res.json(result.rows.map(row => ({
      worker_id: row.worker_id,
      name: row.name,
      project_name: row.project_name,
      clock_in_time: row.clock_in_time
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load worker statuses', details: err.message });
  }
};

// POST /api/workers/:workerId/pay-rates
exports.addPayRate = async (req, res) => {
  const workerId = req.params.workerId;
  const { rateAmount, effectiveStartDate } = req.body;

  if (!workerId || !rateAmount || !effectiveStartDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO pay_rates (worker_id, rate_amount, effective_start_date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [workerId, rateAmount, effectiveStartDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add pay rate', details: err.message });
  }
};

// GET /api/workers/:workerId/pay-rates
exports.getPayRatesForWorker = async (req, res) => {
  const workerId = req.params.workerId;
  try {
    const result = await pool.query(
      `SELECT * FROM pay_rates WHERE worker_id = $1 ORDER BY effective_start_date DESC`,
      [workerId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load pay rates', details: err.message });
  }
};

// GET /api/workers/:workerId/time-entries
exports.getWorkerTimeEntries = async (req, res) => {
  const workerId = req.params.workerId;
  try {
    const result = await pool.query(
      `SELECT ce.*, p.project_name
       FROM clock_entries ce
       JOIN projects p ON ce.project_id = p.project_id
       WHERE ce.worker_id = $1
       ORDER BY ce.clock_in_time DESC`,
      [workerId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load time entries', details: err.message });
  }
};
