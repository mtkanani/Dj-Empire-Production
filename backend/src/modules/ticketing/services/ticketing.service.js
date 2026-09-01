import { Role } from '@prisma/client';
import { SectionRepository } from '../repositories/section.repository.js';
import { InventoryRepository } from '../repositories/inventory.repository.js';
import {
  TicketTypeRepository,
  DynamicPricingRepository,
  BookingRulesRepository,
  SeatMapRepository,
  WaitlistRepository,
  CouponRepository,
} from '../repositories/ticketingSubResource.repository.js';
import { CapacityValidationService } from './capacityValidation.service.js';
import { EventRepository } from '../../event/repositories/event.repository.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import { buildSeatRecords, isStandingLayout } from '../utils/seatGenerator.util.js';

/**
 * Domain Service for Ticketing & Event Operations
 */
export class TicketingService {
  /**
   * Helper method to verify Event Ownership
   */
  static async verifyEventOwnership(eventId, user) {
    const event = await EventRepository.findById(eventId);
    if (!event) throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);

    if (user.role === Role.SUPER_ADMIN) return event;

    if (user.role === Role.EVENT_ORGANIZER && event.organizerId !== user.userId) {
      throw new AppError('Access denied. You do not have permission to manage ticketing for this event', HTTP_STATUS.FORBIDDEN);
    }

