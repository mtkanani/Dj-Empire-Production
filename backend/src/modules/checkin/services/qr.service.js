import { BookingStatus } from '@prisma/client';
import { QrCryptoUtil } from '../utils/qrCrypto.util.js';
import { BookingRepository } from '../../booking/repositories/booking.repository.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

const QR_ELIGIBLE = new Set([BookingStatus.Confirmed, BookingStatus.CheckedIn]);

/**
 * Service for Encrypted Cryptographic Ticket QR Code Generation
 * Issues one signed QR token per issued ticket in a booking.
 */
export class CheckInQrService {
  static buildTicketToken(booking, ticket) {
    return QrCryptoUtil.createSignedQrToken({
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      eventId: booking.eventId,
      ticketId: ticket ? ticket.id : null,
      ticketCode: ticket ? ticket.ticketCode : null,
    });
  }

  static async generateQrForBooking(bookingId) {
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);

    if (!QR_ELIGIBLE.has(booking.bookingStatus)) {
      throw new AppError('QR Token is only available for Confirmed bookings', HTTP_STATUS.BAD_REQUEST);
    }

    const tickets = booking.tickets || [];
    const ticketQrs = tickets.map((ticket) => {
      const qrResult = this.buildTicketToken(booking, ticket);
      return {
        ticketId: ticket.id,
        ticketCode: ticket.ticketCode,
        status: ticket.status,
        qrToken: qrResult.token,
        signature: qrResult.signature,
      };
    });

    const primary = ticketQrs[0] || null;
    const fallback = primary
      ? null
      : this.buildTicketToken(booking, null);

    return {
      bookingNumber: booking.bookingNumber,
      totalTickets: ticketQrs.length || 1,
      tickets: ticketQrs,
      qrToken: primary?.qrToken || fallback?.token,
      ticketCode: primary?.ticketCode || null,
      signature: primary?.signature || fallback?.signature,
      expiresAt: booking.event?.endDate || null,
    };
  }

  static verifyQrToken(qrToken) {
    return QrCryptoUtil.verifyQrToken(qrToken);
  }
}
