import { prisma } from '../../../config/prisma.js';

/**
 * Sub-resource Repository for Event Schedules, Venue, Images, FAQs, Policy, and SEO
 */

// ==================== SCHEDULE REPOSITORY ====================
export class ScheduleRepository {
  static async create(eventId, data) {
    return prisma.eventSchedule.create({
      data: {
        eventId,
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });
  }

  static async findByEventId(eventId) {
    return prisma.eventSchedule.findMany({
      where: { eventId },
      orderBy: { startDate: 'asc' },
    });
  }

  static async findById(id) {
    return prisma.eventSchedule.findUnique({ where: { id } });
  }

  static async update(id, data) {
    const updateData = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    return prisma.eventSchedule.update({
      where: { id },
      data: updateData,
    });
  }

  static async delete(id) {
    return prisma.eventSchedule.delete({ where: { id } });
  }
}

// ==================== VENUE REPOSITORY ====================
export class EventVenueRepository {
  static async upsert(eventId, data) {
    return prisma.eventVenue.upsert({
      where: { eventId },
      create: { eventId, ...data },
      update: data,
    });
  }

  static async findByEventId(eventId) {
    return prisma.eventVenue.findUnique({ where: { eventId } });
  }

  static async delete(eventId) {
    return prisma.eventVenue.delete({ where: { eventId } });
  }
}

// ==================== IMAGE REPOSITORY ====================
export class ImageRepository {
  static async create(eventId, data) {
    return prisma.eventImage.create({
      data: { eventId, ...data },
    });
  }

  static async upsertByType(eventId, type, data) {
    const existing = await prisma.eventImage.findFirst({
      where: { eventId, type },
      orderBy: { displayOrder: 'asc' },
    });

    if (existing) {
      return prisma.eventImage.update({
        where: { id: existing.id },
        data,
      });
    }

    return prisma.eventImage.create({
      data: { eventId, type, ...data },
    });
  }

  static async findByEventId(eventId) {
    return prisma.eventImage.findMany({
      where: { eventId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  static async findById(id) {
    return prisma.eventImage.findUnique({ where: { id } });
  }

  static async update(id, data) {
    return prisma.eventImage.update({
      where: { id },
      data,
    });
  }

  static async delete(id) {
    return prisma.eventImage.delete({ where: { id } });
  }
}

// ==================== FAQ REPOSITORY ====================
export class FAQRepository {
  static async create(eventId, data) {
    return prisma.eventFAQ.create({
      data: { eventId, ...data },
    });
  }

  static async findByEventId(eventId) {
    return prisma.eventFAQ.findMany({
      where: { eventId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  static async findById(id) {
    return prisma.eventFAQ.findUnique({ where: { id } });
  }

  static async update(id, data) {
    return prisma.eventFAQ.update({
      where: { id },
      data,
    });
  }

  static async delete(id) {
    return prisma.eventFAQ.delete({ where: { id } });
  }
}

// ==================== POLICY REPOSITORY ====================
export class PolicyRepository {
  static async upsert(eventId, data) {
    return prisma.eventPolicy.upsert({
      where: { eventId },
      create: { eventId, ...data },
      update: data,
    });
  }

  static async findByEventId(eventId) {
    return prisma.eventPolicy.findUnique({ where: { eventId } });
  }
}

// ==================== SEO REPOSITORY ====================
export class SEORepository {
  static async upsert(eventId, data) {
    return prisma.eventSEO.upsert({
      where: { eventId },
      create: { eventId, ...data },
      update: data,
    });
  }

  static async findByEventId(eventId) {
    return prisma.eventSEO.findUnique({ where: { eventId } });
  }
}
