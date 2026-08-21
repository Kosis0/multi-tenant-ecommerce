const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { sendError } = require('../utils/response');

/**
 * Verifies merchant/admin JWT token from Authorization header.
 * Attaches decoded payload to req.user.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 'Access denied', 401);
  }

  jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return sendError(res, 'Invalid or expired token', 403);
    }
    req.user = decoded;
    next();
  });
};

/**
 * Verifies customer JWT token and guarantees tenant boundary isolation.
 * Attaches decoded payload to req.customer.
 */
const authenticateCustomerToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 'Unauthorized', 401);
  }

  const secret = env.JWT_CUSTOMER_SECRET || env.JWT_SECRET;
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return sendError(res, 'Forbidden', 403);
    }

    if (decoded.role !== 'customer' || (req.tenant && decoded.tenantId !== req.tenant.id)) {
      return sendError(res, 'Forbidden', 403);
    }

    req.customer = decoded;
    next();
  });
};

/**
 * Optionally verifies customer JWT token if present.
 * Does not block if token is missing or invalid.
 */
const optionalAuthenticateCustomerToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  const secret = env.JWT_CUSTOMER_SECRET || env.JWT_SECRET;
  jwt.verify(token, secret, (err, decoded) => {
    if (!err && decoded && decoded.role === 'customer') {
      if (!req.tenant || decoded.tenantId === req.tenant.id) {
        req.customer = decoded;
      }
    }
    next();
  });
};

module.exports = {
  authenticateToken,
  authenticateCustomerToken,
  optionalAuthenticateCustomerToken
};
