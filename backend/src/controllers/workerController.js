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
exports.getWorkerTimeEntries = async (req, res) => {
  try {
    const timeEntries = await ClockEntry.findByWorkerId(req.params.workerId, req.query);
    res.status(200).json(timeEntries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching time entries', error: error.message });
  }
};

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
exports.addPayRate = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { rateAmount, effectiveStartDate } = req.body;
        // const newPayRate = await PayRate.add(workerId, rateAmount, effectiveStartDate);
        // res.status(201).json(newPayRate);
        res.status(201).json({ message: 'PayRate.add called', workerId, rateAmount, effectiveStartDate });
    } catch (error) {
        res.status(500).json({ message: 'Error adding pay rate', error: error.message });
    }
};

exports.getPayRatesForWorker = async (req, res) => {
    try {
        // const payRates = await PayRate.findByWorkerId(req.params.workerId);
        // res.status(200).json(payRates);
        res.status(200).json({ message: 'PayRate.findByWorkerId called', workerId: req.params.workerId });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pay rates', error: error.message });
    }
};
exports.getWorkerStatuses = async (req, res) => {
    try {
        // const statuses = await ClockEntry.getCurrentStatuses();
        // res.status(200).json(statuses);
        res.status(200).json({ message: 'ClockEntry.getCurrentStatuses called' });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching worker statuses', error: error.message });
    }
};
// You can implement delete and more fields if needed!
