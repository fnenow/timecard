//v3
const { DataTypes, Op } = require('sequelize');
const sequelize = require('./index');

const ClockEntry = sequelize.define('ClockEntry', {
  entry_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  worker_id: { type: DataTypes.INTEGER, allowNull: false },
  project_id: { type: DataTypes.INTEGER, allowNull: false },
  clock_in_time: { type: DataTypes.DATE, allowNull: false },
  clock_out_time: { type: DataTypes.DATE, allowNull: true },
  duration_minutes: { type: DataTypes.INTEGER, allowNull: true },
  notes: { type: DataTypes.STRING, allowNull: true },
  bill_number: { type: DataTypes.STRING, allowNull: true },
  worker_paid_date: { type: DataTypes.DATE, allowNull: true },
  recorded_pay_rate: { type: DataTypes.FLOAT, allowNull: true }
}, {
  tableName: 'clock_entries',
  timestamps: false,
});

ClockEntry.findByWorkerId = async function(workerId, filters = {}) {
  const where = { worker_id: workerId };
  if (filters.startDate) where.clock_in_time = { [Op.gte]: filters.startDate };
  if (filters.endDate) {
    where.clock_out_time = where.clock_out_time || {};
    where.clock_out_time[Op.lte] = filters.endDate;
  }
  return ClockEntry.findAll({ where });
};

ClockEntry.getCurrentStatuses = async function() {
  // Example of a raw query to get current status for all workers (clocked in)
  const [results] = await sequelize.query(`
    SELECT w.worker_id, w.name, ce.project_id, p.project_name, ce.clock_in_time
    FROM workers w
    LEFT JOIN clock_entries ce ON w.worker_id = ce.worker_id AND ce.clock_out_time IS NULL
    LEFT JOIN projects p ON ce.project_id = p.project_id
    ORDER BY w.name;
  `);
  return results;
};

module.exports = ClockEntry;
