import { ReservationService } from '../services/reservation.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Controller handling 15-Minute Inventory Reservations
 */
export class ReservationController {
  static createReservation = asyncHandler(async (req, res) => {
    const data = await ReservationService.reserveInventory(req.user.userId, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Inventory reserved for 15 minutes. Please complete booking checkout.',
      data,
    });
  });

  static getReservation = asyncHandler(async (req, res) => {
    const data = await ReservationService.getReservation(req.params.reservationId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Reservation lock details retrieved',
      data,
    });
  });

  static cancelReservation = asyncHandler(async (req, res) => {
    const result = await ReservationService.cancelReservation(req.params.reservationId, req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
    });
  });
}
