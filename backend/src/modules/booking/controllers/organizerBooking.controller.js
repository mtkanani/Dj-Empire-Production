import { BookingService } from '../services/booking.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Controller handling Organizer Event Bookings Endpoints
 */
export class OrganizerBookingController {
  static getOrganizerBookings = asyncHandler(async (req, res) => {
    const data = await BookingService.getOrganizerBookings(req.user.userId, req.query);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Organizer event bookings retrieved successfully',
      data: data.data,
      meta: data.meta,
    });
  });

  static getOrganizerBookingById = asyncHandler(async (req, res) => {
    const data = await BookingService.getBookingDetails(req.params.bookingId, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Organizer booking details retrieved',
      data,
    });
  });
}
