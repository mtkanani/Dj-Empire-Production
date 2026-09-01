import { TicketingService } from '../services/ticketing.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Controller handling Inventory, Live Availability, Dynamic Pricing, Waitlist, Coupons, and Analytics
 */
export class InventoryController {
  // Inventory
  static getInventory = asyncHandler(async (req, res) => {
    const data = await TicketingService.getInventory(req.params.eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event inventory retrieved successfully',
      data,
    });
  });

  static updateInventory = asyncHandler(async (req, res) => {
    const data = await TicketingService.updateInventoryStock(req.params.id, req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Inventory stock updated successfully',
      data,
    });
  });

  static getLiveAvailability = asyncHandler(async (req, res) => {
    const data = await TicketingService.getLiveAvailability(req.params.eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Live ticket availability and occupancy statistics retrieved',
      data,
    });
  });

  // Dynamic Pricing
  static createPricingRule = asyncHandler(async (req, res) => {
    const data = await TicketingService.createPricingRule(req.params.eventId, req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Dynamic pricing rule created successfully',
      data,
    });
  });

  static getPricingRules = asyncHandler(async (req, res) => {
    const data = await TicketingService.getPricingRules(req.params.eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Dynamic pricing rules retrieved',
      data,
    });
  });

  // Booking Rules
  static upsertBookingRules = asyncHandler(async (req, res) => {
    const data = await TicketingService.upsertBookingRules(req.params.eventId, req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Booking rules saved successfully',
      data,
    });
  });

  static getBookingRules = asyncHandler(async (req, res) => {
    const data = await TicketingService.getBookingRules(req.params.eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Booking rules retrieved',
      data,
    });
  });

  // Waitlist
  static joinWaitlist = asyncHandler(async (req, res) => {
    const { customerEmail, ticketTypeId } = req.body;
    const data = await TicketingService.joinWaitlist(req.params.eventId, req.user, customerEmail, ticketTypeId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Joined waitlist successfully! We will notify you when tickets become available.',
      data,
    });
  });

  static getWaitlist = asyncHandler(async (req, res) => {
    const data = await TicketingService.getWaitlist(req.params.eventId, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Waitlist entries retrieved',
      data,
    });
  });

  // Coupons
  static createCoupon = asyncHandler(async (req, res) => {
    const data = await TicketingService.createCoupon(req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Coupon code created successfully',
      data,
    });
  });

  static validateCoupon = asyncHandler(async (req, res) => {
    const { code, orderAmount } = req.body;
    const data = await TicketingService.validateCoupon(code, orderAmount);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Coupon code validated successfully',
      data,
    });
  });

  // Analytics Dashboard
  static getTicketingDashboard = asyncHandler(async (req, res) => {
    const data = await TicketingService.getTicketingDashboard(req.params.eventId, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Ticketing analytics dashboard metrics retrieved',
      data,
    });
  });
}
