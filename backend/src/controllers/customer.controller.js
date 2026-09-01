import { CustomerService } from '../services/customer.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

/**
 * Controller handling Customer Endpoints
 */
export class CustomerController {
  // Profile Management
  static getProfile = asyncHandler(async (req, res) => {
    const data = await CustomerService.getProfile(req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Customer profile retrieved successfully',
      data,
    });
  });

  static updateProfile = asyncHandler(async (req, res) => {
    const data = await CustomerService.updateProfile(req.user.userId, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Customer profile updated successfully',
      data,
    });
  });

  static changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const result = await CustomerService.changePassword(req.user.userId, oldPassword, newPassword);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });

  static deleteAccount = asyncHandler(async (req, res) => {
    const result = await CustomerService.deleteAccount(req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });

  // Event Browsing & Search
  static browseEvents = asyncHandler(async (req, res) => {
    const data = await CustomerService.browseEvents(req.query);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Events retrieved successfully',
      data,
    });
  });

  static getEventDetails = asyncHandler(async (req, res) => {
    const data = await CustomerService.getEventDetails(req.params.id);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event details retrieved successfully',
      data,
    });
  });

  // Booking Management
  static createBooking = asyncHandler(async (req, res) => {
    const data = await CustomerService.createBooking(req.user.userId, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Booking created successfully! Tickets issued.',
      data,
    });
  });

  static getBookingHistory = asyncHandler(async (req, res) => {
    const data = await CustomerService.getBookingHistory(req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Booking history retrieved successfully',
      data,
    });
  });

  static getBookingDetails = asyncHandler(async (req, res) => {
    const data = await CustomerService.getBookingDetails(req.params.id, req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Booking details retrieved successfully',
      data,
    });
  });

  static cancelBooking = asyncHandler(async (req, res) => {
    const result = await CustomerService.cancelBooking(req.params.id, req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });

  // Ticket & QR Payload
  static downloadTicket = asyncHandler(async (req, res) => {
    const data = await CustomerService.downloadTicket(req.params.id, req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Ticket download payload generated successfully',
      data,
    });
  });

  static getQrTicketPayload = asyncHandler(async (req, res) => {
    const data = await CustomerService.getQrTicketPayload(req.params.id, req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'QR code ticket payload retrieved successfully',
      data,
    });
  });

  // Wishlist
  static addToWishlist = asyncHandler(async (req, res) => {
    const { eventId } = req.body;
    const data = await CustomerService.addToWishlist(req.user.userId, eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Event added to wishlist',
      data,
    });
  });

  static removeFromWishlist = asyncHandler(async (req, res) => {
    const result = await CustomerService.removeFromWishlist(req.user.userId, req.params.eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });

  static getWishlist = asyncHandler(async (req, res) => {
    const data = await CustomerService.getWishlist(req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Wishlist retrieved successfully',
      data,
    });
  });

  // Reviews & Ratings
  static createReview = asyncHandler(async (req, res) => {
    const data = await CustomerService.createReview(req.user.userId, req.params.eventId, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Review created successfully',
      data,
    });
  });

  static updateReview = asyncHandler(async (req, res) => {
    const data = await CustomerService.updateReview(req.user.userId, req.params.id, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Review updated successfully',
      data,
    });
  });

  static deleteReview = asyncHandler(async (req, res) => {
    const result = await CustomerService.deleteReview(req.user.userId, req.params.id);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });

  // Notifications
  static getNotifications = asyncHandler(async (req, res) => {
    const data = await CustomerService.getNotifications(req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Notifications retrieved successfully',
      data,
    });
  });

  static markNotificationAsRead = asyncHandler(async (req, res) => {
    const result = await CustomerService.markNotificationAsRead(req.user.userId, req.params.id);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });
}
