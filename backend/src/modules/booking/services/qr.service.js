import { BookingRepository } from '../repositories/booking.repository.js';
import { generateTicketQrPayload } from '../utils/qrGenerator.util.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Service generating cryptographic QR Code payloads for confirmed tickets
 */
export class QrService {
  static async generateTicketQr(bookingId, ticketId, userId) {
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);

    if (booking.customerId !== userId) {
      throw new AppError('Access denied. Ticket does not belong to your account', HTTP_STATUS.FORBIDDEN);
    }

    const qrEligible = booking.bookingStatus === 'Confirmed' || booking.bookingStatus === 'CheckedIn';
    if (!qrEligible) {
      throw new AppError('QR Ticket is only available for Confirmed bookings', HTTP_STATUS.BAD_REQUEST);
    }

    const ticket = booking.tickets.find((t) => t.id === ticketId || t.ticketCode === ticketId);
    if (!ticket) throw new AppError('Specified ticket not found in booking', HTTP_STATUS.NOT_FOUND);

    return generateTicketQrPayload({
      bookingNumber: booking.bookingNumber,
      ticketCode: ticket.ticketCode,
      ticketId: ticket.id,
      eventId: booking.eventId,
      scheduleId: booking.scheduleId,
      sectionName: booking.items[0]?.section?.name || ticket.ticketType?.section?.name || 'General',
      ticketTypeName: ticket.ticketType?.name || 'Standard',
      customerId: booking.customerId,
    });
  }
}
