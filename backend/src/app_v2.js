const sequelize = require('./models/index');

sequelize.authenticate().then(() => {
  console.log('Connected to PostgreSQL');
}).catch(err => {
  console.error('Unable to connect to DB:', err);
});

// To sync models (run once or use migrations for production)
sequelize.sync(); // { force: true } to drop/recreate tables (DANGEROUS!)
