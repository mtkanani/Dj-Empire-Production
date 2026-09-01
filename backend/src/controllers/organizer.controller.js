import { OrganizerService } from '../services/organizer.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

/**
 * Controller handling Event Organizer Endpoints
 */
export class OrganizerController {
  // Profile Management
  static getProfile = asyncHandler(async (req, res) => {
    const data = await OrganizerService.getProfile(req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Organizer profile retrieved successfully',
      data,
    });
  });

  static updateProfile = asyncHandler(async (req, res) => {
    const data = await OrganizerService.updateProfile(req.user.userId, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Organizer profile updated successfully',
      data,
    });
  });

  // Event Management (CRUD & Publishing)
  static createEvent = asyncHandler(async (req, res) => {
    const data = await OrganizerService.createEvent(req.user.userId, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Event created in DRAFT status successfully',
      data,
    });
  });

  static getEvents = asyncHandler(async (req, res) => {
    const data = await OrganizerService.getEvents(req.user.userId, req.user.role);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Organizer events retrieved successfully',
      data,
    });
  });

  static getEventById = asyncHandler(async (req, res) => {
    const data = await OrganizerService.getEventById(req.params.id, req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event details retrieved successfully',
      data,
    });
  });

  static updateEvent = asyncHandler(async (req, res) => {
    const data = await OrganizerService.updateEvent(req.params.id, req.user.userId, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event updated successfully',
      data,
    });
  });

  static deleteEvent = asyncHandler(async (req, res) => {
    await OrganizerService.deleteEvent(req.params.id, req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event deleted successfully',
    });
  });

  static publishEvent = asyncHandler(async (req, res) => {
    const data = await OrganizerService.publishEvent(req.params.id, req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event published successfully and is now live for bookings',
      data,
    });
  });

  static unpublishEvent = asyncHandler(async (req, res) => {
    const data = await OrganizerService.unpublishEvent(req.params.id, req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event unpublished and reverted to DRAFT status',
      data,
    });
  });

  // Ticket Management
  static createTicketType = asyncHandler(async (req, res) => {
    const data = await OrganizerService.createTicketType(req.params.eventId, req.user.userId, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Ticket Type created successfully',
      data,
    });
  });

  static getTicketTypes = asyncHandler(async (req, res) => {
    const data = await OrganizerService.getTicketTypes(req.params.eventId, req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Ticket Types retrieved successfully',
      data,
    });
  });

  static updateTicketType = asyncHandler(async (req, res) => {
    const data = await OrganizerService.updateTicketType(req.params.id, req.user.userId, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Ticket Type updated successfully',
      data,
    });
  });

  static deleteTicketType = asyncHandler(async (req, res) => {
    await OrganizerService.deleteTicketType(req.params.id, req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Ticket Type deleted successfully',
    });
  });

  // Booking Dashboard
  static getBookings = asyncHandler(async (req, res) => {
    const data = await OrganizerService.getBookings(req.user.userId, req.user.role);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Organizer event bookings retrieved successfully',
      data,
    });
  });

  static getBookingById = asyncHandler(async (req, res) => {
    const data = await OrganizerService.getBookingById(req.params.id, req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Booking details retrieved successfully',
      data,
    });
  });

  // QR Check-In & Attendance
  static verifyTicket = asyncHandler(async (req, res) => {
    const { ticketCode } = req.body;
    const result = await OrganizerService.verifyTicket(req.user.userId, ticketCode);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: result,
    });
  });

  static markAttendance = asyncHandler(async (req, res) => {
    const { ticketCode } = req.body;
    const result = await OrganizerService.markAttendance(req.user.userId, ticketCode);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: result,
    });
  });

  // Analytics
  static getAnalytics = asyncHandler(async (req, res) => {
    const data = await OrganizerService.getAnalytics(req.user.userId, req.user.role);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Organizer analytics metrics retrieved successfully',
      data,
    });
  });
}
