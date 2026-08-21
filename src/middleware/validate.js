const { z } = require('zod');
const { sendError } = require('../utils/response');

/**
 * Universal request validator middleware.
 * Supports passing either a single Zod schema (to validate req.body)
 * or an object containing { body, query, params } schemas.
 *
 * @param {z.ZodSchema | { body?: z.ZodSchema, query?: z.ZodSchema, params?: z.ZodSchema }} schemaOrTargets
 */
const validate = (schemaOrTargets) => {
  return (req, res, next) => {
    try {
      if (schemaOrTargets && typeof schemaOrTargets.parse === 'function') {
        // Direct schema passed -> validates req.body
        req.body = schemaOrTargets.parse(req.body);
        return next();
      }

      if (typeof schemaOrTargets === 'object') {
        const { body, query, params } = schemaOrTargets;
        if (body) req.body = body.parse(req.body);
        if (query) req.query = query.parse(req.query);
        if (params) req.params = params.parse(req.params);
        return next();
      }

      next();
    } catch (err) {
      if (err instanceof z.ZodError || err.name === 'ZodError') {
        const issues = err.issues || err.errors || [];
        const firstErrorMessage = issues[0]?.message || 'Validation error';
        const formattedDetails = issues.map((issue) => ({
          field: Array.isArray(issue.path) ? issue.path.join('.') : issue.path,
          message: issue.message
        }));
        return sendError(res, firstErrorMessage, 400, formattedDetails);
      }
      next(err);
    }
  };
};

module.exports = validate;
