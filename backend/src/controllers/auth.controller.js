import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

/**
 * Controller handling Public Authentication Endpoints
 */
export class AuthController {
  /**
   * POST /api/v1/auth/customer/register
   */
  static registerCustomer = asyncHandler(async (req, res) => {
    const result = await AuthService.registerCustomer(req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: result.message,
      data: result,
    });
  });

  /**
   * POST /api/v1/auth/organizer/register
   */
  static registerOrganizer = asyncHandler(async (req, res) => {
    const result = await AuthService.registerOrganizer(req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: result.message,
      data: result,
    });
  });

  /**
   * POST /api/v1/auth/send-otp
   */
  static sendOtp = asyncHandler(async (req, res) => {
    const { email, purpose } = req.body;
    const result = await AuthService.sendOtp(email, purpose);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });

  /**
   * POST /api/v1/auth/verify-otp
   */
  static verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp, purpose } = req.body;
    const result = await AuthService.verifyOtp(email, otp, purpose);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: result,
    });
  });

  /**
   * POST /api/v1/auth/login
   */
  static login = asyncHandler(async (req, res) => {
    const identifier = req.body.identifier || req.body.email;
    const { password } = req.body;
    const deviceInfo = req.headers['user-agent'] || null;
    const result = await AuthService.login(identifier, password, deviceInfo);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Login successful',
      data: result,
    });
  });

  /**
   * POST /api/v1/auth/refresh-token
   */
  static refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Token refreshed successfully',
      data: result,
    });
  });

  /**
   * POST /api/v1/auth/logout
   */
  static logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await AuthService.logout(refreshToken);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });

  /**
   * POST /api/v1/auth/forgot-password
   */
  static forgotPassword = asyncHandler(async (req, res) => {
    const identifier = req.body.identifier || req.body.email;
    const result = await AuthService.forgotPassword(identifier);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: { requestId: result.requestId, cooldownSeconds: result.cooldownSeconds },
    });
  });

  static verifyResetOtp = asyncHandler(async (req, res) => {
    const requestId = req.body.requestId || req.body.resetToken;
    const result = await AuthService.verifyResetOtp(requestId, req.body.otp);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: { resetToken: result.resetToken, expiresInMinutes: result.expiresInMinutes },
    });
  });

  static resendResetOtp = asyncHandler(async (req, res) => {
    const result = await AuthService.resendResetOtp(req.body.requestId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: { cooldownSeconds: result.cooldownSeconds },
    });
  });

  static resetPassword = asyncHandler(async (req, res) => {
    const result = await AuthService.resetPassword(req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });
}
