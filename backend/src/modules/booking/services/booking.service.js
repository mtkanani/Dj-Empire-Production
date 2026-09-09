import { Role, BookingStatus, PaymentGateway, PaymentStatus } from '@prisma/client';
import { prisma } from '../../../config/prisma.js';
import { BookingRepository } from '../repositories/booking.repository.js';
import { ReservationRepository } from '../repositories/reservation.repository.js';
import { EventRepository } from '../../event/repositories/event.repository.js';
import { SectionRepository } from '../../ticketing/repositories/section.repository.js';
import { TicketTypeRepository } from '../../ticketing/repositories/ticketingSubResource.repository.js';
import { TicketingService } from '../../ticketing/services/ticketing.service.js';
import { TaxSettingService } from '../../../services/taxSetting.service.js';
import { TicketDeliveryService } from './ticketDelivery.service.js';
import { IdentityDocumentService } from '../../identity/identityDocument.service.js';
import { PaymentRepository } from '../../payment/repositories/payment.repository.js';
import { EmailService } from '../../../services/email.service.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import { isValidObjectId } from '../../../utils/objectId.util.js';
import { presentBooking } from '../utils/presentBooking.util.js';
import { logger } from '../../../config/logger.js';

/**
 * Domain Service for Customer Booking & Reservation Lifecycle
 */
