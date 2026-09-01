import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

/**
 * Custom Operational Application Error Class
 */
export class AppError extends Error {
  /**
   * @param {string} message - Error summary message
   * @param {number} [statusCode=500] - HTTP Status code
   * @param {Array} [errors=[]] - Array of specific field errors
   */
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = []) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}
