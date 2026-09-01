import { AttendanceService } from '../services/attendance.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Controller handling Attendance & Occupancy Dashboard Metrics
 */
export class AttendanceController {
  static getAttendance = asyncHandler(async (req, res) => {
    const data = await AttendanceService.getEventAttendance(req.params.eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event attendance metrics retrieved',
      data,
    });
  });

  static getLiveAttendance = asyncHandler(async (req, res) => {
    const data = await AttendanceService.getLiveAttendance(req.params.eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Real-time live attendance & occupancy metrics retrieved',
      data,
    });
  });

  static getCheckInHistory = asyncHandler(async (req, res) => {
    const data = await AttendanceService.getCheckInHistory(req.params.eventId, req.query);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Scan history audit logs retrieved',
      data: data.data,
      meta: data.meta,
    });
  });
}
