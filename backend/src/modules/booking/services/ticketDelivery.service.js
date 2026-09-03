import { BookingStatus, TicketStatus } from '@prisma/client';
import { prisma } from '../../../config/prisma.js';
import { BookingRepository } from '../repositories/booking.repository.js';
import { QrCryptoUtil } from '../../checkin/utils/qrCrypto.util.js';
import { EmailService } from '../../../services/email.service.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import { logger } from '../../../config/logger.js';
import { buildTicketBundle, buildTicketEmailHtml, buildQrImageUrl } from '../utils/ticketBundle.util.js';
import { generateTicketsPdf } from '../utils/ticketPdf.util.js';
import { mapTicketPublicStatus } from '../utils/ticketCode.util.js';

const VIEWABLE = new Set([BookingStatus.Confirmed, BookingStatus.CheckedIn]);

export class TicketDeliveryService {
  static async ensureQrTokens(booking) {
    const tickets = booking.tickets || [];
    for (const ticket of tickets) {
      if (ticket.qrToken) continue;
      const qr = QrCryptoUtil.createSignedQrToken({
        ticketId: ticket.id,
        bookingId: booking.id,
        ticketCode: ticket.ticketCode,
      });
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { qrToken: qr.token },
      });
      ticket.qrToken = qr.token;
    }
    return booking;
  }

  static assertOwnership(booking, user) {
    if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);
    if (user?.role === 'CUSTOMER' && booking.customerId !== user.userId) {
      throw new AppError('You do not have access to this ticket', HTTP_STATUS.FORBIDDEN);
    }
  }

  static async loadOwnedBooking(bookingId, user) {
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);
    this.assertOwnership(booking, user);
    if (!booking.event) throw new AppError('Event not found for this booking', HTTP_STATUS.NOT_FOUND);
    await this.ensureQrTokens(booking);
    return booking;
  }

  static async getTicketData(bookingId, user) {
    const booking = await this.loadOwnedBooking(bookingId, user);
    if (!VIEWABLE.has(booking.bookingStatus) && booking.bookingStatus !== BookingStatus.Cancelled) {
      throw new AppError('Ticket is not available for this booking status', HTTP_STATUS.BAD_REQUEST);
    }
    return buildTicketBundle(booking);
  }

  static async sendTicketEmailForBooking(booking, { isResend = false } = {}) {
    const withTokens = await this.ensureQrTokens(booking);
    const bundle = buildTicketBundle(withTokens);

    if (!bundle.user.email) {
      throw new AppError('Registered email is missing for this account', HTTP_STATUS.BAD_REQUEST);
    }

    // Build self-hosted QR image URL for each ticket.
    // The endpoint GET /api/v1/qr/:ticketCode returns a PNG directly.
    // Using our own https:// URL works in ALL email clients — Gmail, Outlook, Apple Mail.
    const qrUrlMap = {};
    for (const ticket of bundle.tickets) {
      qrUrlMap[ticket.ticketId] = buildQrImageUrl(ticket.ticketCode);
    }

    // PDF attachment — works fine with Resend
    const attachments = [];
    try {
      const pdfBuffer = await generateTicketsPdf(bundle);
      attachments.push({
        filename: `tickets-${bundle.bookingNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      });
    } catch (error) {
      logger.error(`PDF generation failed for booking ${booking.id}: ${error.message}`);
    }

    const html = await buildTicketEmailHtml(bundle, qrUrlMap);
    await EmailService.sendBookingTicketEmail({
      to: bundle.user.email,
      subject: `${isResend ? 'Resend: ' : ''}Your tickets for ${bundle.event.name}`,
      html,
      attachments,
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { ticketEmailSentAt: new Date(), ticketEmailError: null },
    });

    return {
      emailSent: true,
      ticketCount: bundle.tickets.length,
      qrCodesAttached: bundle.tickets.length,
    };
  }

  static async deliverAfterConfirm(booking) {
    try {
      await this.sendTicketEmailForBooking(booking);
      return { emailSent: true, emailMessage: `Ticket email sent with ${booking.tickets?.length || 0} QR code(s).` };
    } catch (error) {
      logger.error(`Ticket email failed for booking ${booking.id}: ${error.message}`);
      try {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { ticketEmailError: 'EMAIL_DELIVERY_FAILED' },
        });
      } catch {
        // ignore secondary persistence errors
      }
      return {
        emailSent: false,
        emailMessage: 'Booking is confirmed. Ticket email could not be sent. You can resend it from My Tickets.',
      };
    }
  }

  static async resendTicketEmail(bookingId, user) {
    const booking = await this.loadOwnedBooking(bookingId, user);
    if (booking.bookingStatus === BookingStatus.Cancelled) {
      throw new AppError('Cannot resend tickets for a cancelled booking', HTTP_STATUS.BAD_REQUEST);
    }
    if (!VIEWABLE.has(booking.bookingStatus)) {
      throw new AppError('Tickets are only emailed for confirmed bookings', HTTP_STATUS.BAD_REQUEST);
    }
    return this.sendTicketEmailForBooking(booking, { isResend: true });
  }

  static async generatePdf(bookingId, user) {
    const booking = await this.loadOwnedBooking(bookingId, user);
    if (!VIEWABLE.has(booking.bookingStatus) && booking.bookingStatus !== BookingStatus.Cancelled) {
      throw new AppError('Ticket download is not available for this booking', HTTP_STATUS.BAD_REQUEST);
    }
    const bundle = buildTicketBundle(booking);
    try {
      const pdf = await generateTicketsPdf(bundle);
      return { pdf, filename: `tickets-${bundle.bookingNumber}.pdf`, bundle };
    } catch (error) {
      logger.error(`PDF generation failed for booking ${booking.id}: ${error.message}`);
      throw new AppError('Unable to generate ticket PDF', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  static mapStatuses(tickets = []) {
    return tickets.map((t) => ({ ...t, publicStatus: mapTicketPublicStatus(t.status) }));
  }
}

export { TicketStatus };
