/**
 * Wraps an async route handler or middleware to automatically forward rejections to Express next(err).
 *
 * @param {Function} fn - Async express route handler (req, res, next)
 * @returns {Function} Express middleware handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
