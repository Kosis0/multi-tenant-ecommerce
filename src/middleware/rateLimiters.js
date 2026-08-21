const { rateLimit } = require('express-rate-limit');
const env = require('../config/env');

const createLimiter = (windowMinutes, maxRequests, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit'],
    message: { success: false, error: message }
  });

module.exports = {
  globalLimiter: createLimiter(15, 300, 'Too many requests from this IP, please try again later.'),
  authLimiter: createLimiter(15, 15, 'Too many authentication attempts, please try again later.'),
  checkoutLimiter: createLimiter(15, 30, 'Too many checkout requests, please try again shortly.'),
  reviewLimiter: createLimiter(15, 20, 'Too many reviews submitted, please try again later.'),
  uploadLimiter: createLimiter(15, 20, 'Upload rate limit exceeded, please try again later.')
};
