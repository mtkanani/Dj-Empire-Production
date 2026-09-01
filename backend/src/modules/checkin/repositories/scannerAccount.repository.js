import { prisma } from '../../../config/prisma.js';

/**
 * Scanner Staff Credentials & Account Repository
 */
export class ScannerAccountRepository {
  static async createScannerAccount(data) {
    return prisma.scannerAccount.create({
      data: {
        eventId: data.eventId,
        organizerId: data.organizerId,
        scannerName: data.scannerName,
        scannerEmail: data.scannerEmail.toLowerCase(),
        passwordHash: data.passwordHash,
        assignedSectionIds: data.assignedSectionIds || [],
        assignedGateIds: data.assignedGateIds || [],
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  static async findById(id) {
    return prisma.scannerAccount.findUnique({
      where: { id },
      include: {
        event: {
          select: { id: true, title: true, organizerId: true },
        },
      },
    });
  }

  static async findByEventAndEmail(eventId, scannerEmail) {
    return prisma.scannerAccount.findUnique({
      where: {
        eventId_scannerEmail: {
          eventId,
          scannerEmail: scannerEmail.toLowerCase(),
        },
      },
    });
  }

  static async findByEmailGlobal(scannerEmail) {
    return prisma.scannerAccount.findFirst({
      where: {
        scannerEmail: scannerEmail.toLowerCase(),
        isActive: true,
      },
      include: {
        event: {
          select: { id: true, title: true, organizerId: true },
        },
      },
    });
  }

  static async findByEvent(eventId) {
    return prisma.scannerAccount.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateScannerAccount(id, data) {
    return prisma.scannerAccount.update({
      where: { id },
      data,
    });
  }

  static async incrementScanCount(id) {
    return prisma.scannerAccount.update({
      where: { id },
      data: {
        totalScansCount: { increment: 1 },
        lastScanAt: new Date(),
      },
    });
  }

  static async deleteScannerAccount(id) {
    return prisma.scannerAccount.delete({
      where: { id },
    });
  }
}
