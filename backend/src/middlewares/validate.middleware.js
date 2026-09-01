/**
 * Express validation middleware factory using Zod
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 * @returns {Function} Express middleware function
 */
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
