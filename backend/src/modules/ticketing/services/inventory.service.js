import { prisma } from '../../../config/prisma.js';
import { SeatStatus } from '@prisma/client';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import { RealtimeService } from '../../realtime/index.js';
import { logger } from '../../../config/logger.js';
import { buildSeatRecords, isStandingLayout } from '../utils/seatGenerator.util.js';
import { SeatMapRepository } from '../repositories/ticketingSubResource.repository.js';

/**
 * Single Source of Truth Inventory & Real-Time Seat Management Engine
 */
export class InventoryService {
  /**
   * 1. Calculate and return live event inventory statistics
   * Single Source of Truth Formula: Available = Total - Held - Sold - Blocked
   */
  static async getLiveInventory(eventId) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        sections: {
          include: {
            ticketTypes: true,
          },
        },
        ticketTypes: true,
      },
    });

    if (!event) {
      throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);
    }

    const sectionsSummary = await Promise.all(
      event.sections.map(async (sec) => {
        const seats = await prisma.seatMap.findMany({ where: { sectionId: sec.id } });

        let total = seats.length > 0 ? seats.length : sec.capacity;
        let held = 0;
        let sold = 0;
        let blocked = 0;

        if (seats.length > 0) {
          const now = new Date();
          seats.forEach((s) => {
            if (s.status === SeatStatus.SOLD || s.isBooked) sold++;
            else if (s.status === SeatStatus.BLOCKED || s.isBlocked) blocked++;
            else if (s.status === SeatStatus.HELD && s.heldUntil && s.heldUntil > now) held++;
          });
        } else {
          sold = sec.soldCapacity;
          held = sec.reservedCapacity;
          blocked = 0;
        }

        const available = Math.max(0, total - held - sold - blocked);

        return {
          id: sec.id,
          name: sec.name,
          color: sec.color,
          layoutType: sec.layoutType,
          total,
          available,
          held,
          sold,
          blocked,
          occupancyPercentage: total > 0 ? parseFloat(((sold / total) * 100).toFixed(1)) : 0,
        };
      })
    );

    const totalCapacity = sectionsSummary.reduce((acc, s) => acc + s.total, 0) || event.price || 0;
    const totalSold = sectionsSummary.reduce((acc, s) => acc + s.sold, 0);
    const totalHeld = sectionsSummary.reduce((acc, s) => acc + s.held, 0);
    const totalBlocked = sectionsSummary.reduce((acc, s) => acc + s.blocked, 0);
    const totalAvailable = Math.max(0, totalCapacity - totalSold - totalHeld - totalBlocked);
    const occupancyPercentage = totalCapacity > 0 ? parseFloat(((totalSold / totalCapacity) * 100).toFixed(1)) : 0;

    return {
      eventId,
      totalCapacity,
      available: totalAvailable,
      held: totalHeld,
      sold: totalSold,
      blocked: totalBlocked,
      occupancyPercentage,
      sections: sectionsSummary,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * 2. Get Section Seat Map Grid & Seats Status Metadata
   */
  static async getSectionSeats(eventId, sectionId) {
    const section = await prisma.eventSection.findUnique({
      where: { id: sectionId },
    });

    if (!section || section.eventId !== eventId) {
      throw new AppError('Section not found for this event', HTTP_STATUS.NOT_FOUND);
    }

    await this.ensureGridSeats(section);

    const seats = await prisma.seatMap.findMany({
      where: { sectionId },
      orderBy: [{ row: 'asc' }, { column: 'asc' }],
    });

    const now = new Date();
    let availableCount = 0;
    let heldCount = 0;
    let soldCount = 0;
    let blockedCount = 0;

    const sanitizedSeats = seats.map((s) => {
      let status = s.status || SeatStatus.AVAILABLE;

      if (s.isBlocked || status === SeatStatus.BLOCKED) {
        status = SeatStatus.BLOCKED;
        blockedCount++;
      } else if (s.isBooked || status === SeatStatus.SOLD) {
        status = SeatStatus.SOLD;
        soldCount++;
      } else if (status === SeatStatus.HELD && s.heldUntil && s.heldUntil > now) {
        heldCount++;
      } else {
        status = SeatStatus.AVAILABLE;
        availableCount++;
      }

      return {
        id: s.id,
        sectionId: s.sectionId,
        row: s.row,
        column: s.column,
        seatNumber: s.seatNumber,
        seatType: s.seatType,
        status,
        heldUntil: s.heldUntil,
        soldAt: s.soldAt,
      };
    });

    const total = seats.length || section.capacity;

    return {
      section: {
        id: section.id,
        name: section.name,
        color: section.color,
        capacity: section.capacity,
        layoutType: section.layoutType,
      },
      summary: {
        total,
        available: availableCount,
        held: heldCount,
        sold: soldCount,
        blocked: blockedCount,
      },
      seats: sanitizedSeats,
    };
  }

  static async ensureGridSeats(section) {
    if (!section || isStandingLayout(section.layoutType, section.name)) return 0;
    const existing = await SeatMapRepository.countBySectionId(section.id);
    if (existing > 0) return existing;
    const records = buildSeatRecords(section.capacity);
    if (records.length === 0) return 0;
    await SeatMapRepository.createSeats(section.id, records);
    return records.length;
  }

  static async resolveLineItems({ eventId, sectionId, ticketTypeId, seatIds = [], quantity = 1, items = [] }) {
    const rawItems =
      Array.isArray(items) && items.length > 0
        ? items
        : [{ sectionId, ticketTypeId, seatIds, quantity }];

    const resolved = [];
    for (const item of rawItems) {
      const qty = parseInt(item.quantity, 10) || 1;
      if (qty <= 0) continue;

      let targetTicketTypeId = item.ticketTypeId || null;
      let targetSectionId = item.sectionId || null;

      if (targetTicketTypeId) {
        const ticketType = await prisma.ticketType.findUnique({ where: { id: targetTicketTypeId } });
        if (ticketType && !targetSectionId) targetSectionId = ticketType.sectionId;
      }

      if (targetSectionId) {
        const section = await prisma.eventSection.findUnique({ where: { id: targetSectionId } });
        if (!section || (eventId && section.eventId !== eventId)) {
          throw new AppError('Specified section was not found for this event', HTTP_STATUS.NOT_FOUND);
        }
        await this.ensureGridSeats(section);
      }

      resolved.push({
        quantity: qty,
        ticketTypeId: targetTicketTypeId,
        sectionId: targetSectionId,
        seatIds: Array.isArray(item.seatIds) ? item.seatIds : [],
      });
    }

    if (resolved.length === 0) {
      throw new AppError('No tickets selected', HTTP_STATUS.BAD_REQUEST);
    }

    return resolved;
  }

  static async adjustSectionCounters(sectionId, { reservedDelta = 0, soldDelta = 0 }) {
    const sec = await prisma.eventSection.findUnique({ where: { id: sectionId } });
    if (!sec) return null;

    const newReserved = Math.max(0, sec.reservedCapacity + reservedDelta);
    const newSold = Math.max(0, sec.soldCapacity + soldDelta);
    const newAvailable = Math.max(0, sec.capacity - newReserved - newSold);

    await prisma.eventSection.update({
      where: { id: sectionId },
      data: { reservedCapacity: newReserved, soldCapacity: newSold, availableCapacity: newAvailable },
    });

    const inventoryRow = await prisma.ticketInventory.findFirst({ where: { sectionId } });
    if (inventoryRow) {
      const invReserved = Math.max(0, inventoryRow.reservedQuantity + reservedDelta);
      const invSold = Math.max(0, inventoryRow.soldQuantity + soldDelta);
      await prisma.ticketInventory.update({
        where: { id: inventoryRow.id },
        data: {
          reservedQuantity: invReserved,
          soldQuantity: invSold,
          availableQuantity: Math.max(
            0,
            inventoryRow.totalQuantity - invReserved - invSold - inventoryRow.blockedQuantity
          ),
        },
      });
    }

    return { newReserved, newSold, newAvailable };
  }

  static async adjustTicketAvailability(ticketTypeId, delta) {
    if (!ticketTypeId) return;
    const tt = await prisma.ticketType.findUnique({ where: { id: ticketTypeId } });
    if (!tt) return;
    const newAvailable = Math.max(0, Math.min(tt.quantityTotal, tt.quantityAvailable + delta));
    await prisma.ticketType.update({
      where: { id: ticketTypeId },
      data: { quantityAvailable: newAvailable },
    });
  }

  /**
   * 3. Hold seats / quantities, scoped to each ticket type's own section.
   */
  static async holdSeats(userId, payload) {
    const { eventId, holdDurationMinutes = 10, reservationLockId = null } = payload;
    const expiresAt = new Date(Date.now() + holdDurationMinutes * 60 * 1000);
    const lineItems = await this.resolveLineItems(payload);
    const heldSeatRecords = [];

    for (const item of lineItems) {
      const { quantity, ticketTypeId, sectionId: targetSectionId, seatIds } = item;

      if (ticketTypeId) {
        const tt = await prisma.ticketType.findUnique({ where: { id: ticketTypeId } });
        if (tt && tt.quantityAvailable < quantity) {
          throw new AppError(
            `Requested quantity (${quantity}) exceeds available tickets for ${tt.name}`,
            HTTP_STATUS.BAD_REQUEST
          );
        }
      }

      if (targetSectionId) {
        const section = await prisma.eventSection.findUnique({ where: { id: targetSectionId } });
        if (section && section.availableCapacity < quantity) {
          throw new AppError(
            `Requested quantity (${quantity}) exceeds available capacity for ${section.name}`,
            HTTP_STATUS.BAD_REQUEST
          );
        }

        const seatCount = await prisma.seatMap.count({ where: { sectionId: targetSectionId } });

        if (seatCount > 0) {
          let targetSeats;

          if (seatIds.length > 0) {
            targetSeats = await prisma.seatMap.findMany({
              where: {
                id: { in: seatIds },
                sectionId: targetSectionId,
                status: SeatStatus.AVAILABLE,
                isBooked: false,
                isBlocked: false,
              },
            });
            if (targetSeats.length !== seatIds.length) {
              throw new AppError(
                'One or more selected seats are no longer available in this section.',
                HTTP_STATUS.BAD_REQUEST
              );
            }
          } else {
            targetSeats = await prisma.seatMap.findMany({
              where: {
                sectionId: targetSectionId,
                status: SeatStatus.AVAILABLE,
                isBooked: false,
                isBlocked: false,
              },
              orderBy: [{ row: 'asc' }, { column: 'asc' }],
              take: quantity,
            });
            if (targetSeats.length < quantity) {
              throw new AppError(
                `Requested quantity (${quantity}) exceeds available seats in this section`,
                HTTP_STATUS.BAD_REQUEST
              );
            }
          }

          const idsToHold = targetSeats.map((s) => s.id);
          await prisma.seatMap.updateMany({
            where: { id: { in: idsToHold }, sectionId: targetSectionId },
            data: {
              status: SeatStatus.HELD,
              heldUntil: expiresAt,
              ...(reservationLockId ? { reservationLockId } : {}),
            },
          });

          const updatedSeats = await prisma.seatMap.findMany({ where: { id: { in: idsToHold } } });
          heldSeatRecords.push(...updatedSeats);
        }

        await this.adjustSectionCounters(targetSectionId, { reservedDelta: quantity });
      }

      if (ticketTypeId) {
        await this.adjustTicketAvailability(ticketTypeId, -quantity);
      }
    }

    const updatedInventory = await this.getLiveInventory(eventId);

    heldSeatRecords.forEach((seat) => {
      RealtimeService.broadcastSeatHeld({
        eventId,
        sectionId: seat.sectionId,
        seat: {
          id: seat.id,
          seatNumber: seat.seatNumber,
          row: seat.row,
          status: SeatStatus.HELD,
          heldUntil: expiresAt,
        },
        inventory: updatedInventory,
      });
    });

    RealtimeService.broadcastEventAvailability({
      eventId,
      availability: updatedInventory,
    });

    return {
      success: true,
      heldSeats: heldSeatRecords,
      expiresAt,
      inventory: updatedInventory,
    };
  }

  /**
   * 4. Release Expired Held Seats and Reservation Locks (HELD -> AVAILABLE)
   */
  static async releaseExpiredSeats() {
    const now = new Date();

    // 1. Find all expired reservation locks
    const expiredLocks = await prisma.reservationLock.findMany({
      where: {
        status: 'LOCKED',
        expiresAt: { lte: now },
      },
    });

    // 2. Mark expired locks as EXPIRED and restore counters
    for (const lock of expiredLocks) {
      await prisma.reservationLock.update({
        where: { id: lock.id },
        data: { status: 'EXPIRED' },
      });

      if (lock.sectionId) {
        await this.adjustSectionCounters(lock.sectionId, { reservedDelta: -lock.lockedQuantity });
      }
      if (lock.ticketTypeId) {
        await this.adjustTicketAvailability(lock.ticketTypeId, lock.lockedQuantity);
      }
    }

    // 3. Find and release expired HELD seats
    const expiredLockIds = expiredLocks.map((l) => l.id);
    const expiredSeats = await prisma.seatMap.findMany({
      where: {
        status: SeatStatus.HELD,
        OR: [
          { heldUntil: { lte: now } },
          ...(expiredLockIds.length > 0 ? [{ reservationLockId: { in: expiredLockIds } }] : []),
        ],
      },
      include: {
        section: true,
        reservationLock: true,
      },
    });

    if (expiredSeats.length === 0 && expiredLocks.length === 0) return { releasedCount: 0 };

    const expiredSeatIds = expiredSeats.map((s) => s.id);
    if (expiredSeatIds.length > 0) {
      await prisma.seatMap.updateMany({
        where: { id: { in: expiredSeatIds } },
        data: {
          status: SeatStatus.AVAILABLE,
          heldUntil: null,
          reservationLockId: null,
          bookingId: null,
        },
      });
    }

    // Broadcast seat releases
    const sectionGroupMap = {};
    expiredSeats.forEach((seat) => {
      sectionGroupMap[seat.sectionId] = (sectionGroupMap[seat.sectionId] || 0) + 1;
    });

    for (const [secId] of Object.entries(sectionGroupMap)) {
      const sec = await prisma.eventSection.findUnique({ where: { id: secId } });
      if (!sec) continue;

      const updatedInventory = await this.getLiveInventory(sec.eventId);
      expiredSeats
        .filter((s) => s.sectionId === secId)
        .forEach((seat) => {
          RealtimeService.broadcastSeatReleased({
            eventId: sec.eventId,
            sectionId: secId,
            seat: {
              id: seat.id,
              seatNumber: seat.seatNumber,
              row: seat.row,
              status: SeatStatus.AVAILABLE,
            },
            inventory: updatedInventory,
          });
        });
    }

    logger.info(`✅ Released ${expiredLocks.length} expired locks & ${expiredSeats.length} held seats back to AVAILABLE`);
    return { releasedCount: expiredSeats.length + expiredLocks.length };
  }

  /**
   * 5. Confirm Seats (HELD/AVAILABLE -> SOLD) upon Payment Verification
   * Returns assigned seats grouped for ticket issuance. Does not decrement ticket stock
   * when inventory was already held during reservation.
   */
  static async confirmSeatsForBooking(booking, { alreadyHeld = false } = {}) {
    const eventId = booking.eventId;
    const items =
      booking.items && booking.items.length > 0
        ? booking.items
        : [{ ticketTypeId: booking.ticketTypeId, sectionId: booking.sectionId, quantity: booking.quantity }];

    const assignedByTicketType = {};

    for (const item of items) {
      if (!item.quantity || item.quantity <= 0) continue;

      let targetSectionId = item.sectionId;
      const targetTicketTypeId = item.ticketTypeId;

      if (!targetSectionId && targetTicketTypeId) {
        const tt = await prisma.ticketType.findUnique({ where: { id: targetTicketTypeId } });
        if (tt && tt.sectionId) targetSectionId = tt.sectionId;
      }

      let targetSeats = [];

      if (targetSectionId) {
        targetSeats = await prisma.seatMap.findMany({
          where: {
            sectionId: targetSectionId,
            bookingId: booking.id,
            status: { in: [SeatStatus.HELD, SeatStatus.AVAILABLE] },
            isBlocked: false,
          },
          orderBy: [{ row: 'asc' }, { column: 'asc' }],
          take: item.quantity,
        });

        if (targetSeats.length < item.quantity) {
          const remaining = item.quantity - targetSeats.length;
          const extra = await prisma.seatMap.findMany({
            where: {
              sectionId: targetSectionId,
              id: { notIn: targetSeats.map((s) => s.id) },
              status: { in: [SeatStatus.HELD, SeatStatus.AVAILABLE] },
              isBooked: false,
              isBlocked: false,
            },
            orderBy: [{ row: 'asc' }, { column: 'asc' }],
            take: remaining,
          });
          targetSeats = [...targetSeats, ...extra];
        }

        if (targetSeats.length > 0) {
          const seatIdsToSell = targetSeats.map((s) => s.id);
          await prisma.seatMap.updateMany({
            where: { id: { in: seatIdsToSell }, sectionId: targetSectionId },
            data: {
              status: SeatStatus.SOLD,
              isBooked: true,
              bookingId: booking.id,
              soldAt: new Date(),
              heldUntil: null,
            },
          });
        }

        if (alreadyHeld) {
          await this.adjustSectionCounters(targetSectionId, { reservedDelta: -item.quantity, soldDelta: item.quantity });
        } else {
          await this.adjustSectionCounters(targetSectionId, { soldDelta: item.quantity });
        }
      }

      if (targetTicketTypeId && !alreadyHeld) {
        await this.adjustTicketAvailability(targetTicketTypeId, -item.quantity);
      }

      assignedByTicketType[targetTicketTypeId || 'unknown'] = targetSeats;
    }

    const updatedInventory = await this.getLiveInventory(eventId);

    RealtimeService.broadcastBookingConfirmed(booking);
    RealtimeService.broadcastEventAvailability({ eventId, availability: updatedInventory });

    return { inventory: updatedInventory, assignedByTicketType };
  }

  /**
   * 6. Block / Unblock Physical Seats (Admin / Organizer)
   */
  static async setSeatsBlockedStatus(sectionId, seatIds = [], isBlocked = true) {
    const section = await prisma.eventSection.findUnique({ where: { id: sectionId } });
    if (!section) throw new AppError('Section not found', HTTP_STATUS.NOT_FOUND);

    const newStatus = isBlocked ? SeatStatus.BLOCKED : SeatStatus.AVAILABLE;

    await prisma.seatMap.updateMany({
      where: { id: { in: seatIds }, sectionId },
      data: {
        isBlocked,
        status: newStatus,
      },
    });

    const updatedSeats = await prisma.seatMap.findMany({ where: { id: { in: seatIds } } });
    const updatedInventory = await this.getLiveInventory(section.eventId);

    updatedSeats.forEach((seat) => {
      RealtimeService.broadcastSeatBlocked({
        eventId: section.eventId,
        sectionId,
        seat: {
          id: seat.id,
          seatNumber: seat.seatNumber,
          row: seat.row,
          status: newStatus,
        },
        isBlocked,
        inventory: updatedInventory,
      });
    });

    return {
      success: true,
      updatedSeats,
      inventory: updatedInventory,
    };
  }
}
