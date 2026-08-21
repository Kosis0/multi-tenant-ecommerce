const pool = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function main() {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', ['owner@nike.com']);
  if (rows.length === 0) {
    console.log('No user found');
    process.exit();
  }
  const user = rows[0];
  console.log('User found:', user.email, 'Role:', user.role);

  const passwords = ['admin123', 'password', 'password123', '12345678', 'admin', 'nike123', 'Dani12elA_18', 'Dani12elA'];
  let matched = false;
  for (const p of passwords) {
    const ok = await bcrypt.compare(p, user.password_hash);
    if (ok) {
      console.log('✅ MATCH FOUND! Password is:', p);
      matched = true;
      break;
    }
  }
  if (!matched) {
    console.log('❌ None of the common passwords matched the hash.');
  }
  process.exit();
}

main();
