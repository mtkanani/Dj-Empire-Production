import { QrService } from '../services/qr.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Controller handling Ticket QR Code Generation
 */
export class QrController {
  static generateQrTicket = asyncHandler(async (req, res) => {
    const { bookingId, ticketId } = req.params;
    const data = await QrService.generateTicketQr(bookingId, ticketId, req.user.userId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Cryptographic QR ticket payload generated successfully',
      data,
    });
  });
}
