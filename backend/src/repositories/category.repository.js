import { prisma } from '../config/prisma.js';

/**
 * Category Repository for Category CRUD operations
 */
export class CategoryRepository {
  static async create(data) {
    return prisma.category.create({ data });
  }

  static async findAll() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async findById(id) {
    return prisma.category.findUnique({ where: { id } });
  }

  static async findByNameOrSlug(name, slug) {
    return prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });
  }

  static async update(id, data) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  static async delete(id) {
    return prisma.category.delete({ where: { id } });
  }
}
