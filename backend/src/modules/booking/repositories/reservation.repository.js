import { prisma } from '../../../config/prisma.js';
import { generateReservationNumber } from '../utils/bookingNumberGenerator.util.js';
import { InventoryService } from '../../ticketing/services/inventory.service.js';
import { SeatStatus } from '@prisma/client';

/**
 * Reservation Repository for 15-Minute Atomic Inventory Locking
 */
export class ReservationRepository {
  /**
   * Create Reservation Lock and update section/ticketType inventory reserved quantity
   */
  static async createReservationLock(userId, dto) {
    const {
      eventId,
      scheduleId,
      sectionId,
      ticketTypeId,
      quantity,
      seatIds = [],
      items = [],
    } = dto;

    const lineItems =
      Array.isArray(items) && items.length > 0
        ? items
        : [{ sectionId, ticketTypeId, quantity, seatIds }];

    const totalQty = lineItems.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);
    const primary = lineItems[0] || {};

    const reservationNumber = generateReservationNumber();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const reservation = await prisma.reservationLock.create({
      data: {
        reservationNumber,
        userId,
        eventId,
        scheduleId: scheduleId || null,
        sectionId: primary.sectionId || sectionId || null,
        ticketTypeId: primary.ticketTypeId || ticketTypeId || null,
        lockedQuantity: totalQty || quantity || 1,
        expiresAt,
        status: 'LOCKED',
      },
    });

    try {
      const holdResult = await InventoryService.holdSeats(userId, {
        eventId,
        items: lineItems,
        reservationLockId: reservation.id,
        holdDurationMinutes: 15,
      });

      return {
        ...reservation,
        items: lineItems,
        heldSeats: holdResult.heldSeats || [],
        expiresAt: holdResult.expiresAt || expiresAt,
      };
    } catch (err) {
      await prisma.reservationLock.delete({ where: { id: reservation.id } });
      throw err;
    }
  }

  static async findByReservationNumber(reservationNumber) {
    return prisma.reservationLock.findUnique({
      where: { reservationNumber },
      include: { event: true },
    });
  }

  static async findById(id) {
    return prisma.reservationLock.findUnique({ where: { id } });
  }

  /**
   * Release reservation lock and restore available inventory & section capacity
   */
  static async releaseReservationLock(id, statusOverride = 'EXPIRED') {
    const lock = await prisma.reservationLock.findUnique({ where: { id } });
    if (!lock || lock.status === 'EXPIRED' || lock.status === 'CANCELLED' || lock.status === 'RELEASED') {
      return null;
    }

    const heldSeats = await prisma.seatMap.findMany({ where: { reservationLockId: lock.id } });

    if (heldSeats.length > 0) {
      await prisma.seatMap.updateMany({
        where: { reservationLockId: lock.id },
        data: {
          status: SeatStatus.AVAILABLE,
          heldUntil: null,
          reservationLockId: null,
          bookingId: null,
        },
      });

      const sectionGroupMap = {};
      heldSeats.forEach((seat) => {
        sectionGroupMap[seat.sectionId] = (sectionGroupMap[seat.sectionId] || 0) + 1;
      });

      for (const [secId, qty] of Object.entries(sectionGroupMap)) {
        await InventoryService.adjustSectionCounters(secId, { reservedDelta: -qty });
      }
    } else if (lock.sectionId) {
      await InventoryService.adjustSectionCounters(lock.sectionId, { reservedDelta: -lock.lockedQuantity });
    }

    if (lock.ticketTypeId) {
      await InventoryService.adjustTicketAvailability(lock.ticketTypeId, lock.lockedQuantity);
    }

    return prisma.reservationLock.update({
      where: { id },
      data: { status: statusOverride },
    });
  }
}
