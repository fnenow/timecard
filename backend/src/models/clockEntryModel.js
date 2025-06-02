const { DataTypes, Op } = require('sequelize');
const sequelize = require('./index'); // The connection instance

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
  timestamps: false
});

// Example: Fetch entries for a worker
ClockEntry.findByWorkerId = async function(workerId, filters = {}) {
  const where = { worker_id: workerId };
  if (filters.startDate) where.clock_in_time = { [Op.gte]: filters.startDate };
  if (filters.endDate) where.clock_out_time = { ...where.clock_out_time, [Op.lte]: filters.endDate };
  return ClockEntry.findAll({ where });
};

module.exports = ClockEntry;
