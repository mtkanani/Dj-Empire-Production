import { EventService } from '../services/event.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Controller handling Event CRUD, Status Transitions, and Sub-Resource APIs
 */
export class EventController {
  // Event Core CRUD
  static createEvent = asyncHandler(async (req, res) => {
    const data = await EventService.createEvent(req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Event created successfully in Draft status',
      data,
    });
  });

  static getEvents = asyncHandler(async (req, res) => {
    const data = await EventService.getEvents(req.user, req.query);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Events retrieved successfully',
      data: data.data,
      meta: data.meta,
    });
  });

  static getEventById = asyncHandler(async (req, res) => {
    const data = await EventService.getEventByIdOrSlug(req.params.id, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event details retrieved successfully',
      data,
    });
  });

  static updateEvent = asyncHandler(async (req, res) => {
    const data = await EventService.updateEvent(req.params.id, req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event updated successfully',
      data,
    });
  });

  static softDeleteEvent = asyncHandler(async (req, res) => {
    const result = await EventService.softDeleteEvent(req.params.id, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });

  static restoreEvent = asyncHandler(async (req, res) => {
    const result = await EventService.restoreEvent(req.params.id, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });

  static permanentDeleteEvent = asyncHandler(async (req, res) => {
    const result = await EventService.permanentDeleteEvent(req.params.id, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });

  // State Transitions
  static submitForApproval = asyncHandler(async (req, res) => {
    const data = await EventService.submitForApproval(req.params.id, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event submitted for Super Admin approval',
      data,
    });
  });

  static approveEvent = asyncHandler(async (req, res) => {
    const data = await EventService.approveEvent(req.params.id, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event approved successfully',
      data,
    });
  });

  static rejectEvent = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const data = await EventService.rejectEvent(req.params.id, reason, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event rejected',
      data,
    });
  });

  static publishEvent = asyncHandler(async (req, res) => {
    const data = await EventService.publishEvent(req.params.id, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event published live successfully',
      data,
    });
  });

  static unpublishEvent = asyncHandler(async (req, res) => {
    const data = await EventService.unpublishEvent(req.params.id, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event unpublished successfully',
      data,
    });
  });

  static cancelEvent = asyncHandler(async (req, res) => {
    const data = await EventService.cancelEvent(req.params.id, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event cancelled successfully',
      data,
    });
  });

  static archiveEvent = asyncHandler(async (req, res) => {
    const data = await EventService.archiveEvent(req.params.id, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event archived successfully',
      data,
    });
  });

  // Schedules
  static addSchedule = asyncHandler(async (req, res) => {
    const data = await EventService.addSchedule(req.params.eventId, req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Schedule added to event successfully',
      data,
    });
  });

  static getSchedules = asyncHandler(async (req, res) => {
    const data = await EventService.getSchedules(req.params.eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event schedules retrieved successfully',
      data,
    });
  });

  static updateSchedule = asyncHandler(async (req, res) => {
    const data = await EventService.updateSchedule(req.params.id, req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Schedule updated successfully',
      data,
    });
  });

  static deleteSchedule = asyncHandler(async (req, res) => {
    await EventService.deleteSchedule(req.params.id, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Schedule deleted successfully',
    });
  });

  // Venue
  static upsertVenue = asyncHandler(async (req, res) => {
    const data = await EventService.upsertVenue(req.params.eventId, req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event venue location details saved successfully',
      data,
    });
  });

  static getVenue = asyncHandler(async (req, res) => {
    const data = await EventService.getVenue(req.params.eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event venue location details retrieved',
      data,
    });
  });

  static deleteVenue = asyncHandler(async (req, res) => {
    await EventService.deleteVenue(req.params.eventId, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event venue location details removed',
    });
  });

  // Images
  static addImage = asyncHandler(async (req, res) => {
    const data = await EventService.addImage(req.params.eventId, req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Event image added successfully',
      data,
    });
  });

  static getImages = asyncHandler(async (req, res) => {
    const data = await EventService.getImages(req.params.eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event images retrieved successfully',
      data,
    });
  });

  static updateImage = asyncHandler(async (req, res) => {
    const data = await EventService.updateImage(req.params.id, req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event image details updated',
      data,
    });
  });

  static deleteImage = asyncHandler(async (req, res) => {
    await EventService.deleteImage(req.params.id, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event image deleted successfully',
    });
  });

  // FAQs
  static addFAQ = asyncHandler(async (req, res) => {
    const data = await EventService.addFAQ(req.params.eventId, req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'FAQ added successfully',
      data,
    });
  });

  static getFAQs = asyncHandler(async (req, res) => {
    const data = await EventService.getFAQs(req.params.eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event FAQs retrieved successfully',
      data,
    });
  });

  static updateFAQ = asyncHandler(async (req, res) => {
    const data = await EventService.updateFAQ(req.params.id, req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'FAQ updated successfully',
      data,
    });
  });

  static deleteFAQ = asyncHandler(async (req, res) => {
    await EventService.deleteFAQ(req.params.id, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'FAQ deleted successfully',
    });
  });

  // Policy & SEO
  static upsertPolicy = asyncHandler(async (req, res) => {
    const data = await EventService.upsertPolicy(req.params.eventId, req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event policies saved successfully',
      data,
    });
  });

  static getPolicy = asyncHandler(async (req, res) => {
    const data = await EventService.getPolicy(req.params.eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event policies retrieved successfully',
      data,
    });
  });

  static upsertSEO = asyncHandler(async (req, res) => {
    const data = await EventService.upsertSEO(req.params.eventId, req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event SEO metadata saved successfully',
      data,
    });
  });

  static getSEO = asyncHandler(async (req, res) => {
    const data = await EventService.getSEO(req.params.eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event SEO metadata retrieved successfully',
      data,
    });
  });
}
