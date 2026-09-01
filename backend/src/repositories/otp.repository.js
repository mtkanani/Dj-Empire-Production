import { prisma } from '../config/prisma.js';

/**
 * OTP Repository encapsulating One-Time Password database operations
 */
export class OtpRepository {
  static async createOtp(otpData) {
    return prisma.oTP.create({
      data: otpData,
    });
  }

  static async findLatestOtp(userId, purpose) {
    return prisma.oTP.findFirst({
      where: {
        userId,
        purpose,
        isUsed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async findByRequestId(requestId) {
    if (!requestId) return null;
    return prisma.oTP.findFirst({
      where: { requestId },
    });
  }

  static async findByResetTokenHash(hashedResetToken) {
    if (!hashedResetToken) return null;
    return prisma.oTP.findFirst({
      where: {
        hashedResetToken,
        resetCompletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async incrementAttempts(id) {
    return prisma.oTP.update({
      where: { id },
      data: {
        verifyAttempts: {
          increment: 1,
        },
      },
    });
  }

  static async updateResendOtp(id, hashedOtp, expiresAt, requestId = null) {
    return prisma.oTP.update({
      where: { id },
      data: {
        hashedOtp,
        expiresAt,
        verifyAttempts: 0,
        lastSentAt: new Date(),
        isUsed: false,
        verifiedAt: null,
        hashedResetToken: null,
        resetTokenExpiresAt: null,
        resetCompletedAt: null,
        ...(requestId ? { requestId } : {}),
        resendCount: {
          increment: 1,
        },
      },
    });
  }

  static async markUsed(id) {
    return prisma.oTP.update({
      where: { id },
      data: {
        isUsed: true,
      },
    });
  }

  static async markVerified(id, hashedResetToken, resetTokenExpiresAt) {
    return prisma.oTP.update({
      where: { id },
      data: {
        isUsed: true,
        verifiedAt: new Date(),
        hashedResetToken,
        resetTokenExpiresAt,
      },
    });
  }

  static async markResetCompleted(id) {
    return prisma.oTP.update({
      where: { id },
      data: {
        resetCompletedAt: new Date(),
        hashedResetToken: null,
      },
    });
  }

  static async invalidatePreviousOtps(userId, purpose) {
    return prisma.oTP.updateMany({
      where: {
        userId,
        purpose,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });
  }
}
