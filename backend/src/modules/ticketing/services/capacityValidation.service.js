import { prisma } from '../../../config/prisma.js';
import { SectionRepository } from '../repositories/section.repository.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Capacity Validation Service: Enforces Sum(Section Capacity) <= Venue Capacity
 */
export class CapacityValidationService {
  /**
   * Validate that adding/updating a section capacity will not exceed venue total capacity
   * @param {string} eventId
   * @param {number} newSectionCapacity
   * @param {string|null} excludeSectionId
   */
  static async validateEventCapacity(eventId, newSectionCapacity, excludeSectionId = null) {
    // 1. Fetch Event with Venue details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        venue: true,
        eventVenue: true,
      },
    });

    if (!event) {
      throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);
    }

    // Determine venue capacity limit (from EventVenue or master Venue)
    const maxVenueCapacity = event.eventVenue?.capacity || event.venue?.capacity || 100000;

    // 2. Sum existing section capacities
    const currentTotalCapacity = await SectionRepository.calculateTotalSectionCapacity(eventId, excludeSectionId);

    const projectedTotalCapacity = currentTotalCapacity + newSectionCapacity;

    if (projectedTotalCapacity > maxVenueCapacity) {
      throw new AppError(
        `Capacity validation failed. Total section capacity (${projectedTotalCapacity}) would exceed venue total capacity (${maxVenueCapacity}). Current section total: ${currentTotalCapacity}.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return {
      maxVenueCapacity,
      projectedTotalCapacity,
    };
  }
}
