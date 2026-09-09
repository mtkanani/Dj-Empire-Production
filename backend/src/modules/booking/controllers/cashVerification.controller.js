import { CashVerificationService } from '../services/cashVerification.service.js';
import { BookingRepository } from '../repositories/booking.repository.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import { AppError } from '../../../utils/AppError.js';
import QRCode from 'qrcode';

export class CashVerificationController {
  static lookup = asyncHandler(async (req, res) => {
    const bookingNumber = req.query.bookingNumber || req.body?.bookingNumber;
    const data = await CashVerificationService.lookupByReference(req.user, bookingNumber);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Booking retrieved',
      data,
    });
  });

  static lookupQr = asyncHandler(async (req, res) => {
    const data = await CashVerificationService.lookupByQr(req.user, req.body.qrToken);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Booking retrieved from QR',
      data,
    });
  });

  static verify = asyncHandler(async (req, res) => {
    const result = await CashVerificationService.verifyCashReceived(req.user, req.params.bookingNumber);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: result.booking,
      meta: { alreadyVerified: result.alreadyVerified },
    });
  });

  static customerCashQr = asyncHandler(async (req, res) => {
    const booking = await BookingRepository.findById(req.params.bookingId);
    if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);
    if (req.user.role === 'CUSTOMER' && booking.customerId !== req.user.userId) {
      throw new AppError('Access denied', HTTP_STATUS.FORBIDDEN);
    }
    if (booking.paymentGateway !== 'CASH') {
      throw new AppError('This booking is not a cash payment', HTTP_STATUS.BAD_REQUEST);
    }

    const qr = CashVerificationService.buildCashQrToken(booking);
    const png = await QRCode.toBuffer(qr.token, {
      type: 'png',
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M',
    });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(HTTP_STATUS.OK).end(png);
  });
}
