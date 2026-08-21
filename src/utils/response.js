/**
 * Standardized API response formatters.
 */

const sendSuccess = (res, data, status = 200) => {
  return res.status(status).json({
    success: true,
    data
  });
};

const sendError = (res, error, status = 400, details = null) => {
  const response = {
    success: false,
    error: typeof error === 'string' ? error : (error?.message || 'An error occurred'),
    ...(details && { details })
  };
  return res.status(status).json(response);
};

module.exports = {
  sendSuccess,
  sendError
};
