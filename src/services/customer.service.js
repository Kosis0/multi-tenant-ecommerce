const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const env = require('../config/env');
const { ROLES } = require('../constants/roles');
const { UnauthorizedError, ConflictError } = require('../errors');

/**
 * Registers a new customer for a specific store tenant.
 */
const registerCustomer = async (tenantId, { email, password, name, phone, address }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if customer already exists for this tenant
  const existing = await pool.query(
    'SELECT 1 FROM customers WHERE tenant_id = $1 AND email = $2',
    [tenantId, normalizedEmail]
  );
  if (existing.rows.length > 0) {
    throw new ConflictError('Email already registered in this store');
  }

  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO customers (tenant_id, email, password_hash, name, phone, address) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING id, email, name, phone, address`,
    [tenantId, normalizedEmail, hash, name || null, phone || null, address || null]
  );

  const customer = rows[0];
  const token = jwt.sign(
    {
      customerId: customer.id,
      tenantId,
      role: ROLES.CUSTOMER,
      tokenVersion: customer.token_version || 1
    },
    env.JWT_CUSTOMER_SECRET || env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, customer };
};

/**
 * Authenticates a customer within a specific store tenant context.
 */
const loginCustomer = async (tenantId, { email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const { rows } = await pool.query(
    'SELECT * FROM customers WHERE tenant_id = $1 AND email = $2',
    [tenantId, normalizedEmail]
  );

  if (rows.length === 0) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const customer = rows[0];
  const isMatch = await bcrypt.compare(password, customer.password_hash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const token = jwt.sign(
    {
      customerId: customer.id,
      tenantId: customer.tenant_id,
      role: ROLES.CUSTOMER,
      tokenVersion: customer.token_version || 1
    },
    env.JWT_CUSTOMER_SECRET || env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  delete customer.password_hash;
  return { token, customer };
};

/**
 * Retrieves orders placed by a customer in a specific store tenant.
 */
const getCustomerOrders = async (tenantId, customerId) => {
  const { rows } = await pool.query(
    `SELECT o.*, 
            COALESCE(json_agg(json_build_object(
              'id', oi.id, 
              'product_id', oi.product_id, 
              'quantity', oi.quantity, 
              'unit_price', oi.unit_price,
              'variant_info', oi.variant_info
            )) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     WHERE o.tenant_id = $1 AND o.customer_id = $2
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [tenantId, customerId]
  );

  return rows;
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerOrders
};
