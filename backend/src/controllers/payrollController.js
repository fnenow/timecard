const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const payrollService = require('../services/payrollService');

// 1. Flat payroll report (for the table)
exports.listPayrollEntries = async (req, res) => {
  // Query params: start, end, worker, project
  const { start, end, worker, project } = req.query;
  let where = [];
  let params = [];
  let idx = 1;

  if (start)   { where.push(`clock_in_time >= $${idx++}`); params.push(start); }
  if (end)     { where.push(`clock_in_time <= $${idx++}`); params.push(end); }
  if (worker)  { where.push(`ce.worker_id = $${idx++}`);   params.push(worker); }
  if (project) { where.push(`ce.project_id = $${idx++}`);  params.push(project); }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const sql = `
    SELECT ce.*, w.name AS worker_name, p.project_name
    FROM clock_entries ce
    JOIN workers w ON ce.worker_id = w.worker_id
    JOIN projects p ON ce.project_id = p.project_id
    ${whereClause}
    ORDER BY ce.clock_in_time ASC
  `;
  try {
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load payroll', details: err.message });
  }
};

// 2. (Optional) Grouped/summarized report
exports.generatePayrollReport = async (req, res) => {
    try {
        const filters = req.query; // { start, end, worker, project }
        // ...same as above, fetch data, then:
        // const report = payrollService.calculatePayroll(clockEntries, ...);
        res.status(200).json({ message: 'TODO: Implement grouped report', report: {} });
    } catch (error) {
        res.status(500).json({ message: 'Error generating payroll report', error: error.message });
    }
};

// 3. Update billing
exports.updateBillingInfo = async (req, res) => {
    try {
        const { entryId } = req.params;
        const { bill_number, worker_paid_date } = req.body;
        const result = await pool.query(
          `UPDATE clock_entries SET bill_number = $1, worker_paid_date = $2, updated_at = NOW()
           WHERE entry_id = $3 RETURNING *`,
          [bill_number, worker_paid_date, entryId]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ message: 'Clock entry not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating billing info', error: error.message });
    }
};
