import { prisma } from '../config/prisma.js';
import { BookingStatus, TicketStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Booking Repository for Booking creation, cancellation, and Ticket issuance queries
 */
export class BookingRepository {
  /**
   * Create Booking and issue Tickets atomically
   * @param {string} customerId
   * @param {string} eventId
   * @param {number} totalAmount
   * @param {Array} ticketItems - Array of { ticketTypeId, quantity, price }
   */
  static async createBooking(customerId, eventId, totalAmount, ticketItems) {
    // 1. Create Booking Record
    const booking = await prisma.booking.create({
      data: {
        customerId,
        eventId,
        totalAmount,
        status: BookingStatus.CONFIRMED,
      },
    });

    // 2. Issue Individual Tickets with unique QR code payload strings
    const ticketsToCreate = [];
    for (const item of ticketItems) {
      for (let i = 0; i < item.quantity; i++) {
        const ticketCode = `TCK-${uuidv4().substring(0, 8).toUpperCase()}`;
        ticketsToCreate.push({
          bookingId: booking.id,
          ticketTypeId: item.ticketTypeId,
          ticketCode,
          status: TicketStatus.ISSUED,
        });
      }

      // Decrement available quantity for ticket type
      await prisma.ticketType.update({
        where: { id: item.ticketTypeId },
        data: {
          quantityAvailable: {
            decrement: item.quantity,
          },
        },
      });
    }

    await prisma.ticket.createMany({
      data: ticketsToCreate,
    });

    return this.findBookingById(booking.id, customerId);
  }

  /**
   * Find all bookings for a Customer
   */
  static async findBookingsByCustomer(customerId) {
    return prisma.booking.findMany({
      where: { customerId },
      include: {
        event: {
          include: {
            venue: true,
            city: true,
            images: true,
            eventVenue: true,
          },
        },
        tickets: {
          include: {
            ticketType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find single Booking by ID
   */
  static async findBookingById(id, customerId = null) {
    const whereClause = { id };
    if (customerId) whereClause.customerId = customerId;

    return prisma.booking.findFirst({
      where: whereClause,
      include: {
        customer: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        event: {
          include: {
            venue: true,
            city: true,
            images: true,
            eventVenue: true,
            organizer: {
              select: { id: true, email: true },
            },
          },
        },
        tickets: {
          include: {
            ticketType: true,
          },
        },
      },
    });
  }

  /**
   * Cancel Booking and restore ticket quantities
   */
  static async cancelBooking(id, customerId) {
    const booking = await this.findBookingById(id, customerId);
    if (!booking) return null;

    // Restore available quantities
    for (const ticket of booking.tickets) {
      await prisma.ticketType.update({
        where: { id: ticket.ticketTypeId },
        data: {
          quantityAvailable: {
            increment: 1,
          },
        },
      });
    }

    // Mark tickets as CANCELLED
    await prisma.ticket.updateMany({
      where: { bookingId: id },
      data: { status: TicketStatus.CANCELLED },
    });

    return prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });
  }

  /**
   * Find Ticket by ID for QR code generation / ticket download
   */
  static async findTicketById(ticketId, customerId) {
    return prisma.ticket.findFirst({
      where: {
        id: ticketId,
        booking: {
          customerId,
        },
      },
      include: {
        ticketType: true,
        booking: {
          include: {
            customer: true,
            event: {
              include: {
                venue: true,
                city: true,
                images: true,
                eventVenue: true,
              },
            },
          },
        },
      },
    });
  }
}
