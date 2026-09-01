import { CheckInService } from '../services/checkin.service.js';
import { CheckInQrService } from '../services/qr.service.js';
import { OfflineSyncService } from '../services/offlineSync.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Controller handling Scan & Check-In Operations
 */
export class CheckInController {
  static generateQr = asyncHandler(async (req, res) => {
    const data = await CheckInQrService.generateQrForBooking(req.params.bookingId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Cryptographic QR ticket tokens generated successfully',
      data,
    });
  });

  static validateQr = asyncHandler(async (req, res) => {
    const data = await CheckInService.validateQr(req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'QR code validation details retrieved',
      data,
    });
  });

  static scanEntry = asyncHandler(async (req, res) => {
    const data = await CheckInService.scanEntry(req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Check-in completed successfully. Entry granted.',
      data,
    });
  });

  static manualCheckIn = asyncHandler(async (req, res) => {
    const data = await CheckInService.manualCheckIn(req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Manual check-in completed. Entry granted.',
      data,
    });
  });

  static revokeCheckIn = asyncHandler(async (req, res) => {
    const result = await CheckInService.revokeCheckIn(req.params.bookingId, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });

  static syncOffline = asyncHandler(async (req, res) => {
    const { deviceId, logs } = req.body;
    const result = await OfflineSyncService.syncOfflineLogs(deviceId, logs);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: result,
    });
  });
}
