import { ScannerService } from '../services/scanner.service.js';
import { createScannerSchema, scannerLoginSchema, updateScannerSchema } from '../validations/scanner.validation.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

export class ScannerController {
  /**
   * Create Scanner Credentials (Event Organizer Only)
   */
  static createScanner = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const validatedData = createScannerSchema.parse(req.body);
    const scanner = await ScannerService.createScanner(req.user.userId, eventId, validatedData);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Scanner staff account created successfully',
      data: scanner,
    });
  });

  /**
   * Scanner Staff Login
   */
  static scannerLogin = asyncHandler(async (req, res) => {
    const validatedData = scannerLoginSchema.parse(req.body);
    const result = await ScannerService.authenticateScanner(validatedData);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Scanner authenticated successfully',
      data: result,
    });
  });

  /**
   * List Scanners for Event
   */
  static getEventScanners = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const scanners = await ScannerService.getEventScanners(req.user.userId, eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event scanners fetched successfully',
      data: scanners,
    });
  });

  /**
   * Update Scanner Account
   */
  static updateScanner = asyncHandler(async (req, res) => {
    const { scannerId } = req.params;
    const validatedData = updateScannerSchema.parse(req.body);
    const updated = await ScannerService.updateScanner(req.user.userId, scannerId, validatedData);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Scanner account updated successfully',
      data: updated,
    });
  });

  /**
   * Delete Scanner Account
   */
  static deleteScanner = asyncHandler(async (req, res) => {
    const { scannerId } = req.params;
    const result = await ScannerService.deleteScanner(req.user.userId, scannerId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Scanner account deleted successfully',
      data: result,
    });
  });

  /**
   * Get Organizer Dashboard Scanner Metrics & Counter
   */
  static getDashboardScannerMetrics = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const metrics = await ScannerService.getDashboardScannerMetrics(req.user.userId, eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Dashboard scanner metrics fetched successfully',
      data: metrics,
    });
  });
}
