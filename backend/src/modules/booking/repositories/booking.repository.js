import { prisma } from '../../../config/prisma.js';
import { generateBookingNumber } from '../utils/bookingNumberGenerator.util.js';
import { generateTicketCode } from '../utils/ticketCode.util.js';
import { BookingStatus, PaymentStatus, TicketStatus, SeatStatus } from '@prisma/client';
import { InventoryService } from '../../ticketing/services/inventory.service.js';
import { isValidObjectId } from '../../../utils/objectId.util.js';
import { QrCryptoUtil } from '../../checkin/utils/qrCrypto.util.js';

/**
 * Transaction-Safe Booking Repository
 */
export class BookingRepository {
  /**
   * Create Booking record with Booking Items
   */
  static async createBooking(data, items = [], attendees = []) {
    const reservationRef = data.reservationNumber || data.reservationId;
    const isCash = data.paymentGateway === 'CASH';
    // Cash holds until an organiser/admin verifies payment. Online checkout still
    // uses a 15-minute unpaid window.
    const expiresAt = isCash ? null : new Date(Date.now() + 15 * 60 * 1000);

    let booking = null;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      try {
        booking = await prisma.booking.create({
          data: {
            bookingNumber: generateBookingNumber(),
            customerId: data.customerId,
            eventId: data.eventId,
            scheduleId: isValidObjectId(data.scheduleId) ? data.scheduleId : null,
            sectionId: isValidObjectId(data.sectionId) ? data.sectionId : null,
            ticketTypeId: isValidObjectId(data.ticketTypeId) ? data.ticketTypeId : null,
            quantity: data.quantity,
            currency: data.currency || 'INR',
            subtotal: data.subtotal,
            discount: data.discount || 0.0,
            couponDiscount: data.couponDiscount || 0.0,
            platformFee: data.platformFee || 0.0,
            bookingFee: data.bookingFee || 0.0,
            serviceCharge: data.serviceCharge || 0.0,
            gstAmount: data.gstAmount || 0.0,
            totalAmount: data.totalAmount,
            paymentStatus: PaymentStatus.Pending,
            bookingStatus: isCash ? BookingStatus.AwaitingPayment : BookingStatus.Reserved,
            paymentGateway: data.paymentGateway || null,
            reservationStatus: reservationRef ? 'HELD' : 'ACTIVE',
            bookingSource: data.bookingSource || 'WEB',
            expiresAt,
            notes: data.notes || null,
          },
        });
        break;
      } catch (err) {
        if (err.code === 'P2002' && attempt < 5) continue;
        throw err;
      }
    }

    // Create Booking Items if provided
    const validItems = items
      .filter((item) => isValidObjectId(item.ticketTypeId))
      .map((item) => ({
        bookingId: booking.id,
        ticketTypeId: item.ticketTypeId,
        sectionId: isValidObjectId(item.sectionId) ? item.sectionId : null,
        quantity: item.quantity,
        unitPrice: item.unitPrice || 0.0,
        discount: item.discount || 0.0,
        gst: item.gst || 0.0,
        total: item.total || 0.0,
      }));

    if (validItems.length > 0) {
      await prisma.bookingItem.createMany({
        data: validItems,
      });
    }

    // Attach held seats from the reservation lock to this booking
    if (reservationRef) {
      const isRefObjectId = isValidObjectId(reservationRef);
      const lock = await prisma.reservationLock.findFirst({
        where: isRefObjectId
          ? { OR: [{ reservationNumber: reservationRef }, { id: reservationRef }] }
          : { reservationNumber: reservationRef },
      });
      if (lock) {
        await prisma.seatMap.updateMany({
          where: { reservationLockId: lock.id, status: SeatStatus.HELD },
          data: { bookingId: booking.id },
        });
      }
    }

    if (Array.isArray(attendees) && attendees.length > 0) {
      await prisma.bookingAttendee.createMany({
        data: attendees.map((attendee, index) => ({
          bookingId: booking.id,
          attendeeIndex: Number.isInteger(attendee.attendeeIndex) ? attendee.attendeeIndex : index,
          fullName: attendee.fullName,
          mobileNumber: attendee.mobileNumber,
          identityDocumentId: attendee.identityDocumentId || null,
        })),
      });
    }

