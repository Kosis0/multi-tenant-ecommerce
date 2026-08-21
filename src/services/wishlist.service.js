const pool = require('../config/db');
const { NotFoundError, BadRequestError } = require('../errors');

/**
 * Retrieves wishlist product IDs for a given session.
 */
const getWishlist = async (tenantId, sessionId) => {
  if (!sessionId || typeof sessionId !== 'string') {
    return [];
  }

  const { rows } = await pool.query(
    'SELECT product_id FROM wishlists WHERE tenant_id = $1 AND session_id = $2',
    [tenantId, sessionId.trim()]
  );

  return rows.map((r) => r.product_id);
};

/**
 * Adds a product to the session's wishlist.
 * Fixes VULN-10: Validates that the product belongs to the current tenant.
 */
const addToWishlist = async (tenantId, { sessionId, productId }) => {
  if (!sessionId) {
    throw new BadRequestError('Session ID required');
  }

  // Tenant Boundary Check: Ensure product exists in this tenant
  const productCheck = await pool.query(
    'SELECT 1 FROM products WHERE id = $1 AND tenant_id = $2',
    [productId, tenantId]
  );

  if (productCheck.rows.length === 0) {
    throw new NotFoundError('Product not found in this store');
  }

  await pool.query(
    'INSERT INTO wishlists (tenant_id, session_id, product_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
    [tenantId, sessionId.trim(), productId]
  );

  return { added: true };
};

/**
 * Removes a product from the session's wishlist.
 */
const removeFromWishlist = async (tenantId, sessionId, productId) => {
  if (!sessionId) {
    throw new BadRequestError('Session ID required');
  }

  await pool.query(
    'DELETE FROM wishlists WHERE tenant_id = $1 AND session_id = $2 AND product_id = $3',
    [tenantId, sessionId.trim(), productId]
  );

  return { removed: true };
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
