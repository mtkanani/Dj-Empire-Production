import { DeviceService } from '../services/device.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import { AppError } from '../../../utils/AppError.js';

/**
 * Controller handling Scanner Device Registration & Management
 */
export class DeviceController {
  static registerDevice = asyncHandler(async (req, res) => {
    const data = await DeviceService.registerDevice(req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Scanner device registered successfully and API key issued',
      data,
    });
  });

  static getDevices = asyncHandler(async (req, res) => {
    const { eventId } = req.query;
    if (!eventId) {
      throw new AppError('eventId query parameter is required', HTTP_STATUS.BAD_REQUEST);
    }
    const data = await DeviceService.getDevicesByEvent(eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Scanner devices retrieved',
      data,
    });
  });

  static deleteDevice = asyncHandler(async (req, res) => {
    await DeviceService.deleteDevice(req.params.deviceId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Scanner device de-registered',
    });
  });
}
