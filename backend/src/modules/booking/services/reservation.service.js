import { ReservationRepository } from '../repositories/reservation.repository.js';
import { SectionRepository } from '../../ticketing/repositories/section.repository.js';
import { prisma } from '../../../config/prisma.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Service handling 15-Minute Atomic Inventory Lock Reservations
 */
export class ReservationService {
  /**
   * Reserve inventory lock for 15 minutes
   */
  static async reserveInventory(userId, dto) {
    const lineItems =
      Array.isArray(dto.items) && dto.items.length > 0
        ? dto.items
        : [{ sectionId: dto.sectionId, ticketTypeId: dto.ticketTypeId, quantity: dto.quantity, seatIds: dto.seatIds }];

    for (const item of lineItems) {
      let sectionId = item.sectionId;
      if (!sectionId && item.ticketTypeId) {
        const tt = await prisma.ticketType.findUnique({ where: { id: item.ticketTypeId } });
        if (tt?.sectionId) sectionId = tt.sectionId;
      }

      if (sectionId) {
        const section = await SectionRepository.findById(sectionId);
        if (!section) throw new AppError('Specified Section not found', HTTP_STATUS.NOT_FOUND);

        const qty = item.quantity || dto.quantity || 1;
        if (section.availableCapacity < qty) {
          throw new AppError(
            `Insufficient inventory. Requested quantity (${qty}) exceeds available section capacity (${section.availableCapacity}) for ${section.name}`,
            HTTP_STATUS.BAD_REQUEST
          );
        }
      }
    }

    return ReservationRepository.createReservationLock(userId, dto);
  }

  static async getReservation(reservationId) {
    const reservation = await ReservationRepository.findById(reservationId);
    if (!reservation) throw new AppError('Reservation lock not found', HTTP_STATUS.NOT_FOUND);
    return reservation;
  }

  static async cancelReservation(reservationId, userId) {
    const reservation = await this.getReservation(reservationId);
    if (reservation.userId !== userId) {
      throw new AppError('Access denied', HTTP_STATUS.FORBIDDEN);
    }

    await ReservationRepository.releaseReservationLock(reservationId);
    return { message: 'Reservation lock released and inventory returned to available pool.' };
  }
}
