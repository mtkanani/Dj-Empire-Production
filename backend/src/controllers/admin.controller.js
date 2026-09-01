import { AdminService } from '../services/admin.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

/**
 * Controller handling Super Admin Authentication & Management Endpoints
 */
export class AdminController {
  // Admin Login
  static adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const deviceInfo = req.headers['user-agent'] || null;
    const result = await AdminService.adminLogin(email, password, deviceInfo);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Super Admin login successful',
      data: result,
    });
  });

  // Dashboard Analytics & Events
  static getDashboard = asyncHandler(async (req, res) => {
    const data = await AdminService.getDashboard();
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Dashboard metrics retrieved successfully',
      data,
    });
  });

  static getAllEvents = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const data = await AdminService.getAllEvents(status);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'All platform events retrieved successfully',
      data,
    });
  });

  // Organizer Management
  static getAllOrganizers = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const data = await AdminService.getAllOrganizers(status);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event Organizers retrieved successfully',
      data,
    });
  });

  static getOrganizerById = asyncHandler(async (req, res) => {
    const data = await AdminService.getOrganizerById(req.params.id);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Organizer details retrieved successfully',
      data,
    });
  });

  static approveOrganizer = asyncHandler(async (req, res) => {
    const result = await AdminService.approveOrganizer(req.params.id);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });

  static rejectOrganizer = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const result = await AdminService.rejectOrganizer(req.params.id, reason);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });

  static suspendOrganizer = asyncHandler(async (req, res) => {
    const result = await AdminService.suspendOrganizer(req.params.id);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });

  // Customer Management
  static getAllCustomers = asyncHandler(async (req, res) => {
    const data = await AdminService.getAllCustomers();
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Customers retrieved successfully',
      data,
    });
  });

  static getCustomerById = asyncHandler(async (req, res) => {
    const data = await AdminService.getCustomerById(req.params.id);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Customer details retrieved successfully',
      data,
    });
  });

  static suspendCustomer = asyncHandler(async (req, res) => {
    const result = await AdminService.suspendCustomer(req.params.id);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });

  static activateCustomer = asyncHandler(async (req, res) => {
    const result = await AdminService.activateCustomer(req.params.id);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });

  // Category CRUD
  static createCategory = asyncHandler(async (req, res) => {
    const data = await AdminService.createCategory(req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Category created successfully',
      data,
    });
  });

  static getAllCategories = asyncHandler(async (req, res) => {
    const data = await AdminService.getAllCategories();
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Categories retrieved successfully',
      data,
    });
  });

  static getCategoryById = asyncHandler(async (req, res) => {
    const data = await AdminService.getCategoryById(req.params.id);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Category details retrieved successfully',
      data,
    });
  });

  static updateCategory = asyncHandler(async (req, res) => {
    const data = await AdminService.updateCategory(req.params.id, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Category updated successfully',
      data,
    });
  });

  static deleteCategory = asyncHandler(async (req, res) => {
    await AdminService.deleteCategory(req.params.id);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Category deleted successfully',
    });
  });

  // City CRUD
  static createCity = asyncHandler(async (req, res) => {
    const data = await AdminService.createCity(req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'City created successfully',
      data,
    });
  });

  static getAllCities = asyncHandler(async (req, res) => {
    const data = await AdminService.getAllCities();
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Cities retrieved successfully',
      data,
    });
  });

  static getCityById = asyncHandler(async (req, res) => {
    const data = await AdminService.getCityById(req.params.id);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'City details retrieved successfully',
      data,
    });
  });

  static updateCity = asyncHandler(async (req, res) => {
    const data = await AdminService.updateCity(req.params.id, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'City updated successfully',
      data,
    });
  });

  static deleteCity = asyncHandler(async (req, res) => {
    await AdminService.deleteCity(req.params.id);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'City deleted successfully',
    });
  });

  // Venue CRUD
  static createVenue = asyncHandler(async (req, res) => {
    const data = await AdminService.createVenue(req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Venue created successfully',
      data,
    });
  });

  static getAllVenues = asyncHandler(async (req, res) => {
    const data = await AdminService.getAllVenues();
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Venues retrieved successfully',
      data,
    });
  });

  static getVenueById = asyncHandler(async (req, res) => {
    const data = await AdminService.getVenueById(req.params.id);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Venue details retrieved successfully',
      data,
    });
  });

  static updateVenue = asyncHandler(async (req, res) => {
    const data = await AdminService.updateVenue(req.params.id, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Venue updated successfully',
      data,
    });
  });

  static deleteVenue = asyncHandler(async (req, res) => {
    await AdminService.deleteVenue(req.params.id);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Venue deleted successfully',
    });
  });

  // Platform-wide Payments (all organizers / events)
  static getAllPayments = asyncHandler(async (req, res) => {
    const data = await AdminService.getAllPayments(req.query);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Platform payments retrieved successfully',
      data: data.data,
      meta: data.meta,
    });
  });
}
