require('dotenv').config(); // For local .env file loading
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({		// Enable CORS for all routes
	origin: "https://site-production-52c4.up.railway.app",	// For development; restrict to your frontend origin in production!
	credentials: true
	})); 
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// --- Routers ---
const workerRoutes = require('./api/workerRoutes');
const projectRoutes = require('./api/projectRoutes');
const clockRoutes = require('./api/clockRoutes');
const payrollRoutes = require('./api/payrollRoutes');
// const authRoutes = require('./api/authRoutes'); // Future: for authentication

// --- API Routes ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is healthy and running!' });
});

app.use('/api/workers', workerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/clock', clockRoutes);
app.use('/api/payroll', payrollRoutes);
// app.use('/api/auth', authRoutes); // Future

// --- Serve Frontend (Optional: if not using a separate static site service) ---
// const path = require('path');
// app.use(express.static(path.join(__dirname, '../../../frontend')));
// // Handle SPA routing by sending index.html for any unhandled routes
// app.get('*', (req, res) => {
//   if (!req.path.startsWith('/api')) {
//     res.sendFile(path.join(__dirname, '../../../frontend/index.html'));
//   } else {
//     res.status(404).json({ message: 'API endpoint not found' });
//   }
// });


// --- Error Handling Middleware (Basic) ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server!', error: err.message });
});

module.exports = app;
