import { EventStatus, Role } from '@prisma/client';
import { EventRepository } from '../repositories/event.repository.js';
import {
  ScheduleRepository,
  EventVenueRepository,
  ImageRepository,
  FAQRepository,
  PolicyRepository,
  SEORepository,
} from '../repositories/subResource.repository.js';
import { validateStateTransition } from '../utils/stateMachine.util.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Event Management Domain Service
 */
export class EventService {
  /**
   * Helper method to verify Event Ownership & RBAC Tenancy Guard
   */
  static async verifyEventOwnership(eventId, user, includeDeleted = false) {
    const event = await EventRepository.findById(eventId, includeDeleted);
    if (!event) {
      throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);
    }

    // SUPER_ADMIN has global access
    if (user.role === Role.SUPER_ADMIN) {
      return event;
    }

    // EVENT_ORGANIZER can only manage their own events
    if (user.role === Role.EVENT_ORGANIZER && event.organizerId !== user.userId) {
      throw new AppError('Access denied. You do not have permission to manage this event', HTTP_STATUS.FORBIDDEN);
    }

    return event;
  }

  /**
   * Create New Event (Initial status: Draft)
   */
  static async createEvent(user, dto) {
    const rawSlug = dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = `${rawSlug}-${Math.random().toString(36).substring(2, 7)}`;

    // Check slug collision
    const existing = await EventRepository.findBySlug(slug);
    if (existing) {
      slug = `${rawSlug}-${Date.now()}`;
    }

    return EventRepository.create({
      organizerId: user.userId,
      title: dto.title,
      slug,
      shortDescription: dto.shortDescription || null,
      description: dto.description || null,
      categoryId: dto.categoryId || null,
      cityId: dto.cityId || null,
      venueId: dto.venueId || null,
      eventType: dto.eventType || 'IN_PERSON',
      status: EventStatus.Draft,
      visibility: dto.visibility || 'PUBLIC',
      language: dto.language || 'English',
      currency: dto.currency || 'INR',
      timezone: dto.timezone || 'Asia/Kolkata',
      price: dto.price || 0.0,
      publishAt: dto.publishAt ? new Date(dto.publishAt) : null,
      unpublishAt: dto.unpublishAt ? new Date(dto.unpublishAt) : null,
      ageRestriction: dto.ageRestriction || 'All Ages',
      featured: dto.featured || false,
      featuredUntil: dto.featuredUntil ? new Date(dto.featuredUntil) : null,
      termsAccepted: dto.termsAccepted ?? true,
    });
  }

  /**
   * Search and List Events
   */
  static async getEvents(user, query) {
    const queryParams = { ...query };

    // Customers / Unauthenticated guests only view Published & Public events
    if (!user || user.role === Role.CUSTOMER) {
      queryParams.status = EventStatus.Published;
      queryParams.visibility = 'PUBLIC';
      queryParams.includeDeleted = false;
    } else if (user.role === Role.EVENT_ORGANIZER) {
      // Organizers default to viewing their own events
      queryParams.organizerId = user.userId;
    }

    return EventRepository.searchAndFilter(queryParams);
  }

  /**
   * Get Single Event by ID or Slug
   */
  static async getEventByIdOrSlug(idOrSlug, user) {
    let event;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      event = await EventRepository.findById(idOrSlug);
    } else {
      event = await EventRepository.findBySlug(idOrSlug);
    }

    if (!event || event.isDeleted) {
      throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);
    }

    // Access control check for unpublished/draft events
    if ((!user || user.role === Role.CUSTOMER) && (event.status !== EventStatus.Published || event.visibility !== 'PUBLIC')) {
      throw new AppError('Event not found or not published', HTTP_STATUS.NOT_FOUND);
    }

    if (user && user.role === Role.EVENT_ORGANIZER && event.organizerId !== user.userId) {
      throw new AppError('Access denied', HTTP_STATUS.FORBIDDEN);
    }

    return event;
  }

  /**
   * Update Event
   */
  static async updateEvent(eventId, user, dto) {
    const event = await this.verifyEventOwnership(eventId, user);

    const updateData = { ...dto };
    if (dto.publishAt) updateData.publishAt = new Date(dto.publishAt);
    if (dto.unpublishAt) updateData.unpublishAt = new Date(dto.unpublishAt);
    if (dto.featuredUntil) updateData.featuredUntil = new Date(dto.featuredUntil);

    return EventRepository.update(event.id, updateData);
  }

  /**
   * Soft Delete Event
   */
  static async softDeleteEvent(eventId, user) {
    const event = await this.verifyEventOwnership(eventId, user);
    await EventRepository.softDelete(event.id);
    return { message: 'Event soft deleted successfully.' };
  }

  /**
   * Restore Soft-Deleted Event (Admin only)
   */
  static async restoreEvent(eventId, user) {
    if (user.role !== Role.SUPER_ADMIN) {
      throw new AppError('Only Super Admin can restore soft-deleted events', HTTP_STATUS.FORBIDDEN);
    }

    const event = await EventRepository.findById(eventId, true);
    if (!event) throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);

    await EventRepository.restore(event.id);
    return { message: 'Event restored successfully.' };
  }

  /**
   * Permanent Delete Event (Admin only)
   */
  static async permanentDeleteEvent(eventId, user) {
    if (user.role !== Role.SUPER_ADMIN) {
      throw new AppError('Only Super Admin can permanently purge events', HTTP_STATUS.FORBIDDEN);
    }

    const event = await EventRepository.findById(eventId, true);
    if (!event) throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);

    await EventRepository.permanentDelete(event.id);
    return { message: 'Event permanently purged from database.' };
  }

  // ==================== FINITE STATE MACHINE TRANSITIONS ====================

  /**
   * Submit Event for Admin Approval (Draft/Rejected -> PendingApproval)
   */
  static async submitForApproval(eventId, user) {
    const event = await this.verifyEventOwnership(eventId, user);
    validateStateTransition(event.status, EventStatus.PendingApproval);
    return EventRepository.updateStatus(event.id, EventStatus.PendingApproval);
  }

  /**
   * Approve Event (Admin Only: PendingApproval -> Approved)
   */
  static async approveEvent(eventId, user) {
    if (user.role !== Role.SUPER_ADMIN) {
      throw new AppError('Only Super Admin can approve events', HTTP_STATUS.FORBIDDEN);
    }
    const event = await EventRepository.findById(eventId);
    if (!event) throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);

    validateStateTransition(event.status, EventStatus.Approved);
    return EventRepository.updateStatus(event.id, EventStatus.Approved);
  }

  /**
   * Reject Event (Admin Only: PendingApproval -> Rejected)
   */
  static async rejectEvent(eventId, reason, user) {
    if (user.role !== Role.SUPER_ADMIN) {
      throw new AppError('Only Super Admin can reject events', HTTP_STATUS.FORBIDDEN);
    }
    const event = await EventRepository.findById(eventId);
    if (!event) throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);

    validateStateTransition(event.status, EventStatus.Rejected);
    return EventRepository.updateStatus(event.id, EventStatus.Rejected);
  }

  /**
   * Publish Event (Approved/Unpublished -> Published)
   */
  static async publishEvent(eventId, user) {
    const event = await this.verifyEventOwnership(eventId, user);

    // Organizers must have their event approved first
    if (user.role === Role.EVENT_ORGANIZER && event.status !== EventStatus.Approved && event.status !== EventStatus.Unpublished) {
      throw new AppError('Event must be in Approved or Unpublished status before publishing', HTTP_STATUS.BAD_REQUEST);
    }

    validateStateTransition(event.status, EventStatus.Published);
    return EventRepository.updateStatus(event.id, EventStatus.Published);
  }

  /**
   * Unpublish Event (Published -> Unpublished)
   */
  static async unpublishEvent(eventId, user) {
    const event = await this.verifyEventOwnership(eventId, user);
    validateStateTransition(event.status, EventStatus.Unpublished);
    return EventRepository.updateStatus(event.id, EventStatus.Unpublished);
  }

  /**
   * Cancel Event (Published -> Cancelled)
   */
  static async cancelEvent(eventId, user) {
    const event = await this.verifyEventOwnership(eventId, user);
    validateStateTransition(event.status, EventStatus.Cancelled);
    return EventRepository.updateStatus(event.id, EventStatus.Cancelled);
  }

  /**
   * Archive Event (Any -> Archived)
   */
  static async archiveEvent(eventId, user) {
    const event = await this.verifyEventOwnership(eventId, user);
    validateStateTransition(event.status, EventStatus.Archived);
    return EventRepository.updateStatus(event.id, EventStatus.Archived);
  }

  // ==================== SUB-RESOURCE HANDLERS ====================

  // Schedules
  static async addSchedule(eventId, user, dto) {
    await this.verifyEventOwnership(eventId, user);
    return ScheduleRepository.create(eventId, dto);
  }

  static async getSchedules(eventId) {
    return ScheduleRepository.findByEventId(eventId);
  }

  static async updateSchedule(scheduleId, user, dto) {
    const schedule = await ScheduleRepository.findById(scheduleId);
    if (!schedule) throw new AppError('Schedule not found', HTTP_STATUS.NOT_FOUND);
    await this.verifyEventOwnership(schedule.eventId, user);

    return ScheduleRepository.update(scheduleId, dto);
  }

  static async deleteSchedule(scheduleId, user) {
    const schedule = await ScheduleRepository.findById(scheduleId);
    if (!schedule) throw new AppError('Schedule not found', HTTP_STATUS.NOT_FOUND);
    await this.verifyEventOwnership(schedule.eventId, user);

    return ScheduleRepository.delete(scheduleId);
  }

  // Venue Location Details
  static async upsertVenue(eventId, user, dto) {
    await this.verifyEventOwnership(eventId, user);
    return EventVenueRepository.upsert(eventId, dto);
  }

  static async getVenue(eventId) {
    return EventVenueRepository.findByEventId(eventId);
  }

  static async deleteVenue(eventId, user) {
    await this.verifyEventOwnership(eventId, user);
    return EventVenueRepository.delete(eventId);
  }

  // Images Media
  static async addImage(eventId, user, dto) {
    await this.verifyEventOwnership(eventId, user);
    if (dto.type === 'BANNER' || dto.type === 'THUMBNAIL') {
      const { type, ...rest } = dto;
      return ImageRepository.upsertByType(eventId, type, rest);
    }
    return ImageRepository.create(eventId, dto);
  }

  static async getImages(eventId) {
    return ImageRepository.findByEventId(eventId);
  }

  static async updateImage(imageId, user, dto) {
    const image = await ImageRepository.findById(imageId);
    if (!image) throw new AppError('Image not found', HTTP_STATUS.NOT_FOUND);
    await this.verifyEventOwnership(image.eventId, user);

    return ImageRepository.update(imageId, dto);
  }

  static async deleteImage(imageId, user) {
    const image = await ImageRepository.findById(imageId);
    if (!image) throw new AppError('Image not found', HTTP_STATUS.NOT_FOUND);
    await this.verifyEventOwnership(image.eventId, user);

    return ImageRepository.delete(imageId);
  }

  // FAQs
  static async addFAQ(eventId, user, dto) {
    await this.verifyEventOwnership(eventId, user);
    return FAQRepository.create(eventId, dto);
  }

  static async getFAQs(eventId) {
    return FAQRepository.findByEventId(eventId);
  }

  static async updateFAQ(faqId, user, dto) {
    const faq = await FAQRepository.findById(faqId);
    if (!faq) throw new AppError('FAQ not found', HTTP_STATUS.NOT_FOUND);
    await this.verifyEventOwnership(faq.eventId, user);

    return FAQRepository.update(faqId, dto);
  }

  static async deleteFAQ(faqId, user) {
    const faq = await FAQRepository.findById(faqId);
    if (!faq) throw new AppError('FAQ not found', HTTP_STATUS.NOT_FOUND);
    await this.verifyEventOwnership(faq.eventId, user);

    return FAQRepository.delete(faqId);
  }

  // Policy & SEO
  static async upsertPolicy(eventId, user, dto) {
    await this.verifyEventOwnership(eventId, user);
    return PolicyRepository.upsert(eventId, dto);
  }

  static async getPolicy(eventId) {
    return PolicyRepository.findByEventId(eventId);
  }

  static async upsertSEO(eventId, user, dto) {
    await this.verifyEventOwnership(eventId, user);
    return SEORepository.upsert(eventId, dto);
  }

  static async getSEO(eventId) {
    return SEORepository.findByEventId(eventId);
  }
}
