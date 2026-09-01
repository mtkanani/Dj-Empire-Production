import { RefundService } from '../services/refund.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Controller handling Refund Processing
 */
export class RefundController {
  static processRefund = asyncHandler(async (req, res) => {
    const result = await RefundService.processRefund(req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: result,
    });
  });

  static getOrganizerRefunds = asyncHandler(async (req, res) => {
    const data = await RefundService.getOrganizerRefunds(req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Organizer refund records retrieved',
      data,
    });
  });
}
