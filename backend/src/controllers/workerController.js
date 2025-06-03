//v4 06/02/25 21:42
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

// GET /api/workers/statuses
exports.getWorkerStatuses = (req, res) => {
  // Placeholder: you can make this dynamic!
  res.json([
    { worker_id: 1, status: 'active' },
    { worker_id: 2, status: 'inactive' }
  ]);
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
exports.getWorkerTimeEntries = (req, res) => {
  // Implement DB logic as needed
  res.json([{ entryId: 1, workerId: req.params.workerId, hours: 8, date: '2024-01-01' }]);
};
