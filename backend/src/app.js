//v3
const express = require('express');
const projectRoutes = require('./api/projectRoutes');
const clockRoutes = require('./api/clockRoutes');
const payrollRoutes = require('./api/payrollRoutes');

const app = express();
const cors = require('cors');
app.use(cors());
// Middleware, routes, etc.
app.use(express.json());


const sequelize = require('./models/index');
const workerRoutes = require('./api/workerRoutes');
app.use('/api/workers', workerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/clock',clockRoutes);
app.use('/api/payroll',payrollRoutes);


// Example worker route (add others as needed)
const workerController = require('./controllers/workerController');
app.get('/api/workers/:workerId/time-entries', workerController.getWorkerTimeEntries);
app.get('/api/workers/statuses', workerController.getWorkerStatuses);

// Test DB connection and sync models
sequelize.authenticate().then(() => {
  console.log('Connected to PostgreSQL');
  // sequelize.sync(); // Uncomment to auto-create tables (dev only)
}).catch(err => {
  console.error('Unable to connect to DB:', err);
});

module.exports = app;
