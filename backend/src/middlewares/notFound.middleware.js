import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

/**
 * 404 Route Not Found Middleware Handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Cannot find endpoint [${req.method}] ${req.originalUrl} on this server`,
    HTTP_STATUS.NOT_FOUND
  );
  next(error);
};
