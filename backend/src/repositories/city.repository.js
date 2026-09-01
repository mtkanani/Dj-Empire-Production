import { prisma } from '../config/prisma.js';

/**
 * City Repository for City CRUD operations
 */
export class CityRepository {
  static async create(data) {
    return prisma.city.create({ data });
  }

  static async findAll() {
    return prisma.city.findMany({
      include: {
        _count: {
          select: { venues: true, events: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async findById(id) {
    return prisma.city.findUnique({
      where: { id },
      include: {
        venues: true,
      },
    });
  }

  static async findByNameOrSlug(name, slug) {
    return prisma.city.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });
  }

  static async update(id, data) {
    return prisma.city.update({
      where: { id },
      data,
    });
  }

  static async delete(id) {
    return prisma.city.delete({ where: { id } });
  }
}
