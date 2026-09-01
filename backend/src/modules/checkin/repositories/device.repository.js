import { prisma } from '../../../config/prisma.js';
import crypto from 'crypto';

/**
 * Scanner Device Repository
 */
export class DeviceRepository {
  static async registerDevice(data) {
    const deviceId = `DEV-${data.platform}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const apiKey = `sk_scan_${crypto.randomBytes(16).toString('hex')}`;

    return prisma.scannerDevice.create({
      data: {
        eventId: data.eventId,
        gateId: data.gateId || null,
        deviceName: data.deviceName,
        deviceId,
        platform: data.platform || 'ANDROID_SCANNER',
        apiKey,
        status: true,
      },
    });
  }

  static async findById(id) {
    return prisma.scannerDevice.findUnique({
      where: { id },
      include: { gate: true, event: true },
    });
  }

  static async findByApiKey(apiKey) {
    return prisma.scannerDevice.findUnique({
      where: { apiKey },
      include: { gate: true },
    });
  }

  static async findByEvent(eventId) {
    return prisma.scannerDevice.findMany({
      where: { eventId },
      include: { gate: true },
    });
  }

  static async updateSyncTimestamp(id) {
    return prisma.scannerDevice.update({
      where: { id },
      data: { lastSyncAt: new Date() },
    });
  }

  static async deleteDevice(id) {
    return prisma.scannerDevice.delete({ where: { id } });
  }
}
