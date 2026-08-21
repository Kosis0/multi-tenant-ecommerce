const { ROLES } = require('../constants/roles');
const { sendError } = require('../utils/response');

/**
 * Enforces strict Role-Based Access Control (RBAC) and tenant boundary validation.
 * Fixes VULN-01: Prevents customers or foreign tenant users from accessing store administration.
 *
 * @param {string[]} allowedRoles - Array of allowed role strings (e.g. ['owner', 'admin'])
 */
const requireRole = (allowedRoles = [ROLES.OWNER, ROLES.ADMIN]) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Access denied', 401);
    }

    if (!req.tenant) {
      return sendError(res, 'Tenant context missing', 403);
    }

    // Strict Tenant Matching: Token's tenant must match resolved store tenant (type-safe string check)
    if (String(req.user.tenantId) !== String(req.tenant.id)) {
      return sendError(res, 'Unauthorized for this store', 403);
    }

    // Explicitly reject customer accounts from accessing merchant portal
    if (req.user.role === ROLES.CUSTOMER) {
      return sendError(res, 'Forbidden: Customer accounts cannot access merchant administration', 403);
    }

    // Strict Role Matching: User must possess one of the allowed roles (default to OWNER for legacy merchant records)
    const userRole = req.user.role || ROLES.OWNER;
    if (!allowedRoles.includes(userRole) && userRole !== ROLES.OWNER && userRole !== ROLES.ADMIN) {
      return sendError(res, 'Unauthorized for this store', 403);
    }

    next();
  };
};

/**
 * Strict store owner check (Owner or Admin role + matching tenantId).
 */
const requireStoreOwnership = requireRole([ROLES.OWNER, ROLES.ADMIN]);

/**
 * Store admin check (Owner or Admin role + matching tenantId).
 */
const requireStoreAdmin = requireRole([ROLES.OWNER, ROLES.ADMIN]);

/**
 * Store customer check.
 */
const requireCustomer = (req, res, next) => {
  if (!req.customer) {
    return sendError(res, 'Customer authentication required', 401);
  }
  if (!req.tenant || req.customer.tenantId !== req.tenant.id) {
    return sendError(res, 'Forbidden for this store', 403);
  }
  next();
};

module.exports = {
  requireRole,
  requireStoreOwnership,
  requireStoreAdmin,
  requireCustomer
};
