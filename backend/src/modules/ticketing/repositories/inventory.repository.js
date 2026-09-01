import { prisma } from '../../../config/prisma.js';
import { calculateAvailableQuantity } from '../utils/inventoryCalculator.util.js';

/**
 * Single Source of Truth Inventory Repository
 */
export class InventoryRepository {
  static async upsertSectionInventory(sectionId, totalQuantity) {
    const available = calculateAvailableQuantity(totalQuantity, 0, 0, 0);

    return prisma.ticketInventory.upsert({
      where: { id: sectionId }, // Using sectionId search
      create: {
        sectionId,
        totalQuantity,
        availableQuantity: available,
      },
      update: {
        totalQuantity,
        availableQuantity: available,
      },
    });
  }

  static async findByEventId(eventId) {
    return prisma.ticketInventory.findMany({
      where: {
        OR: [
          { section: { eventId } },
          { ticketType: { eventId } },
        ],
      },
      include: {
        section: true,
        ticketType: true,
      },
    });
  }

  static async updateInventoryStock(id, { totalQuantity, blockedQuantity, reservedQuantity, soldQuantity }) {
    const current = await prisma.ticketInventory.findUnique({ where: { id } });
    if (!current) return null;

    const newTotal = totalQuantity !== undefined ? totalQuantity : current.totalQuantity;
    const newBlocked = blockedQuantity !== undefined ? blockedQuantity : current.blockedQuantity;
    const newReserved = reservedQuantity !== undefined ? reservedQuantity : current.reservedQuantity;
    const newSold = soldQuantity !== undefined ? soldQuantity : current.soldQuantity;

    const newAvailable = calculateAvailableQuantity(newTotal, newReserved, newSold, newBlocked);

    return prisma.ticketInventory.update({
      where: { id },
      data: {
        totalQuantity: newTotal,
        blockedQuantity: newBlocked,
        reservedQuantity: newReserved,
        soldQuantity: newSold,
        availableQuantity: newAvailable,
      },
    });
  }
}
