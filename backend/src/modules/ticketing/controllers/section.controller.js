import { TicketingService } from '../services/ticketing.service.js';
import { InventoryService } from '../services/inventory.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Controller handling Event Section & Ticket Type Endpoints
 */
export class SectionController {
  // Event Sections
  static createSection = asyncHandler(async (req, res) => {
    const data = await TicketingService.createSection(req.params.eventId, req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Event section created successfully',
      data,
    });
  });

  static getSections = asyncHandler(async (req, res) => {
    const data = await TicketingService.getSections(req.params.eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event sections retrieved successfully',
      data,
    });
  });

  static getSectionById = asyncHandler(async (req, res) => {
    const data = await TicketingService.getSectionById(req.params.sectionId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Section details retrieved successfully',
      data,
    });
  });

  static updateSection = asyncHandler(async (req, res) => {
    const data = await TicketingService.updateSection(req.params.sectionId, req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event section updated successfully',
      data,
    });
  });

  static deleteSection = asyncHandler(async (req, res) => {
    await TicketingService.deleteSection(req.params.sectionId, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event section deleted successfully',
    });
  });

  // Ticket Types
  static createTicketType = asyncHandler(async (req, res) => {
    const data = await TicketingService.createTicketType(
      req.params.eventId,
      req.params.sectionId,
      req.user,
      req.body
    );
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Ticket type created successfully under section',
      data,
    });
  });

  static getTicketTypes = asyncHandler(async (req, res) => {
    const data = await TicketingService.getTicketTypes(req.params.sectionId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Ticket types retrieved successfully',
      data,
    });
  });

  static updateTicketType = asyncHandler(async (req, res) => {
    const data = await TicketingService.updateTicketType(req.params.id, req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Ticket type updated successfully',
      data,
    });
  });

  static deleteTicketType = asyncHandler(async (req, res) => {
    await TicketingService.deleteTicketType(req.params.id, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Ticket type deleted successfully',
    });
  });

  // Live Inventory & Real-Time Seat Map Handlers
  static getLiveInventory = asyncHandler(async (req, res) => {
    const data = await InventoryService.getLiveInventory(req.params.eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Live event inventory retrieved successfully',
      data,
    });
  });

  static getSectionSeats = asyncHandler(async (req, res) => {
    const data = await InventoryService.getSectionSeats(req.params.eventId, req.params.sectionId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Section seats grid retrieved successfully',
      data,
    });
  });

  static holdSeats = asyncHandler(async (req, res) => {
    const data = await InventoryService.holdSeats(req.user.userId, {
      eventId: req.params.eventId || req.body.eventId,
      sectionId: req.params.sectionId || req.body.sectionId,
      ticketTypeId: req.body.ticketTypeId,
      seatIds: req.body.seatIds || [],
      quantity: req.body.quantity || 1,
      items: req.body.items || [],
    });
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Seats held successfully',
      data,
    });
  });

  static setSeatsBlockedStatus = asyncHandler(async (req, res) => {
    const data = await InventoryService.setSeatsBlockedStatus(
      req.params.sectionId,
      req.body.seatIds || [],
      req.body.isBlocked !== false
    );
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: req.body.isBlocked !== false ? 'Seats blocked successfully' : 'Seats unblocked successfully',
      data,
    });
  });
}
