import { prisma } from '../config/prisma.js';
import { EventStatus } from '@prisma/client';

/**
 * Customer Repository for Wishlist, Reviews, Notifications, and Event Discovery queries
 */
export class CustomerRepository {
  // ==================== EVENT BROWSING & SEARCH ====================
  static async searchEvents(query = {}) {
    const { search, categoryId, cityId, minPrice, maxPrice, startDate, endDate } = query;

    const whereClause = {
      status: EventStatus.Published,
    };

    if (search) {
      whereClause.OR = [{ title: { contains: String(search) } }];
    }

    if (categoryId) whereClause.categoryId = categoryId;
    if (cityId) whereClause.cityId = cityId;

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.price = {};
      if (minPrice !== undefined) whereClause.price.gte = parseFloat(minPrice);
      if (maxPrice !== undefined) whereClause.price.lte = parseFloat(maxPrice);
    }

    if (startDate || endDate) {
      whereClause.schedules = {
        some: {
          startDate: startDate ? { gte: new Date(startDate) } : undefined,
          endDate: endDate ? { lte: new Date(endDate) } : undefined,
        },
      };
    }

    const take = Math.max(1, Math.min(36, parseInt(query.limit, 10) || 24));

    return prisma.event.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        currency: true,
        price: true,
        createdAt: true,
        category: { select: { id: true, name: true } },
        city: { select: { id: true, name: true } },
        venue: { select: { id: true, name: true } },
        eventVenue: { select: { venueName: true, city: true } },
        schedules: {
          select: { id: true, startDate: true, endDate: true, startTime: true, endTime: true },
          orderBy: { startDate: 'asc' },
          take: 1,
        },
        images: {
          select: { imageUrl: true, type: true, displayOrder: true },
          orderBy: { displayOrder: 'asc' },
          take: 4,
        },
        ticketTypes: {
          where: { isActive: true },
          select: { id: true, name: true, price: true },
          take: 12,
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  static async findPublicEventById(id) {
    return prisma.event.findFirst({
      where: {
        id,
        status: EventStatus.Published,
      },
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
        ticketTypes: {
          where: { isActive: true },
          include: { section: true },
        },
        reviews: {
          take: 8,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  // ==================== WISHLIST OPERATIONS ====================
  static async addToWishlist(userId, eventId) {
    return prisma.wishlist.create({
      data: { userId, eventId },
      include: {
        event: {
          include: {
            images: true,
            category: true,
            city: true,
            venue: true,
          },
        },
      },
    });
  }

  static async removeFromWishlist(userId, eventId) {
    return prisma.wishlist.deleteMany({
      where: { userId, eventId },
    });
  }

  static async findWishlistByUser(userId) {
    return prisma.wishlist.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            category: true,
            city: true,
            venue: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async isEventInWishlist(userId, eventId) {
    const item = await prisma.wishlist.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });
    return !!item;
  }

  // ==================== REVIEWS & RATINGS ====================
  static async createReview(data) {
    return prisma.review.create({
      data,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  static async findReviewById(id) {
    return prisma.review.findUnique({ where: { id } });
  }

  static async updateReview(id, data) {
    return prisma.review.update({
      where: { id },
      data,
    });
  }

  static async deleteReview(id) {
    return prisma.review.delete({ where: { id } });
  }

  // ==================== NOTIFICATIONS ====================
  static async findNotificationsByUser(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async markNotificationAsRead(id, userId) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  static async createNotification(userId, title, message) {
    return prisma.notification.create({
      data: { userId, title, message },
    });
  }
}
