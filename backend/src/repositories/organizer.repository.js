import { prisma } from '../config/prisma.js';

/**
 * Organizer Repository encapsulating OrganizerProfile database operations
 */
export class OrganizerRepository {
  /**
   * Create new OrganizerProfile record linked to User
   * @param {Object} profileData
   * @returns {Promise<Object>}
   */
  static async createProfile(profileData) {
    return prisma.organizerProfile.create({
      data: profileData,
    });
  }

  /**
   * Find OrganizerProfile by User ID
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  static async findByUserId(userId) {
    return prisma.organizerProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  /**
   * Update Organizer approval status
   * @param {string} profileId
   * @param {string} approvalStatus - APPROVED, REJECTED, PENDING
   * @param {string} [rejectionReason]
   * @returns {Promise<Object>}
   */
  static async updateApprovalStatus(profileId, approvalStatus, rejectionReason = null) {
    return prisma.organizerProfile.update({
      where: { id: profileId },
      data: {
        approvalStatus,
        rejectionReason,
      },
    });
  }

  /**
   * Find all Organizer profiles with PENDING approval status
   * @returns {Promise<Array>}
   */
  static async findPendingOrganizers() {
    return prisma.organizerProfile.findMany({
      where: {
        approvalStatus: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
