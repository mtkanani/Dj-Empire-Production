import { prisma } from '../../../config/prisma.js';

/**
 * Event Repository for Multi-Tenant CRUD Operations, Soft Delete, and Search
 */
export class EventRepository {
  /**
   * Create Event Record
   */
  static async create(data) {
    return prisma.event.create({
      data,
      include: {
        category: true,
        city: true,
        venue: true,
        eventVenue: true,
        schedules: true,
        images: true,
        faqs: true,
        policy: true,
        seo: true,
        ticketTypes: true,
      },
    });
  }

  /**
   * Find Event by ID or Slug (with optional soft-delete filter)
   */
  static async findById(id, includeDeleted = false) {
    const whereClause = { id };
    if (!includeDeleted) {
      whereClause.isDeleted = false;
    }

    return prisma.event.findFirst({
      where: whereClause,
      include: {
        organizer: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        category: true,
        city: true,
        venue: true,
        eventVenue: true,
        schedules: true,
        images: true,
        faqs: true,
        policy: true,
        seo: true,
        ticketTypes: true,
        reviews: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  /**
   * Find Event by Slug
   */
  static async findBySlug(slug) {
    return prisma.event.findUnique({
      where: { slug },
    });
  }

  /**
   * Update Event Record
   */
  static async update(id, data) {
    return prisma.event.update({
      where: { id },
      data,
      include: {
        category: true,
        eventVenue: true,
        schedules: true,
        images: true,
        faqs: true,
        policy: true,
        seo: true,
      },
    });
  }

  /**
   * Update Event Status Lifecycle State
   */
  static async updateStatus(id, status) {
    return prisma.event.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Soft Delete Event
   */
  static async softDelete(id) {
    return prisma.event.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Restore Soft-Deleted Event
   */
  static async restore(id) {
    return prisma.event.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  /**
   * Permanently Purge Event
   */
  static async permanentDelete(id) {
    return prisma.event.delete({
      where: { id },
    });
  }

  /**
   * Search and Filter Events with Pagination & RBAC Tenancy Guards
   */
  static async searchAndFilter(params = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      categoryId,
      eventType,
      organizerId,
      status,
      city,
      visibility,
      startDate,
      endDate,
      includeDeleted = false,
    } = params;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause = {
      isDeleted: includeDeleted ? undefined : false,
    };

    if (organizerId) whereClause.organizerId = organizerId;
    if (status) whereClause.status = status;
    if (categoryId) whereClause.categoryId = categoryId;
    if (eventType) whereClause.eventType = eventType;
    if (visibility) whereClause.visibility = visibility;

    if (city) {
      whereClause.OR = [
        { city: { name: { contains: city, mode: 'insensitive' } } },
        { eventVenue: { city: { contains: city, mode: 'insensitive' } } },
      ];
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      whereClause.schedules = {
        some: {
          startDate: startDate ? { gte: new Date(startDate) } : undefined,
          endDate: endDate ? { lte: new Date(endDate) } : undefined,
        },
      };
    }

    const [total, data] = await Promise.all([
      prisma.event.count({ where: whereClause }),
      prisma.event.findMany({
        where: whereClause,
        include: {
          category: true,
          city: true,
          eventVenue: true,
          schedules: { orderBy: { startDate: 'asc' } },
          images: true,
          ticketTypes: {
            where: { isActive: true },
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
}
