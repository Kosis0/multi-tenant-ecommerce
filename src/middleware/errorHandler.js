const { AppError } = require('../errors');
const env = require('../config/env');

/**
 * Centralized application error handler middleware.
 */
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  // PostgreSQL Error Code Mapping
  if (err.code === '23505') {
    // Unique violation
    statusCode = 409;
    message = err.detail || 'A record with this unique identifier already exists';
  } else if (err.code === '23503') {
    // Foreign key violation
    statusCode = 400;
    message = 'Referenced parent resource does not exist';
  } else if (err.code === '22P02') {
    // Invalid text representation (UUID / integer syntax mismatch)
    statusCode = 400;
    message = 'Invalid identifier format supplied';
  } else if (err.code === '55P03') {
    // Lock timeout
    statusCode = 503;
    message = 'Resource is currently locked by another transaction, please retry';
  } else if (err.code === '23514') {
    // Check constraint violation (e.g. non-negative stock/price)
    statusCode = 400;
    message = 'Database integrity check constraint violation';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds the 5MB limit';
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  const isProduction = env.NODE_ENV === 'production';

  const response = {
    success: false,
    error: isProduction && statusCode === 500 ? 'Internal server error' : message,
    ...(details && { details }),
    ...(!isProduction && { stack: err.stack })
  };

  if (statusCode >= 500) {
    console.error(`[ERROR] [${req.method} ${req.originalUrl}] ${statusCode} - ${err.message}`, err.stack);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
