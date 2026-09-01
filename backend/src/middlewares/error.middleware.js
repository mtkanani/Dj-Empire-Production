import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ZodError } from 'zod';

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Log error using Winston logger
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
    stack: err.stack,
    errors,
  });

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = 'Validation failed';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Handle Prisma Database Known Errors
  if (err.code && err.code.startsWith('P')) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Database operation error (${err.code})`;
  }

  // Hide stack trace & internal error details in production
  const errorResponseMsg =
    env.NODE_ENV === 'production' && statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR
      ? 'Internal Server Error'
      : message;

  return ApiResponse.error(res, {
    statusCode,
    message: errorResponseMsg,
    errors,
  });
};
