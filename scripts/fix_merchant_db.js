const pool = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function fixDatabase() {
  console.log('🔄 Running Database Self-Healing Migration...');
  
  // 1. Update all users in `users` table to have role = 'owner'
  const updateRoles = await pool.query(`
    UPDATE users 
    SET role = 'owner' 
    WHERE role IS NULL OR role = 'customer'
  `);
  console.log(`✅ Updated ${updateRoles.rowCount} merchant user(s) to role 'owner'.`);

  // 2. Set password for owner@nike.com to 'admin123'
  const hash = await bcrypt.hash('admin123', 10);
  const updateNike = await pool.query(`
    UPDATE users 
    SET password_hash = $1, role = 'owner' 
    WHERE email = 'owner@nike.com'
  `, [hash]);
  console.log(`✅ Set password for owner@nike.com to 'admin123' (${updateNike.rowCount} row).`);

  // 3. Ensure admin@example.com exists for Nike store
  const { rows: nikeTenant } = await pool.query("SELECT id FROM tenants WHERE slug = 'nike'");
  if (nikeTenant.length > 0) {
    const nikeId = nikeTenant[0].id;
    await pool.query("DELETE FROM users WHERE email = 'admin@example.com'");
    await pool.query(
      "INSERT INTO users (email, password_hash, tenant_id, role) VALUES ('admin@example.com', $1, $2, 'owner')",
      [hash, nikeId]
    );
    console.log("✅ Ensured 'admin@example.com' exists with password 'admin123' for Nike store.");
  }

  // 4. Verify all users
  const allUsers = await pool.query(`
    SELECT u.id, u.email, u.role, t.slug AS tenant_slug 
    FROM users u 
    LEFT JOIN tenants t ON u.tenant_id = t.id
  `);
  console.log('📋 Current Users in Database:', allUsers.rows);

  process.exit();
}

fixDatabase().catch(err => {
  console.error('❌ Migration Error:', err);
  process.exit(1);
});
