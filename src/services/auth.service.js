const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { withTransaction } = require('../config/db');
const env = require('../config/env');
const RESERVED_SLUGS = require('../constants/reservedSlugs');
const { ROLES } = require('../constants/roles');
const { BadRequestError, UnauthorizedError, ConflictError } = require('../errors');

const DEFAULT_CATEGORIES = [
  ['Phones', '📱'],
  ['Computers', '💻'],
  ['Smartwatch', '⌚'],
  ['Camera', '📷'],
  ['Headphones', '🎧'],
  ['Gaming', '🎮']
];

/**
 * Onboards a new merchant and tenant store inside an isolated database transaction.
 */
const registerStore = async ({ name, slug, email, password }) => {
  const normalizedSlug = slug.toLowerCase().trim();
  const normalizedEmail = email.toLowerCase().trim();

  if (RESERVED_SLUGS.has(normalizedSlug)) {
    throw new BadRequestError(`Slug '${normalizedSlug}' is reserved and cannot be registered.`);
  }

  return withTransaction(async (client) => {
    // Check if slug is already taken
    const slugCheck = await client.query('SELECT 1 FROM tenants WHERE slug = $1', [normalizedSlug]);
    if (slugCheck.rows.length > 0) {
      throw new ConflictError('Slug already exists');
    }

    // Check if merchant email already exists
    const emailCheck = await client.query('SELECT 1 FROM users WHERE email = $1', [normalizedEmail]);
    if (emailCheck.rows.length > 0) {
      throw new ConflictError('Email already exists');
    }

    // Insert new tenant
    const tenantRes = await client.query(
      'INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING *',
      [name.trim(), normalizedSlug]
    );
    const tenant = tenantRes.rows[0];

    // Hash password & insert owner user
    const passwordHash = await bcrypt.hash(password, 10);
    const userRes = await client.query(
      'INSERT INTO users (email, password_hash, tenant_id, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role, tenant_id',
      [normalizedEmail, passwordHash, tenant.id, ROLES.OWNER]
    );
    const user = userRes.rows[0];

    // Seed default categories
    for (const [catName, icon] of DEFAULT_CATEGORIES) {
      await client.query(
        'INSERT INTO categories (tenant_id, name, icon) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [tenant.id, catName, icon]
      );
    }

    return { tenant, user };
  });
};

/**
 * Authenticates store owner / admin.
 */
const loginOwner = async ({ email, password, tenantSlug }) => {
  const normalizedEmail = email.toLowerCase().trim();

  let query = `
    SELECT u.*, t.slug AS tenant_slug 
    FROM users u 
    JOIN tenants t ON u.tenant_id = t.id 
    WHERE u.email = $1
  `;
  const queryParams = [normalizedEmail];

  if (tenantSlug && typeof tenantSlug === 'string' && tenantSlug.trim()) {
    query += ` AND t.slug = $2`;
    queryParams.push(tenantSlug.toLowerCase().trim());
  }

  const { rows } = await pool.query(query, queryParams);

  if (rows.length === 0) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const token = jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role || ROLES.OWNER,
      tokenVersion: user.token_version || 1
    },
    env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  return {
    token,
    tenantSlug: user.tenant_slug
  };
};

module.exports = {
  registerStore,
  loginOwner
};
