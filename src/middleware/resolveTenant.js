const pool = require('../config/db');
const { sendError } = require('../utils/response');

/**
 * Resolves the tenant from headers, query parameters, or host subdomain.
 * Attaches the resolved tenant row to req.tenant.
 */
const resolveTenant = async (req, res, next) => {
  let slug = req.headers['x-tenant-slug'] || req.query.tenant;

  // Optional subdomain extraction fallback (e.g. storename.mercato.com)
  if (!slug && req.hostname) {
    const parts = req.hostname.split('.');
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'api') {
      slug = parts[0];
    }
  }

  if (!slug || typeof slug !== 'string') {
    return sendError(res, 'Tenant slug required', 400);
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM tenants WHERE slug = $1',
      [slug.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return sendError(res, 'Tenant not found', 404);
    }

    req.tenant = rows[0];
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = resolveTenant;
