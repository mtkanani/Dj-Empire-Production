import { HealthService } from '../services/health.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

/**
 * Health Controller handling HTTP request & response cycle
 */
export class HealthController {
  /**
   * GET /api/v1/health
   */
  static getHealth = asyncHandler(async (req, res) => {
    const healthData = await HealthService.getHealthStatus();

    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Server is running',
      data: healthData,
    });
  });
}
