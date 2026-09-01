import { prisma } from '../config/prisma.js';
import { Role, ApprovalStatus, EventStatus, BookingStatus } from '@prisma/client';

/**
 * Admin Repository for Dashboard Analytics & User/Organizer Management Queries
 */
export class AdminRepository {
  /**
   * Get Dashboard Analytics Metrics (flat payload for admin KPI cards)
   */
  static async getDashboardMetrics() {
    const eventInclude = {
      organizer: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          organizerProfile: { select: { companyName: true } },
        },
      },
      category: { select: { id: true, name: true } },
      city: { select: { id: true, name: true } },
    };

    const [
      totalUsers,
      totalCustomers,
      totalOrganizers,
      totalEvents,
      publishedEvents,
      totalBookings,
      pendingApprovals,
      pendingOrganizers,
      pendingEvents,
      recentSignups,
    ] = await Promise.all([
      prisma.user.count({
        where: { isDeleted: false, role: { not: Role.SUPER_ADMIN } },
      }),
      prisma.user.count({ where: { role: Role.CUSTOMER, isDeleted: false } }),
      prisma.user.count({ where: { role: Role.EVENT_ORGANIZER, isDeleted: false } }),
      prisma.event.count({ where: { isDeleted: false } }),
      prisma.event.count({ where: { status: EventStatus.Published, isDeleted: false } }),
      prisma.booking.count({
        where: {
          bookingStatus: { in: [BookingStatus.Confirmed, BookingStatus.CheckedIn] },
        },
      }),
      prisma.event.count({
        where: { status: EventStatus.PendingApproval, isDeleted: false },
      }),
      prisma.organizerProfile.count({ where: { approvalStatus: ApprovalStatus.PENDING } }),
      prisma.event.findMany({
        where: { status: EventStatus.PendingApproval, isDeleted: false },
        include: eventInclude,
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.user.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalUsers,
      totalCustomers,
      totalOrganizers,
      totalEvents,
      publishedEvents,
      totalBookings,
      pendingApprovals,
      pendingOrganizers,
      pendingEvents,
      recentSignups,
    };
  }

  /**
   * List all Event Organizers
   */
  static async findAllOrganizers(statusFilter = null) {
    const whereClause = {
      role: Role.EVENT_ORGANIZER,
      isDeleted: false,
    };

    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    return prisma.user.findMany({
      where: whereClause,
      include: {
        organizerProfile: true,
        events: { where: { isDeleted: false } },
        _count: { select: { events: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find Organizer by User ID or Profile ID
   */
  static async findOrganizerById(id) {
    return prisma.user.findFirst({
      where: {
        OR: [{ id }, { organizerProfile: { id } }],
        role: Role.EVENT_ORGANIZER,
        isDeleted: false,
      },
      include: {
        organizerProfile: true,
        events: {
          where: { isDeleted: false },
          include: {
            category: { select: { id: true, name: true } },
            city: { select: { id: true, name: true } },
            venue: { select: { id: true, name: true, capacity: true } },
            schedules: { orderBy: { startDate: 'asc' } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { events: true } },
      },
    });
  }

  /**
   * List all Customers
   */
  static async findAllCustomers() {
    return prisma.user.findMany({
      where: {
        role: Role.CUSTOMER,
        isDeleted: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        createdAt: true,
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find Customer by ID
   */
  static async findCustomerById(id) {
    return prisma.user.findFirst({
      where: {
        id,
        role: Role.CUSTOMER,
        isDeleted: false,
      },
      include: {
        bookings: {
          include: {
            event: true,
          },
        },
      },
    });
  }

  /**
   * List all Platform Events for Super Admin
   */
  static async findAllEvents(statusFilter = null) {
    const whereClause = { isDeleted: false };
    if (statusFilter && statusFilter !== 'ALL') {
      whereClause.status = statusFilter;
    }

    return prisma.event.findMany({
      where: whereClause,
      include: {
        organizer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            organizerProfile: {
              select: { companyName: true },
            },
          },
        },
        category: { select: { id: true, name: true } },
        city: { select: { id: true, name: true } },
        venue: { select: { id: true, name: true, capacity: true } },
        ticketTypes: true,
        schedules: true,
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Platform-wide payments across all organizers / events (Super Admin)
   */
  static async findAllPayments({ page = 1, limit = 50, paymentStatus } = {}) {
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Math.min(200, parseInt(limit, 10) || 50));
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause = {};
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where: whereClause }),
      prisma.payment.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              organizerId: true,
              organizer: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  organizerProfile: {
                    select: { companyName: true },
                  },
                },
              },
            },
          },
          booking: {
            select: {
              id: true,
              bookingNumber: true,
              bookingStatus: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNumber,
      }),
    ]);

    return {
      data: payments,
      meta: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber) || 1,
      },
    };
  }
}
