import { prisma } from '../config/prisma.js';
import { phoneUniqueKey, formatStoredPhone } from '../utils/phone.util.js';

/**
 * User Repository encapsulating User entity data operations
 */
export class UserRepository {
  /**
   * Create a new User record
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  static async createUser(userData) {
    return prisma.user.create({
      data: userData,
    });
  }

  /**
   * Find User by Email (excludes soft-deleted accounts)
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  static async findByEmail(email) {
    if (!email) return null;
    return prisma.user.findFirst({
      where: {
        email: String(email).trim().toLowerCase(),
        isDeleted: false,
      },
      include: {
        organizerProfile: true,
      },
    });
  }

  /**
   * Find User by ID (excludes soft-deleted accounts)
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    return prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        organizerProfile: true,
      },
    });
  }

  /**
   * Update User status
   * @param {string} id
   * @param {string} status
   * @returns {Promise<Object>}
   */
  static async updateStatus(id, status) {
    return prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Update User password
   * @param {string} id
   * @param {string} hashedPassword
   * @returns {Promise<Object>}
   */
  static async updatePassword(id, hashedPassword) {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  static async updateUser(id, data) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static async findByPhone(phone, excludeUserId = null) {
    if (!phone) return null;
    const stored = formatStoredPhone(phone);
    const exact = await prisma.user.findFirst({
      where: {
        isDeleted: false,
        phone: stored,
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
      include: {
        organizerProfile: true,
      },
    });
    if (exact) return exact;

    const users = await prisma.user.findMany({
      where: {
        isDeleted: false,
        phone: { not: null },
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
      include: {
        organizerProfile: true,
      },
    });
    const target = phoneUniqueKey(phone);
    return users.find((u) => phoneUniqueKey(u.phone) === target) || null;
  }

  /**
   * Soft Delete User account
   * @param {string} id
   * @returns {Promise<Object>}
   */
  static async softDelete(id) {
    return prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: 'DELETED',
      },
    });
  }
}
