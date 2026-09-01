import { EventStatus, TicketStatus } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository.js';
import { OrganizerRepository } from '../repositories/organizer.repository.js';
import { OrganizerEventRepository } from '../repositories/organizerEvent.repository.js';
import { TicketRepository } from '../repositories/ticket.repository.js';
import { CategoryRepository } from '../repositories/category.repository.js';
import { CityRepository } from '../repositories/city.repository.js';
import { VenueRepository } from '../repositories/venue.repository.js';
import { SectionRepository } from '../modules/ticketing/repositories/section.repository.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

/**
 * Event Organizer Business Service
 */
export class OrganizerService {
  // ==================== PROFILE MANAGEMENT ====================
  static async getProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new AppError('Organizer user not found', HTTP_STATUS.NOT_FOUND);

    const profile = await OrganizerRepository.findByUserId(userId);
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        status: user.status,
      },
      profile,
    };
  }

  static async updateProfile(userId, dto) {
    const profile = await OrganizerRepository.findByUserId(userId);
    if (!profile) throw new AppError('Organizer profile not found', HTTP_STATUS.NOT_FOUND);

    return OrganizerRepository.createProfile({
      userId,
      ...dto,
    });
  }

  // ==================== EVENT MANAGEMENT (CRUD & PUBLISHING) ====================
  static async createEvent(organizerId, dto) {
    const slug = dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    if (dto.categoryId) {
      const category = await CategoryRepository.findById(dto.categoryId);
      if (!category) throw new AppError('Specified Category not found', HTTP_STATUS.BAD_REQUEST);
    }

    if (dto.cityId) {
      const city = await CityRepository.findById(dto.cityId);
      if (!city) throw new AppError('Specified City not found', HTTP_STATUS.BAD_REQUEST);
    }

    if (dto.venueId) {
      const venue = await VenueRepository.findById(dto.venueId);
      if (!venue) throw new AppError('Specified Venue not found', HTTP_STATUS.BAD_REQUEST);
    }

    const eventData = {
      title: dto.title,
      slug,
      description: dto.description || null,
      organizerId,
      categoryId: dto.categoryId || null,
      cityId: dto.cityId || null,
      venueId: dto.venueId || null,
      price: dto.price || 0.0,
      status: EventStatus.Draft,
    };

    if (dto.startDate) {
      eventData.schedules = {
        create: [
          {
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate || dto.startDate),
            startTime: dto.startTime || '00:00',
            endTime: dto.endTime || '23:59',
          },
        ],
      };
    }

    return OrganizerEventRepository.createEvent(eventData);
  }

  static async getEvents(organizerId, role = null) {
    return OrganizerEventRepository.findEventsByOrganizer(organizerId, role);
  }

  static async getEventById(id, organizerId) {
    const event = await OrganizerEventRepository.findEventById(id, organizerId);
    if (!event) throw new AppError('Event not found or access denied', HTTP_STATUS.NOT_FOUND);
    return event;
  }

  static async updateEvent(id, organizerId, dto) {
    await this.getEventById(id, organizerId);

    const { startDate: _startDate, endDate: _endDate, bannerUrl: _bannerUrl, startTime: _startTime, endTime: _endTime, ...safeDto } = dto;
    const updateData = { ...safeDto };

    return OrganizerEventRepository.updateEvent(id, updateData);
  }

  static async deleteEvent(id, organizerId) {
    await this.getEventById(id, organizerId);
    return OrganizerEventRepository.deleteEvent(id);
  }

  static async publishEvent(id, organizerId) {
    const event = await this.getEventById(id, organizerId);
    if (event.status === EventStatus.Published) {
      throw new AppError('Event is already published', HTTP_STATUS.BAD_REQUEST);
    }

    return OrganizerEventRepository.updateEventStatus(id, EventStatus.Published);
  }

  static async unpublishEvent(id, organizerId) {
    const event = await this.getEventById(id, organizerId);
    if (event.status === EventStatus.Draft) {
      throw new AppError('Event is already in draft status', HTTP_STATUS.BAD_REQUEST);
    }

    return OrganizerEventRepository.updateEventStatus(id, EventStatus.Draft);
  }

  // ==================== TICKET TYPE MANAGEMENT ====================
  static async createTicketType(eventId, organizerId, dto) {
    await this.getEventById(eventId, organizerId);

    const sections = await SectionRepository.findByEventId(eventId);
    if (sections.length > 0 && !dto.sectionId) {
      throw new AppError(
        'Assign this ticket to a section (Gold, VIP, Silver, or any name you created)',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (dto.sectionId) {
      const section = sections.find((sec) => sec.id === dto.sectionId);
      if (!section) {
        throw new AppError('Selected section was not found for this event', HTTP_STATUS.NOT_FOUND);
      }
      const existingQty = (section.ticketTypes || []).reduce((sum, tt) => sum + (tt.quantityTotal || 0), 0);
      if (existingQty + dto.quantityTotal > section.capacity) {
        throw new AppError(
          `Ticket quantity (${dto.quantityTotal}) exceeds remaining capacity for "${section.name}" (${Math.max(0, section.capacity - existingQty)})`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    return OrganizerEventRepository.createTicketType({
      eventId,
      sectionId: dto.sectionId || null,
      name: dto.name,
      description: dto.description || null,
      price: dto.price || 0.0,
      quantityTotal: dto.quantityTotal,
      quantityAvailable: dto.quantityTotal,
    });
  }

  static async getTicketTypes(eventId, organizerId) {
    await this.getEventById(eventId, organizerId);
    return OrganizerEventRepository.findTicketTypesByEvent(eventId);
  }

  static async updateTicketType(ticketTypeId, organizerId, dto) {
    const ticketType = await OrganizerEventRepository.findTicketTypeById(ticketTypeId);
    if (!ticketType || ticketType.event.organizerId !== organizerId) {
      throw new AppError('Ticket Type not found or access denied', HTTP_STATUS.NOT_FOUND);
    }

    const { pricingType: _pricingType, ...safeDto } = dto;
    return OrganizerEventRepository.updateTicketType(ticketTypeId, safeDto);
  }

  static async deleteTicketType(ticketTypeId, organizerId) {
    const ticketType = await OrganizerEventRepository.findTicketTypeById(ticketTypeId);
    if (!ticketType || ticketType.event.organizerId !== organizerId) {
      throw new AppError('Ticket Type not found or access denied', HTTP_STATUS.NOT_FOUND);
    }

    return OrganizerEventRepository.deleteTicketType(ticketTypeId);
  }

  // ==================== BOOKINGS & SALES ====================
  static async getBookings(organizerId, role = null) {
    return OrganizerEventRepository.findBookingsByOrganizer(organizerId, role);
  }

  static async getBookingById(bookingId, organizerId) {
    const booking = await OrganizerEventRepository.findBookingById(bookingId, organizerId);
    if (!booking) throw new AppError('Booking details not found or access denied', HTTP_STATUS.NOT_FOUND);
    return booking;
  }

  // ==================== QR CHECK-IN & ATTENDANCE ====================
  static async verifyTicket(organizerId, ticketCode) {
    const ticket = await TicketRepository.findByTicketCode(ticketCode);
    if (!ticket) {
      throw new AppError('Invalid ticket code. Ticket not found', HTTP_STATUS.NOT_FOUND);
    }

    // Ensure the ticket belongs to an event owned by this organizer
    if (ticket.booking.event.organizerId !== organizerId) {
      throw new AppError('Access denied. Ticket belongs to an event managed by another organizer', HTTP_STATUS.FORBIDDEN);
    }

    if (ticket.status === TicketStatus.CHECKED_IN) {
      return {
        valid: false,
        alreadyCheckedIn: true,
        message: `Ticket already checked in at ${ticket.checkedInAt?.toISOString()}`,
        ticket,
      };
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      return {
        valid: false,
        alreadyCheckedIn: false,
        message: 'Ticket has been cancelled and is invalid',
        ticket,
      };
    }

    return {
      valid: true,
      alreadyCheckedIn: false,
      message: 'Ticket is valid and ready for check-in.',
      ticket,
    };
  }

  static async markAttendance(organizerId, ticketCode) {
    const verification = await this.verifyTicket(organizerId, ticketCode);
    if (!verification.valid) {
      throw new AppError(verification.message, HTTP_STATUS.BAD_REQUEST);
    }

    const updatedTicket = await TicketRepository.markAttendance(verification.ticket.id);

    return {
      success: true,
      message: 'Attendance marked successfully! Customer checked in.',
      ticket: updatedTicket,
    };
  }

  // ==================== ORGANIZER ANALYTICS ====================
  static async getAnalytics(organizerId, role = null) {
    return OrganizerEventRepository.getOrganizerAnalytics(organizerId, role);
  }
}
