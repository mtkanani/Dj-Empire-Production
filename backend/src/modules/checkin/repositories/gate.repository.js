import { prisma } from '../../../config/prisma.js';

/**
 * Access Control Gate Repository
 */
export class GateRepository {
  static async createGate(data) {
    return prisma.gate.create({
      data: {
        eventId: data.eventId,
        name: data.name,
        code: data.code.toUpperCase(),
        description: data.description || null,
        allowedSections: data.allowedSections || [],
        capacity: data.capacity || 1000,
        status: true,
      },
    });
  }

  static async findById(id) {
    return prisma.gate.findUnique({
      where: { id },
      include: { devices: true },
    });
  }

  static async findByEvent(eventId) {
    const gates = await prisma.gate.findMany({
      where: { eventId },
      include: { devices: true },
    });

    const scanners = await prisma.scannerAccount.findMany({
      where: { eventId },
    });

    return gates.map((gate) => {
      const assignedScanners = scanners.filter((s) => s.assignedGateIds && s.assignedGateIds.includes(gate.id));
      return {
        ...gate,
        scanners: assignedScanners,
      };
    });
  }

  static async updateGate(id, data) {
    return prisma.gate.update({
      where: { id },
      data,
    });
  }

  static async deleteGate(id) {
    return prisma.gate.delete({ where: { id } });
  }
}
