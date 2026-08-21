const app = require('./src/app');
const env = require('./src/config/env');
const pool = require('./src/config/db');
const setupProcessGuards = require('./src/utils/processGuards');

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[SERVER] Mercato platform backend listening on port ${PORT} [${env.NODE_ENV}]`);
});

// Setup process signal listeners & graceful shutdown guards
setupProcessGuards(server, pool);

module.exports = server;