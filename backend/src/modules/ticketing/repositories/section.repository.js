import { prisma } from '../../../config/prisma.js';

/**
 * Event Section Repository for Section CRUD & Capacity Aggregation
 */
export class SectionRepository {
  static async create(eventId, data) {
    return prisma.eventSection.create({
      data: {
        eventId,
        ...data,
        availableCapacity: data.capacity,
      },
      include: {
        ticketTypes: true,
      },
    });
  }

  static async findByEventId(eventId) {
    return prisma.eventSection.findMany({
      where: { eventId },
      include: {
        ticketTypes: true,
        inventories: true,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  static async findById(id) {
    return prisma.eventSection.findUnique({
      where: { id },
      include: {
        event: true,
        ticketTypes: true,
        inventories: true,
      },
    });
  }

  static async findByName(eventId, name) {
    return prisma.eventSection.findFirst({
      where: { eventId, name },
    });
  }

  static async update(id, data) {
    return prisma.eventSection.update({
      where: { id },
      data,
      include: { ticketTypes: true },
    });
  }

  static async delete(id) {
    return prisma.eventSection.delete({ where: { id } });
  }

  /**
   * Calculate total capacity across all existing sections for an event (excluding current section being updated)
   */
  static async calculateTotalSectionCapacity(eventId, excludeSectionId = null) {
    const whereClause = { eventId };
    if (excludeSectionId) {
      whereClause.id = { not: excludeSectionId };
    }

    const aggregateResult = await prisma.eventSection.aggregate({
      _sum: { capacity: true },
      where: whereClause,
    });

    return aggregateResult._sum.capacity || 0;
  }
}