    return this.findById(booking.id);
  }

  /**
   * Confirm Booking, issue individual Tickets & update section sold count
   */
  static async confirmBooking(bookingId, transactionId, { paymentStatus = PaymentStatus.Paid } = {}) {
    const booking = await this.findById(bookingId);
    if (!booking) return null;

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        bookingStatus: BookingStatus.Confirmed,
        paymentStatus,
        reservationStatus: 'FULFILLED',
      },
    });

    const itemsToProcess =
      booking.items && booking.items.length > 0
        ? booking.items
        : [
            {
              ticketTypeId: booking.ticketTypeId,
              sectionId: booking.sectionId,
              quantity: booking.quantity,
            },
          ];

    const alreadyHeld = booking.reservationStatus === 'HELD';
    const { assignedByTicketType } = await InventoryService.confirmSeatsForBooking(booking, { alreadyHeld });

    const existingTickets = await prisma.ticket.count({ where: { bookingId: booking.id } });
    if (existingTickets > 0) {
      return this.findById(bookingId);
    }

    const ticketsToCreate = [];
    for (const item of itemsToProcess) {
      if (!item.quantity || item.quantity <= 0) continue;
      const targetTicketTypeId = item.ticketTypeId;
      const assignedSeats = assignedByTicketType[targetTicketTypeId] || assignedByTicketType.unknown || [];

      for (let i = 0; i < item.quantity; i++) {
        const assignedSeat = assignedSeats[i] || null;
        ticketsToCreate.push({
          ticketCode: generateTicketCode(),
          bookingId: booking.id,
          ticketTypeId: targetTicketTypeId,
          seatId: assignedSeat ? assignedSeat.id : null,
          status: TicketStatus.ISSUED,
        });
      }
    }

    if (ticketsToCreate.length > 0 && ticketsToCreate[0].ticketTypeId) {
      await prisma.ticket.createMany({
        data: ticketsToCreate,
      });

      const createdTickets = await prisma.ticket.findMany({
        where: { bookingId: booking.id },
      });

      await Promise.all(
        createdTickets.map(async (tck) => {
          const qr = QrCryptoUtil.createSignedQrToken({
            ticketId: tck.id,
            bookingId: booking.id,
            ticketCode: tck.ticketCode,
          });
          await prisma.ticket.update({
            where: { id: tck.id },
            data: { qrToken: qr.token },
          });
          if (tck.seatId) {
            await prisma.seatMap.update({
              where: { id: tck.seatId },
              data: { ticketId: tck.id },
            });
          }
        })
      );

      const issuedTickets = await prisma.ticket.findMany({
        where: { bookingId: booking.id },
        orderBy: { createdAt: 'asc' },
      });
      const attendeesToLink = await prisma.bookingAttendee.findMany({
        where: { bookingId: booking.id },
        orderBy: { attendeeIndex: 'asc' },
      });
      await Promise.all(
        attendeesToLink.map((attendee, index) => {
          const ticket = issuedTickets[index];
          if (!ticket) return null;
          return prisma.bookingAttendee.update({
            where: { id: attendee.id },
            data: { ticketId: ticket.id },
          });
        })
      );
    }

    return this.findById(bookingId);
  }

  /**
   * Cancel Booking & restore section inventory capacities
   */
  static async cancelBooking(bookingId, cancellationReason = null) {
    const booking = await this.findById(bookingId);
    if (!booking) return null;

    const itemsToProcess =
      booking.items && booking.items.length > 0
        ? booking.items
        : [
            {
              ticketTypeId: booking.ticketTypeId,
              sectionId: booking.sectionId,
              quantity: booking.quantity,
            },
          ];

    for (const item of itemsToProcess) {
      if (!item.quantity || item.quantity <= 0) continue;

      let targetSectionId = item.sectionId;
      const targetTicketTypeId = item.ticketTypeId;

      if (!targetSectionId && targetTicketTypeId) {
        const ticketType = await prisma.ticketType.findUnique({ where: { id: targetTicketTypeId } });
        if (ticketType && ticketType.sectionId) {
          targetSectionId = ticketType.sectionId;
        }
      }

      if (targetSectionId) {
        const section = await prisma.eventSection.findUnique({ where: { id: targetSectionId } });
        if (section) {
          let newReserved = section.reservedCapacity;
          let newSold = section.soldCapacity;

          if (booking.bookingStatus === BookingStatus.Confirmed) {
            newSold = Math.max(0, section.soldCapacity - item.quantity);

            // Restore SeatMap entries to isBooked: false for targetSectionId
            const bookedSeats = await prisma.seatMap.findMany({
              where: { sectionId: targetSectionId, bookingId: booking.id },
              take: item.quantity,
            });

            if (bookedSeats.length > 0) {
              const seatIdsToRestore = bookedSeats.map((s) => s.id);
              await prisma.seatMap.updateMany({
                where: { id: { in: seatIdsToRestore } },
                data: {
                  isBooked: false,
                  status: SeatStatus.AVAILABLE,
                  bookingId: null,
                  ticketId: null,
                  soldAt: null,
                  heldUntil: null,
                  reservationLockId: null,
                },
              });
            }
          } else {
            newReserved = Math.max(0, section.reservedCapacity - item.quantity);
          }

          const newAvailable = Math.max(0, section.capacity - newReserved - newSold);
          await prisma.eventSection.update({
            where: { id: targetSectionId },
            data: {
              reservedCapacity: newReserved,
              soldCapacity: newSold,
              availableCapacity: newAvailable,
            },
          });
        }
      }

      // Restore TicketType available stock
      if (targetTicketTypeId) {
        const ticketType = await prisma.ticketType.findUnique({ where: { id: targetTicketTypeId } });
        if (ticketType) {
          const newAvailable = Math.min(ticketType.quantityTotal, ticketType.quantityAvailable + item.quantity);
          await prisma.ticketType.update({
            where: { id: targetTicketTypeId },
            data: { quantityAvailable: newAvailable },
          });
        }
      }
    }

    // Update tickets status to CANCELLED
    await prisma.ticket.updateMany({
      where: { bookingId },
      data: { status: TicketStatus.CANCELLED },
    });

    return prisma.booking.update({
      where: { id: bookingId },
      data: {
        bookingStatus: BookingStatus.Cancelled,
        paymentStatus: PaymentStatus.Cancelled,
        notes: cancellationReason || booking.notes,
      },
    });
  }

  /**
   * Find Booking by ID or Booking Number
   */
  static async findById(idOrBookingNumber) {
    const ref = String(idOrBookingNumber || '').trim();
    let whereClause;
    if (/^[0-9a-fA-F]{24}$/.test(ref)) {
      whereClause = { id: ref };
    } else {
      whereClause = {
        OR: [{ bookingNumber: ref }, { legacyBookingNumber: ref }],
      };
    }

    return prisma.booking.findFirst({
      where: whereClause,
      include: {
        customer: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true },
        },
        event: {
          include: {
            venue: true,
            city: true,
            schedules: { orderBy: { startDate: 'asc' } },
            images: true,
            eventVenue: true,
            policy: true,
            organizer: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                organizerProfile: { select: { companyName: true, phone: true } },
              },
            },
          },
        },
        items: {
          include: { ticketType: true, section: true },
        },
        tickets: {
          include: { ticketType: true, seats: true, attendees: true },
        },
        attendees: {
          orderBy: { attendeeIndex: 'asc' },
        },
        payments: true,
        cashVerifiedBy: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        },
      },
    });
  }

  /**
   * Find Bookings with pagination and filters
   */
  static async searchAndFilter(params = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      customerId,
      organizerId,
      eventId,
      bookingStatus,
      paymentStatus,
      paymentGateway,
      bookingNumber,
    } = params;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause = {};
    if (customerId) whereClause.customerId = customerId;
    if (eventId) whereClause.eventId = eventId;
    if (bookingStatus) whereClause.bookingStatus = bookingStatus;
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;
    if (paymentGateway) whereClause.paymentGateway = paymentGateway;
    if (bookingNumber) {
      whereClause.OR = [
        { bookingNumber: { contains: bookingNumber } },
        { legacyBookingNumber: { contains: bookingNumber } },
      ];
    }

    if (organizerId) {
      whereClause.event = { organizerId };
    }

    const [total, data] = await Promise.all([
      prisma.booking.count({ where: whereClause }),
      prisma.booking.findMany({
        where: whereClause,
        include: {
          customer: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
          event: {
            include: {
              venue: true,
              city: true,
              schedules: { orderBy: { startDate: 'asc' } },
              images: true,
              eventVenue: true,
            },
          },
          items: {
            include: { ticketType: true, section: true },
          },
          tickets: {
            include: { ticketType: true, seats: true },
          },
          attendees: {
            orderBy: { attendeeIndex: 'asc' },
          },
        },
        orderBy: { [sortBy]: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNumber,
      }),
    ]);

    return {
      data,
      meta: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  /**
   * Create Audit Log Record
   */
  static async createAuditLog(userId, action, entity, entityId, oldData = null, newData = null) {
    return prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        oldData: oldData ? JSON.stringify(oldData) : null,
        newData: newData ? JSON.stringify(newData) : null,
      },
    });
  }
}
