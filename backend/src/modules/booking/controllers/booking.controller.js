import { BookingService } from '../services/booking.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Controller handling Core Booking Endpoints
 */
export class BookingController {
  static createBooking = asyncHandler(async (req, res) => {
    const data = await BookingService.createBooking(req.user.userId, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Booking created successfully! Please complete payment.',
      data,
    });
  });

  static getBookings = asyncHandler(async (req, res) => {
    const data = await BookingService.getAdminBookings(req.query);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Bookings retrieved successfully',
      data: data.data,
      meta: data.meta,
    });
  });

  static getBookingById = asyncHandler(async (req, res) => {
    const data = await BookingService.getBookingDetails(req.params.bookingId, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Booking details retrieved successfully',
      data,
    });
  });

  static confirmBooking = asyncHandler(async (req, res) => {
    const { transactionId } = req.body;
    const data = await BookingService.confirmBooking(req.params.bookingId, transactionId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Booking confirmed successfully! Tickets issued.',
      data,
    });
  });

  static cancelBooking = asyncHandler(async (req, res) => {
    const { cancellationReason } = req.body;
    const result = await BookingService.cancelBooking(req.params.bookingId, req.user, cancellationReason);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });

  static getBookingItems = asyncHandler(async (req, res) => {
    const booking = await BookingService.getBookingDetails(req.params.bookingId, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Booking ticket items retrieved',
      data: booking.items,
    });
  });
}
