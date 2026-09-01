import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

/**
 * Standardized API Response Helper Class
 */
export class ApiResponse {
  /**
   * Send Standard Success Response
   * @param {import('express').Response} res
   * @param {Object} options
   * @param {number} [options.statusCode=200]
   * @param {string} [options.message='Success']
   * @param {Object|Array} [options.data={}]
   * @param {Object} [options.meta={}]
   */
  static success(
    res,
    { statusCode = HTTP_STATUS.OK, message = 'Success', data = {}, meta = {} } = {}
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  /**
   * Send Standard Error Response
   * @param {import('express').Response} res
   * @param {Object} options
   * @param {number} [options.statusCode=400]
   * @param {string} [options.message='Error']
   * @param {Array} [options.errors=[]]
   */
  static error(
    res,
    { statusCode = HTTP_STATUS.BAD_REQUEST, message = 'An error occurred', errors = [] } = {}
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      statusCode,
    });
  }
}
