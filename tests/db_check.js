const pool = require('../src/config/db');

async function checkDb() {
  try {
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Connected to DB successfully! Found tables:');
    console.log(tablesRes.rows.map(r => r.table_name));
    process.exit(0);
  } catch (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
}

checkDb();
