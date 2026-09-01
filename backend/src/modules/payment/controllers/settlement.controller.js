import { SettlementService } from '../services/settlement.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Controller handling Organizer Settlements
 */
export class SettlementController {
  static getSettlements = asyncHandler(async (req, res) => {
    const data = await SettlementService.getOrganizerSettlements(req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Organizer payout settlements retrieved',
      data,
    });
  });
}
