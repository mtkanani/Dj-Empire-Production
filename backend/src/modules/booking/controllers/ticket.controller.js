import { TicketDeliveryService } from '../services/ticketDelivery.service.js';
import { CheckInService } from '../../checkin/services/checkin.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

export class TicketController {
  static getTicket = asyncHandler(async (req, res) => {
    const data = await TicketDeliveryService.getTicketData(req.params.bookingId, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Ticket data retrieved successfully',
      data,
    });
  });

  static downloadTicket = asyncHandler(async (req, res) => {
    const { pdf, filename } = await TicketDeliveryService.generatePdf(req.params.bookingId, req.user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(pdf));
    return res.status(HTTP_STATUS.OK).end(pdf);
  });

  static resendTicket = asyncHandler(async (req, res) => {
    const data = await TicketDeliveryService.resendTicketEmail(req.params.bookingId, req.user);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: `Ticket email resent with ${data.qrCodesAttached} unique QR code(s).`,
      data,
    });
  });

  static verifyTicket = asyncHandler(async (req, res) => {
    const data = await CheckInService.verifyTicketAndCheckIn(req.user, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: data.valid ? 'Ticket verified. Entry granted.' : data.message,
      data,
    });
  });
}