    return event;
  }

  // ==================== EVENT SECTIONS ====================
  static async createSection(eventId, user, dto) {
    await this.verifyEventOwnership(eventId, user);

    // 1. Check duplicate section name within event
    const existing = await SectionRepository.findByName(eventId, dto.name);
    if (existing) {
      throw new AppError(`Section name "${dto.name}" already exists for this event`, HTTP_STATUS.CONFLICT);
    }

    // 2. Validate Venue Capacity Constraint
    await CapacityValidationService.validateEventCapacity(eventId, dto.capacity);

    // 3. Create Section & initialize Inventory tracker
    const section = await SectionRepository.create(eventId, dto);
    await InventoryRepository.upsertSectionInventory(section.id, dto.capacity);

    if (!isStandingLayout(dto.layoutType, dto.name)) {
      const existing = await SeatMapRepository.countBySectionId(section.id);
      if (existing === 0) {
        await SeatMapRepository.createSeats(section.id, buildSeatRecords(dto.capacity));
      }
    }

    return section;
  }

  static async getSections(eventId) {
    return SectionRepository.findByEventId(eventId);
  }

  static async getSectionById(sectionId) {
    const section = await SectionRepository.findById(sectionId);
    if (!section) throw new AppError('Section not found', HTTP_STATUS.NOT_FOUND);
    return section;
  }

  static async updateSection(sectionId, user, dto) {
    const section = await this.getSectionById(sectionId);
    await this.verifyEventOwnership(section.eventId, user);

    if (dto.capacity && dto.capacity !== section.capacity) {
      await CapacityValidationService.validateEventCapacity(section.eventId, dto.capacity, section.id);
    }

    const updatedSection = await SectionRepository.update(sectionId, dto);
    if (dto.capacity) {
      await InventoryRepository.upsertSectionInventory(sectionId, dto.capacity);
    }

    return updatedSection;
  }

  static async deleteSection(sectionId, user) {
    const section = await this.getSectionById(sectionId);
    await this.verifyEventOwnership(section.eventId, user);
    return SectionRepository.delete(sectionId);
  }

  // ==================== TICKET TYPES ====================
  static async createTicketType(eventId, sectionId, user, dto) {
    await this.verifyEventOwnership(eventId, user);

    const resolvedSectionId = sectionId || dto.sectionId || null;
    if (resolvedSectionId) {
      const section = await this.getSectionById(resolvedSectionId);
      if (section.eventId !== eventId) {
        throw new AppError('Section does not belong to this event', HTTP_STATUS.BAD_REQUEST);
      }
      const existingQty = (section.ticketTypes || []).reduce((sum, tt) => sum + (tt.quantityTotal || 0), 0);
      if (existingQty + dto.quantityTotal > section.capacity) {
        throw new AppError(
          `Ticket quantity (${dto.quantityTotal}) exceeds remaining section capacity (${Math.max(0, section.capacity - existingQty)})`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    const { sectionId: _ignored, pricingType: _pricingType, ...ticketDto } = dto;

    return TicketTypeRepository.create({
      eventId,
      sectionId: resolvedSectionId,
      ...ticketDto,
      quantityAvailable: dto.quantityTotal,
    });
  }

  static async getTicketTypes(sectionId) {
    return TicketTypeRepository.findBySectionId(sectionId);
  }

  static async updateTicketType(id, user, dto) {
    const ticketType = await TicketTypeRepository.findById(id);
    if (!ticketType) throw new AppError('Ticket type not found', HTTP_STATUS.NOT_FOUND);

    await this.verifyEventOwnership(ticketType.eventId, user);
    return TicketTypeRepository.update(id, dto);
  }

  static async deleteTicketType(id, user) {
    const ticketType = await TicketTypeRepository.findById(id);
    if (!ticketType) throw new AppError('Ticket type not found', HTTP_STATUS.NOT_FOUND);

    await this.verifyEventOwnership(ticketType.eventId, user);
    return TicketTypeRepository.delete(id);
  }

  // ==================== INVENTORY & LIVE AVAILABILITY ====================
  static async getInventory(eventId) {
    return InventoryRepository.findByEventId(eventId);
  }

  static async updateInventoryStock(id, user, dto) {
    return InventoryRepository.updateInventoryStock(id, dto);
  }

  static async getLiveAvailability(eventId) {
    const sections = await SectionRepository.findByEventId(eventId);

    let totalCapacity = 0;
    let totalSold = 0;
    let totalAvailable = 0;

    const sectionBreakdown = sections.map((sec) => {
      totalCapacity += sec.capacity;
      totalSold += sec.soldCapacity;
      totalAvailable += sec.availableCapacity;

      const occupancyPercentage = sec.capacity > 0 ? (sec.soldCapacity / sec.capacity) * 100 : 0;

      return {
        sectionId: sec.id,
        name: sec.name,
        totalCapacity: sec.capacity,
        soldCapacity: sec.soldCapacity,
        availableCapacity: sec.availableCapacity,
        occupancyPercentage: parseFloat(occupancyPercentage.toFixed(2)),
        isSoldOut: sec.availableCapacity <= 0,
      };
    });

    const overallOccupancy = totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0;

    return {
      eventId,
      totalCapacity,
      totalSold,
      totalAvailable,
      overallOccupancyPercentage: parseFloat(overallOccupancy.toFixed(2)),
      isSoldOut: totalAvailable <= 0,
      sections: sectionBreakdown,
    };
  }

  // ==================== DYNAMIC PRICING ====================
  static async createPricingRule(eventId, user, dto) {
    await this.verifyEventOwnership(eventId, user);
    return DynamicPricingRepository.create(eventId, dto);
  }

  static async getPricingRules(eventId) {
    return DynamicPricingRepository.findByEventId(eventId);
  }

  // ==================== BOOKING RULES ====================
  static async upsertBookingRules(eventId, user, dto) {
    await this.verifyEventOwnership(eventId, user);
    return BookingRulesRepository.upsert(eventId, dto);
  }

  static async getBookingRules(eventId) {
    return BookingRulesRepository.findByEventId(eventId);
  }

  // ==================== WAITLIST ====================
  static async joinWaitlist(eventId, user, customerEmail, ticketTypeId) {
    return WaitlistRepository.addToWaitlist({
      eventId,
      ticketTypeId: ticketTypeId || null,
      userId: user ? user.userId : null,
      customerEmail,
      status: 'WAITING',
    });
  }

  static async getWaitlist(eventId, user) {
    await this.verifyEventOwnership(eventId, user);
    return WaitlistRepository.findByEventId(eventId);
  }

  // ==================== COUPONS ====================
  static async createCoupon(user, dto) {
    if (user.role !== Role.SUPER_ADMIN && user.role !== Role.EVENT_ORGANIZER) {
      throw new AppError('Access denied', HTTP_STATUS.FORBIDDEN);
    }

    const existing = await CouponRepository.findByCode(dto.code);
    if (existing) throw new AppError(`Coupon code "${dto.code}" already exists`, HTTP_STATUS.CONFLICT);

    return CouponRepository.create(dto);
  }

  static async validateCoupon(code, orderAmount) {
    const coupon = await CouponRepository.findByCode(code);
    if (!coupon || !coupon.status) {
      throw new AppError('Invalid or expired coupon code', HTTP_STATUS.NOT_FOUND);
    }

    if (new Date() > new Date(coupon.validUntil)) {
      throw new AppError('Coupon has expired', HTTP_STATUS.BAD_REQUEST);
    }

    if (orderAmount < coupon.minimumAmount) {
      throw new AppError(`Order amount must be at least ₹${coupon.minimumAmount} to apply this coupon`, HTTP_STATUS.BAD_REQUEST);
    }

    let discountAmount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (orderAmount * coupon.value) / 100;
      if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount;
      }
    } else if (coupon.type === 'FLAT_AMOUNT') {
      discountAmount = coupon.value;
    }

    return {
      valid: true,
      code: coupon.code,
      discountAmount: Math.min(discountAmount, orderAmount),
      finalAmount: Math.max(0, orderAmount - discountAmount),
    };
  }

  // ==================== TICKETING ANALYTICS DASHBOARD ====================
  static async getTicketingDashboard(eventId, user) {
    await this.verifyEventOwnership(eventId, user);

    const sections = await SectionRepository.findByEventId(eventId);
    const availability = await this.getLiveAvailability(eventId);

    return {
      eventId,
      occupancy: availability,
      sectionSummary: sections.map((s) => ({
        sectionId: s.id,
        name: s.name,
        capacity: s.capacity,
        soldCapacity: s.soldCapacity,
        revenue: s.soldCapacity * (s.ticketTypes[0]?.price || 0),
      })),
    };
  }
}