export class BookingService {
  /**
   * Create Booking & initiate checkout window
   */
  static async createBooking(customerId, dto) {
    if (!isValidObjectId(dto.eventId)) {
      throw new AppError('Invalid Event ID format', HTTP_STATUS.BAD_REQUEST);
    }

    // 1. Verify Event exists and is published
    const event = await EventRepository.findById(dto.eventId);
    if (!event || event.status !== 'Published') {
      throw new AppError('Event is not available for booking', HTTP_STATUS.BAD_REQUEST);
    }

    // 2. Validate Reservation Lock if provided (Ensure 15-min hold hasn't expired)
    const reservationRef = dto.reservationNumber || dto.reservationId;
    if (reservationRef) {
      const isRefObjectId = isValidObjectId(reservationRef);
      const lock = await prisma.reservationLock.findFirst({
        where: isRefObjectId
          ? { OR: [{ reservationNumber: reservationRef }, { id: reservationRef }] }
          : { reservationNumber: reservationRef },
      });

      if (lock) {
        const isExpired =
          lock.status === 'EXPIRED' ||
          lock.status === 'CANCELLED' ||
          (lock.expiresAt && new Date() > new Date(lock.expiresAt));

        if (isExpired) {
          await ReservationRepository.releaseReservationLock(lock.id, 'EXPIRED');
          throw new AppError(
            'Your 15-minute ticket lock has expired. Please select your tickets again.',
            HTTP_STATUS.BAD_REQUEST
          );
        }
      }
    }

    const lineItems =
      Array.isArray(dto.items) && dto.items.length > 0
        ? dto.items
        : [
            {
              ticketTypeId: dto.ticketTypeId,
              sectionId: dto.sectionId,
              quantity: dto.quantity,
              unitPrice: dto.unitPrice,
            },
          ];

    const totalQty = lineItems.reduce((sum, item) => sum + (item.quantity || 0), 0) || dto.quantity || 1;

    const attendees = Array.isArray(dto.attendees) ? dto.attendees : [];
    if (attendees.length !== totalQty) {
      throw new AppError(
        `Number of attendees (${attendees.length}) must exactly match the number of tickets (${totalQty})`,
        HTTP_STATUS.UNPROCESSABLE_ENTITY
      );
    }

    const documentIds = attendees.map((a) => a.identityDocumentId).filter(Boolean);
    if (new Set(documentIds).size !== documentIds.length) {
      throw new AppError('Each attendee must upload a unique identity document', HTTP_STATUS.BAD_REQUEST);
    }

    const resolvedAttendees = [];
    for (let i = 0; i < attendees.length; i += 1) {
      const attendee = attendees[i];
      if (attendee.identityDocumentId) {
        await IdentityDocumentService.assertOwnedUnconsumed(attendee.identityDocumentId, customerId);
      }
      resolvedAttendees.push({
        attendeeIndex: i,
        fullName: attendee.fullName,
        mobileNumber: attendee.mobileNumber,
        identityDocumentId: attendee.identityDocumentId || null,
      });
    }

    if (isValidObjectId(dto.sectionId)) {
      const section = await SectionRepository.findById(dto.sectionId);
      if (!section) throw new AppError('Specified Section not found', HTTP_STATUS.NOT_FOUND);
      if (section.availableCapacity < totalQty) {
        throw new AppError(
          `Requested quantity (${totalQty}) exceeds available section capacity (${section.availableCapacity})`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    const pricedLines = [];
    for (const item of lineItems) {
      if (!isValidObjectId(item.ticketTypeId)) continue;
      const tt = await TicketTypeRepository.findById(item.ticketTypeId);
      if (!tt) continue;
      let itemSectionId = isValidObjectId(item.sectionId) ? item.sectionId : null;
      if (!itemSectionId && isValidObjectId(tt.sectionId)) {
        itemSectionId = tt.sectionId;
      }
      pricedLines.push({
        ticketTypeId: item.ticketTypeId,
        sectionId: itemSectionId,
        quantity: item.quantity,
        unitPrice: tt.price,
        bookingFee: tt.bookingFee || 0,
        platformFee: tt.platformFee || 0,
        serviceCharge: tt.serviceCharge || 0,
      });
    }

    if (pricedLines.length === 0) {
      let unitPrice = event.price;
      let defaultTicketTypeId = isValidObjectId(dto.ticketTypeId) ? dto.ticketTypeId : null;
      let fees = { bookingFee: 0, platformFee: 0, serviceCharge: 0 };
      if (defaultTicketTypeId) {
        const ticketType = await TicketTypeRepository.findById(defaultTicketTypeId);
        if (ticketType) {
          unitPrice = ticketType.price;
          fees = {
            bookingFee: ticketType.bookingFee || 0,
            platformFee: ticketType.platformFee || 0,
            serviceCharge: ticketType.serviceCharge || 0,
          };
        }
      } else {
        const firstTicketType = await prisma.ticketType.findFirst({ where: { eventId: dto.eventId } });
        defaultTicketTypeId = firstTicketType?.id || null;
        if (firstTicketType) {
          unitPrice = firstTicketType.price;
          fees = {
            bookingFee: firstTicketType.bookingFee || 0,
            platformFee: firstTicketType.platformFee || 0,
            serviceCharge: firstTicketType.serviceCharge || 0,
          };
        }
      }
      pricedLines.push({
        ticketTypeId: defaultTicketTypeId,
        sectionId: isValidObjectId(dto.sectionId) ? dto.sectionId : null,
        quantity: dto.quantity || totalQty,
        unitPrice,
        ...fees,
      });
    }

    const quote = await TaxSettingService.quoteOrderWithSettings(pricedLines);
    let couponDiscount = 0.0;

    if (dto.couponCode) {
      const couponResult = await TicketingService.validateCoupon(dto.couponCode, quote.subtotal);
      if (couponResult.valid) {
        couponDiscount = couponResult.discountAmount;
      }
    }

    const platformFee = quote.platformFee;
    const bookingFee = quote.bookingFee;
    const serviceCharge = quote.serviceCharge;
    const taxableSubtotal = Math.max(
      0,
      quote.subtotal - couponDiscount + platformFee + bookingFee + serviceCharge
    );
    const gstAmount = parseFloat((taxableSubtotal * (quote.gstRate / 100)).toFixed(2));
    const totalAmount = parseFloat((taxableSubtotal + gstAmount).toFixed(2));
    const subtotal = quote.subtotal;

    const bookingItems = pricedLines.map((item) => {
      const lineSub = parseFloat((item.unitPrice * item.quantity).toFixed(2));
      const share = subtotal > 0 ? lineSub / subtotal : 0;
      const lineGst = parseFloat((gstAmount * share).toFixed(2));
      const lineDiscount = parseFloat((couponDiscount * share).toFixed(2));
      return {
        ticketTypeId: item.ticketTypeId,
        sectionId: item.sectionId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: lineDiscount,
        gst: lineGst,
        total: parseFloat((lineSub - lineDiscount + lineGst).toFixed(2)),
      };
    });

    // 4. Create Booking record, items, and attendees
    const booking = await BookingRepository.createBooking(
      {
        customerId,
        eventId: dto.eventId,
        scheduleId: dto.scheduleId || null,
        sectionId: dto.sectionId || null,
        ticketTypeId: dto.ticketTypeId || null,
        quantity: totalQty,
        currency: 'INR',
        subtotal,
        discount: 0.0,
        couponDiscount,
        platformFee,
        bookingFee,
        serviceCharge,
        gstAmount,
        totalAmount,
        notes: dto.notes || null,
        reservationNumber: dto.reservationNumber || null,
        reservationId: dto.reservationId || null,
        paymentGateway: dto.paymentGateway || null,
      },
      bookingItems,
      resolvedAttendees
    );

    await IdentityDocumentService.consumeMany(documentIds);

    if (dto.paymentGateway === PaymentGateway.CASH || dto.paymentGateway === 'CASH') {
      await PaymentRepository.createPayment({
        bookingId: booking.id,
        eventId: booking.eventId,
        userId: customerId,
        gateway: PaymentGateway.CASH,
        gatewayOrderId: `CASH-ORD-${booking.bookingNumber}`,
        currency: booking.currency,
        subtotal: booking.subtotal,
        discount: booking.discount + booking.couponDiscount,
        taxAmount: booking.gstAmount,
        platformFee: booking.platformFee,
        bookingFee: booking.bookingFee,
        serviceCharge: booking.serviceCharge,
        totalAmount: booking.totalAmount,
        paymentMethod: 'CASH',
        paymentStatus: PaymentStatus.Pending,
      });

      try {
        await EmailService.sendCashPendingEmail({
          to: booking.customer?.email,
          bookingNumber: booking.bookingNumber,
          eventName: booking.event?.title,
          quantity: booking.quantity,
          totalAmount: booking.totalAmount,
          currency: booking.currency,
          attendees: booking.attendees || resolvedAttendees,
        });
      } catch (err) {
        logger.error(`Cash pending email failed for booking ${booking.bookingNumber}: ${err.message}`);
      }
    }

    await BookingRepository.createAuditLog(customerId, 'CREATE_BOOKING', 'Booking', booking.id, null, booking);
    return presentBooking(await BookingRepository.findById(booking.id), { isStaff: false });
  }

  /**
   * Confirm Booking after Payment Callback
   */
  static async confirmBooking(bookingId, transactionId, options = {}) {
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);

    if (booking.bookingStatus === BookingStatus.Confirmed) {
      if (!booking.ticketEmailSentAt) {
        const emailResult = await TicketDeliveryService.deliverAfterConfirm(booking);
        return { ...presentBooking(booking, { isStaff: true }), emailSent: emailResult.emailSent, emailMessage: emailResult.emailMessage };
      }
      return { ...presentBooking(booking, { isStaff: true }), emailSent: true, emailMessage: 'Tickets already issued.' };
    }

    const confirmedBooking = await BookingRepository.confirmBooking(bookingId, transactionId, options);
    await BookingRepository.createAuditLog(booking.customerId, 'CONFIRM_BOOKING', 'Booking', bookingId, booking, confirmedBooking);

    const emailResult = await TicketDeliveryService.deliverAfterConfirm(confirmedBooking);
    return {
      ...presentBooking(confirmedBooking, { isStaff: true }),
      emailSent: emailResult.emailSent,
      emailMessage: emailResult.emailMessage,
    };
  }

  /**
   * Cancel Booking
   */
  static async cancelBooking(bookingId, user, cancellationReason) {
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);

    // Customer can only cancel their own booking
    if (user.role === Role.CUSTOMER && booking.customerId !== user.userId) {
      throw new AppError('Access denied', HTTP_STATUS.FORBIDDEN);
    }

    // Customers cannot cancel after the event has started (date lives on EventSchedule)
    if (user.role === Role.CUSTOMER) {
      const eventStart = booking.event?.schedules?.[0]?.startDate;
      if (eventStart && new Date() >= new Date(eventStart)) {
        throw new AppError('Cannot cancel booking after the event has started', HTTP_STATUS.BAD_REQUEST);
      }
    }

    const cancelledBooking = await BookingRepository.cancelBooking(bookingId, cancellationReason);
    await BookingRepository.createAuditLog(user.userId, 'CANCEL_BOOKING', 'Booking', bookingId, booking, cancelledBooking);

    return { message: 'Booking cancelled successfully. Reserved inventory released.' };
  }

  /**
   * Get Single Booking Details
   */
  static async getBookingDetails(bookingId, user) {
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);

    if (user.role === Role.CUSTOMER && booking.customerId !== user.userId) {
      throw new AppError('Access denied', HTTP_STATUS.FORBIDDEN);
    }

    if (user.role === Role.EVENT_ORGANIZER && booking.event.organizerId !== user.userId) {
      throw new AppError('Access denied', HTTP_STATUS.FORBIDDEN);
    }

    return presentBooking(booking, {
      isStaff: user.role === Role.SUPER_ADMIN || user.role === Role.EVENT_ORGANIZER,
    });
  }

  /**
   * Customer My Bookings
   */
  static async getCustomerBookings(customerId, query = {}) {
    const result = await BookingRepository.searchAndFilter({ ...query, customerId });
    return { ...result, data: result.data.map((booking) => presentBooking(booking, { isStaff: false })) };
  }

  /**
   * Organizer Event Bookings
   */
  static async getOrganizerBookings(organizerId, query = {}) {
    const result = await BookingRepository.searchAndFilter({ ...query, organizerId });
    return { ...result, data: result.data.map((booking) => presentBooking(booking, { isStaff: true })) };
  }

  /**
   * Admin All Bookings
   */
  static async getAdminBookings(query = {}) {
    const result = await BookingRepository.searchAndFilter(query);
    return { ...result, data: result.data.map((booking) => presentBooking(booking, { isStaff: true })) };
  }
}
