import { BookingService } from '../services/booking.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Controller handling Customer My-Bookings Endpoints
 */
export class MyBookingController {
  static getMyBookings = asyncHandler(async (req, res) => {
    const data = await BookingService.getCustomerBookings(req.user.userId, req.query);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'My bookings retrieved successfully',
      data: data.data,
      meta: data.meta,
    });
  });

  static getMyBookingById = asyncHandler(async (req, res) => {
    const data = await BookingService.getBookingDetails(req.params.bookingId, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Booking details retrieved',
      data,
    });
  });

  static getMyUpcomingEvents = asyncHandler(async (req, res) => {
    const data = await BookingService.getCustomerBookings(req.user.userId, {
      ...req.query,
      bookingStatus: 'Confirmed',
    });
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'My upcoming booked events retrieved',
      data: data.data,
      meta: data.meta,
    });
  });

  static getMyPastEvents = asyncHandler(async (req, res) => {
    const data = await BookingService.getCustomerBookings(req.user.userId, {
      ...req.query,
      bookingStatus: 'CheckedIn',
    });
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'My past attended events retrieved',
      data: data.data,
      meta: data.meta,
    });
  });
}
