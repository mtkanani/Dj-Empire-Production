import { TaxSettingService } from '../services/taxSetting.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export class TaxSettingController {
  /**
   * Get Current Tax Settings
   */
  static getTaxSettings = asyncHandler(async (req, res) => {
    const settings = await TaxSettingService.getTaxSettings();
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Tax settings retrieved successfully',
      data: settings,
    });
  });

  /**
   * Update Tax Settings (Admin Only)
   */
  static updateTaxSettings = asyncHandler(async (req, res) => {
    const updated = await TaxSettingService.updateTaxSettings(req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Tax settings updated successfully',
      data: updated,
    });
  });
}
