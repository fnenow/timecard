//v2
const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Worker = sequelize.define('Worker', {
  worker_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  // Add other worker fields as needed
}, {
  tableName: 'workers',
  timestamps: false,
});

module.exports = Worker;
