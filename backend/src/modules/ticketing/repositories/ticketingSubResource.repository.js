import { prisma } from '../../../config/prisma.js';

/**
 * Repositories for Dynamic Pricing, Booking Rules, Seat Map, Waitlist, and Coupons
 */

// ==================== TICKET TYPE REPOSITORY ====================
export class TicketTypeRepository {
  static async create(data) {
    return prisma.ticketType.create({ data });
  }

  static async findBySectionId(sectionId) {
    return prisma.ticketType.findMany({
      where: { sectionId },
      orderBy: { price: 'asc' },
    });
  }

  static async findById(id) {
    return prisma.ticketType.findUnique({
      where: { id },
      include: { section: true, event: true },
    });
  }

  static async update(id, data) {
    return prisma.ticketType.update({
      where: { id },
      data,
    });
  }

  static async delete(id) {
    return prisma.ticketType.delete({ where: { id } });
  }
}

// ==================== DYNAMIC PRICING REPOSITORY ====================
export class DynamicPricingRepository {
  static async create(eventId, data) {
    return prisma.dynamicPricing.create({
      data: {
        eventId,
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });
  }

  static async findByEventId(eventId) {
    return prisma.dynamicPricing.findMany({
      where: { eventId, status: true },
      orderBy: { priority: 'desc' },
    });
  }

  static async findById(id) {
    return prisma.dynamicPricing.findUnique({ where: { id } });
  }

  static async update(id, data) {
    const updateData = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    return prisma.dynamicPricing.update({
      where: { id },
      data: updateData,
    });
  }

  static async delete(id) {
    return prisma.dynamicPricing.delete({ where: { id } });
  }
}

// ==================== BOOKING RULES REPOSITORY ====================
export class BookingRulesRepository {
  static async upsert(eventId, data) {
    const updateData = { ...data };
    if (data.bookingOpens) updateData.bookingOpens = new Date(data.bookingOpens);
    if (data.bookingCloses) updateData.bookingCloses = new Date(data.bookingCloses);

    return prisma.bookingRules.upsert({
      where: { eventId },
      create: { eventId, ...updateData },
      update: updateData,
    });
  }

  static async findByEventId(eventId) {
    return prisma.bookingRules.findUnique({ where: { eventId } });
  }
}

// ==================== SEAT MAP REPOSITORY ====================
export class SeatMapRepository {
  static async createSeats(sectionId, seats) {
    if (!seats || seats.length === 0) return { count: 0 };
    return prisma.seatMap.createMany({
      data: seats.map((s) => ({ sectionId, ...s })),
    });
  }

  static async countBySectionId(sectionId) {
    return prisma.seatMap.count({ where: { sectionId } });
  }

  static async findBySectionId(sectionId) {
    return prisma.seatMap.findMany({
      where: { sectionId },
      orderBy: [{ row: 'asc' }, { column: 'asc' }],
    });
  }
}

// ==================== WAITLIST REPOSITORY ====================
export class WaitlistRepository {
  static async addToWaitlist(data) {
    return prisma.waitlist.create({ data });
  }

  static async findByEventId(eventId) {
    return prisma.waitlist.findMany({
      where: { eventId },
      include: { ticketType: true, user: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async delete(id) {
    return prisma.waitlist.delete({ where: { id } });
  }
}

// ==================== COUPON REPOSITORY ====================
export class CouponRepository {
  static async create(data) {
    return prisma.coupon.create({
      data: {
        ...data,
        validFrom: data.validFrom ? new Date(data.validFrom) : new Date(),
        validUntil: new Date(data.validUntil),
      },
    });
  }

  static async findByCode(code) {
    return prisma.coupon.findUnique({ where: { code } });
  }

  static async findAll() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
