import { prisma } from '../config/prisma.js';

/**
 * Venue Repository for Venue CRUD operations
 */
export class VenueRepository {
  static async create(data) {
    return prisma.venue.create({
      data,
      include: { city: true },
    });
  }

  static async findAll() {
    return prisma.venue.findMany({
      include: { city: true },
      orderBy: { name: 'asc' },
    });
  }

  static async findById(id) {
    return prisma.venue.findUnique({
      where: { id },
      include: { city: true },
    });
  }

  static async update(id, data) {
    return prisma.venue.update({
      where: { id },
      data,
      include: { city: true },
    });
  }

  static async delete(id) {
    return prisma.venue.delete({ where: { id } });
  }
}
