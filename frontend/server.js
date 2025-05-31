const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the current directory (where server.js is)
app.use(express.static(path.join(__dirname, '')));

// New route to provide API configuration to the client
app.get('/config', (req, res) => {
  if (process.env.API_BASE_URL) {
    res.json({
      apiBaseUrl: process.env.API_BASE_URL
    });
  } else {
    // Send a clear error if the variable isn't set in Railway
    console.error('API_BASE_URL environment variable is not set!');
    res.status(500).json({ error: 'API configuration is missing on the server.' });
  }
});

app.listen(port, () => {
    console.log(`Frontend server listening at http://localhost:${port}`);
    if (!process.env.API_BASE_URL) {
        console.warn('Warning: API_BASE_URL environment variable is not set. API calls from frontend might fail.');
    } else {
        console.log(`API_BASE_URL is set to: ${process.env.API_BASE_URL}`);
    }
});
