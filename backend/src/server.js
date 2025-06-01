const app = require('./app');

const PORT = process.env.PORT || 3001; // Railway provides PORT

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Local health check: http://localhost:${PORT}/api/health`);
    }
});