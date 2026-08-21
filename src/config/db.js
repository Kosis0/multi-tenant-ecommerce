const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false // Required for Supabase SSL connections
  }
});

// Guard against idle connection network drops crashing the Node.js process
pool.on('error', (err) => {
  console.error('[DATABASE POOL ERROR] Unexpected idle client error:', err.message);
});

/**
 * Execute a sequence of queries within an isolated database transaction.
 * Automatically handles BEGIN, COMMIT, ROLLBACK and releases the client back to the pool.
 *
 * @param {Function} callback - Async function receiving the transactional pg client
 * @returns {Promise<any>}
 */
const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('[TRANSACTION ROLLBACK ERROR]:', rollbackErr.message);
    }
    throw err;
  } finally {
    client.release();
  }
};

module.exports = pool;
module.exports.pool = pool;
module.exports.withTransaction = withTransaction;
