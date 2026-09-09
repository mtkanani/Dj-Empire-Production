import { prisma } from '../config/prisma.js';
import { EventStatus, BookingStatus } from '@prisma/client';

/**
 * Organizer Event Repository for Event, TicketType, and Sales database queries
 */
export class OrganizerEventRepository {
  // ==================== EVENT OPERATIONS ====================
  static async createEvent(data) {
    return prisma.event.create({
      data,
      include: {
        category: true,
        city: true,
        venue: true,
        ticketTypes: true,
      },
    });
  }

  static async findEventsByOrganizer(organizerId, role = null) {
    const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
    const whereClause = isAdmin ? { isDeleted: false } : { organizerId, isDeleted: false };

    return prisma.event.findMany({
      where: whereClause,
      include: {
        category: true,
        city: true,
        venue: true,
        ticketTypes: true,
        schedules: { orderBy: { startDate: 'asc' } },
        sections: true,
        images: true,
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findEventById(id, organizerId = null) {
    const whereClause = { id };
    if (organizerId) {
      whereClause.organizerId = organizerId;
    }

    return prisma.event.findFirst({
      where: whereClause,
      include: {
        category: true,
        city: true,
        venue: true,
        eventVenue: true,
        schedules: { orderBy: { startDate: 'asc' } },
        images: true,
        faqs: true,
        policy: true,
        seo: true,
        ticketTypes: true,
        sections: true,
        _count: {
          select: { bookings: true },
        },
      },
    });
  }

  static async updateEvent(id, data) {
    return prisma.event.update({
      where: { id },
      data,
      include: {
        category: true,
        city: true,
        venue: true,
        ticketTypes: true,
      },
    });
  }

  static async updateEventStatus(id, status) {
    return prisma.event.update({
      where: { id },
      data: { status },
    });
  }

  static async deleteEvent(id) {
    return prisma.event.update({
      where: { id },
      data: { isDeleted: true, status: EventStatus.Archived },
    });
  }

  // ==================== TICKET TYPE OPERATIONS ====================
  static async createTicketType(data) {
    return prisma.ticketType.create({ data });
  }

  static async findTicketTypesByEvent(eventId) {
    return prisma.ticketType.findMany({
      where: { eventId },
      orderBy: { price: 'asc' },
    });
  }

  static async findTicketTypeById(id) {
    return prisma.ticketType.findUnique({
      where: { id },
      include: { event: true },
    });
  }

  static async updateTicketType(id, data) {
    return prisma.ticketType.update({
      where: { id },
      data,
    });
  }

  static async deleteTicketType(id) {
    return prisma.ticketType.delete({ where: { id } });
  }

  // ==================== BOOKING & SALES QUERY ====================
  static async findBookingsByOrganizer(organizerId, role = null, query = {}) {
    const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
    const pageNumber = Math.max(1, parseInt(query.page, 10) || 1);
    const limitNumber = Math.max(1, Math.min(50, parseInt(query.limit, 10) || 10));
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause = isAdmin ? {} : { event: { organizerId } };
    if (query.eventId) whereClause.eventId = query.eventId;
    if (query.bookingStatus) whereClause.bookingStatus = query.bookingStatus;
    if (query.paymentStatus) whereClause.paymentStatus = query.paymentStatus;
    if (query.paymentGateway) whereClause.paymentGateway = query.paymentGateway;
    if (query.bookingNumber) {
      whereClause.OR = [
        { bookingNumber: { contains: String(query.bookingNumber) } },
        { legacyBookingNumber: { contains: String(query.bookingNumber) } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.booking.count({ where: whereClause }),
      prisma.booking.findMany({
        where: whereClause,
        select: {
          id: true,
          bookingNumber: true,
          quantity: true,
          currency: true,
          subtotal: true,
          discount: true,
          couponDiscount: true,
          platformFee: true,
          bookingFee: true,
          serviceCharge: true,
          gstAmount: true,
          totalAmount: true,
          paymentStatus: true,
          bookingStatus: true,
          paymentGateway: true,
          createdAt: true,
          customer: {
            select: { id: true, email: true, firstName: true, lastName: true, phone: true },
          },
          event: {
            select: { id: true, title: true, status: true },
          },
          items: {
            select: {
              id: true,
              quantity: true,
              unitPrice: true,
              ticketType: { select: { id: true, name: true, price: true } },
              section: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
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
        totalPages: Math.max(1, Math.ceil(total / limitNumber) || 1),
      },
    };
  }

  static async findBookingById(id, organizerId) {
    return prisma.booking.findFirst({
      where: organizerId ? { id, event: { organizerId } } : { id },
      include: {
        customer: true,
        event: true,
        items: {
          include: {
            ticketType: true,
            section: true,
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

  static async getOrganizerAnalytics(organizerId, role = null) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      monthlyRevenueResult,
      todaySalesResult,
      upcomingEventsCount,
      completedEventsCount,
      totalTicketsSoldResult,
    ] = await Promise.all([
      // Monthly Revenue
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: {
          bookingStatus: { in: [BookingStatus.Confirmed, BookingStatus.CheckedIn] },
          createdAt: { gte: startOfMonth },
        },
      }),
      // Today's Sales
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: {
          bookingStatus: { in: [BookingStatus.Confirmed, BookingStatus.CheckedIn] },
          createdAt: { gte: startOfToday },
        },
      }),
      // Upcoming Events count
      prisma.event.count({
        where: {
          status: { in: [EventStatus.Published, EventStatus.Approved] },
          isDeleted: false,
        },
      }),
      // Completed Events count
      prisma.event.count({
        where: {
          status: EventStatus.Completed,
          isDeleted: false,
        },
      }),
      // Total Issued Tickets Count
      prisma.ticket.count({
        where: {
          status: { in: ['ISSUED', 'CHECKED_IN'] },
        },
      }),
    ]);

    return {
      monthlyRevenue: monthlyRevenueResult._sum.totalAmount || 0,
      todaySales: todaySalesResult._sum.totalAmount || 0,
      upcomingEventsCount,
      completedEventsCount,
      totalTicketsSold: totalTicketsSoldResult,
    };
  }
}
