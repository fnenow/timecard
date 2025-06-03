const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Worker = require('./workerModel');

const PayRate = sequelize.define('PayRate', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  worker_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Worker, key: 'worker_id' } },
  rate_amount: { type: DataTypes.FLOAT, allowNull: false },
  effective_start_date: { type: DataTypes.DATEONLY, allowNull: false },
  effective_end_date: { type: DataTypes.DATEONLY, allowNull: true }
}, {
  tableName: 'pay_rates',
  timestamps: false,
});

PayRate.findByWorkerId = function(workerId) {
  return PayRate.findAll({
    where: { worker_id: workerId },
    order: [['effective_start_date', 'DESC']]
  });
};

module.exports = PayRate;
