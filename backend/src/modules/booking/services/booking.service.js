import { Role, BookingStatus } from '@prisma/client';
import { prisma } from '../../../config/prisma.js';
import { BookingRepository } from '../repositories/booking.repository.js';
import { ReservationRepository } from '../repositories/reservation.repository.js';
import { EventRepository } from '../../event/repositories/event.repository.js';
import { SectionRepository } from '../../ticketing/repositories/section.repository.js';
import { TicketTypeRepository } from '../../ticketing/repositories/ticketingSubResource.repository.js';
import { TicketingService } from '../../ticketing/services/ticketing.service.js';
import { TaxSettingService } from '../../../services/taxSetting.service.js';
import { TicketDeliveryService } from './ticketDelivery.service.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import { isValidObjectId } from '../../../utils/objectId.util.js';

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

    let unitPrice = event.price;
    const targetTicketId = isValidObjectId(dto.ticketTypeId)
      ? dto.ticketTypeId
      : isValidObjectId(lineItems[0]?.ticketTypeId)
      ? lineItems[0].ticketTypeId
      : null;

    if (targetTicketId) {
      const ticketType = await TicketTypeRepository.findById(targetTicketId);
      if (ticketType) unitPrice = ticketType.price;
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

    const taxCalc = await TaxSettingService.calculateOrderTax(totalQty, unitPrice);
    let subtotal = taxCalc.subtotal;
    let couponDiscount = 0.0;

    // Apply Coupon discount if provided
    if (dto.couponCode) {
      const couponResult = await TicketingService.validateCoupon(dto.couponCode, subtotal);
      if (couponResult.valid) {
        couponDiscount = couponResult.discountAmount;
      }
    }

    const platformFee = taxCalc.platformFee;
    const taxableSubtotal = Math.max(0, subtotal - couponDiscount + platformFee);
    const gstAmount = parseFloat((taxableSubtotal * (taxCalc.gstRate / 100)).toFixed(2));
    const totalAmount = parseFloat((taxableSubtotal + gstAmount).toFixed(2));

    let bookingItems = [];
    if (Array.isArray(dto.items) && dto.items.length > 0) {
      for (const item of dto.items) {
        let itemUnitPrice = 0;
        let itemSectionId = isValidObjectId(item.sectionId) ? item.sectionId : null;

        if (isValidObjectId(item.ticketTypeId)) {
          const tt = await TicketTypeRepository.findById(item.ticketTypeId);
          if (tt) {
            itemUnitPrice = tt.price;
            if (!itemSectionId && isValidObjectId(tt.sectionId)) {
              itemSectionId = tt.sectionId;
            }
          }
        }

        if (isValidObjectId(item.ticketTypeId)) {
          bookingItems.push({
            ticketTypeId: item.ticketTypeId,
            sectionId: itemSectionId,
            quantity: item.quantity,
            unitPrice: item.unitPrice || itemUnitPrice,
            discount: 0.0,
            gst: parseFloat(((item.unitPrice || itemUnitPrice) * item.quantity * 0.18).toFixed(2)),
            total: parseFloat(((item.unitPrice || itemUnitPrice) * item.quantity * 1.18).toFixed(2)),
          });
        }
      }
    }

    if (bookingItems.length === 0) {
      let defaultTicketTypeId = isValidObjectId(dto.ticketTypeId) ? dto.ticketTypeId : null;
      if (!defaultTicketTypeId) {
        const firstTicketType = await prisma.ticketType.findFirst({ where: { eventId: dto.eventId } });
        defaultTicketTypeId = firstTicketType?.id || null;
      }

      bookingItems = [
        {
          ticketTypeId: defaultTicketTypeId,
          sectionId: isValidObjectId(dto.sectionId) ? dto.sectionId : null,
          quantity: dto.quantity || totalQty,
          unitPrice,
          discount: couponDiscount,
          gst: gstAmount,
          total: totalAmount,
        },
      ];
    }

    // 4. Create Booking record & items
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
        bookingFee: 10.0,
        serviceCharge: 10.0,
        gstAmount,
        totalAmount,
        notes: dto.notes || null,
        reservationNumber: dto.reservationNumber || null,
        reservationId: dto.reservationId || null,
      },
      bookingItems
    );

    await BookingRepository.createAuditLog(customerId, 'CREATE_BOOKING', 'Booking', booking.id, null, booking);
    return booking;
  }

  /**
   * Confirm Booking after Payment Callback
   */
  static async confirmBooking(bookingId, transactionId) {
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);

    if (booking.bookingStatus === BookingStatus.Confirmed) {
      if (!booking.ticketEmailSentAt) {
        const emailResult = await TicketDeliveryService.deliverAfterConfirm(booking);
        return { ...booking, emailSent: emailResult.emailSent, emailMessage: emailResult.emailMessage };
      }
      return { ...booking, emailSent: true, emailMessage: 'Tickets already issued.' };
    }

    const confirmedBooking = await BookingRepository.confirmBooking(bookingId, transactionId);
    await BookingRepository.createAuditLog(booking.customerId, 'CONFIRM_BOOKING', 'Booking', bookingId, booking, confirmedBooking);

    const emailResult = await TicketDeliveryService.deliverAfterConfirm(confirmedBooking);
    return {
      ...confirmedBooking,
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

    return booking;
  }

  /**
   * Customer My Bookings
   */
  static async getCustomerBookings(customerId, query = {}) {
    return BookingRepository.searchAndFilter({ ...query, customerId });
  }

  /**
   * Organizer Event Bookings
   */
  static async getOrganizerBookings(organizerId, query = {}) {
    return BookingRepository.searchAndFilter({ ...query, organizerId });
  }

  /**
   * Admin All Bookings
   */
  static async getAdminBookings(query = {}) {
    return BookingRepository.searchAndFilter(query);
  }
}
