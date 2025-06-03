//v3
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());


const sequelize = require('./models/index');
const workerRoutes = require('./api/workerRoutes');
app.use('/api/workers', workerRoutes);

// Middleware, routes, etc.
app.use(express.json());

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
