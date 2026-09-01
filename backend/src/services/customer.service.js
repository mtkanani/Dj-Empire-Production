import { UserRepository } from '../repositories/user.repository.js';
import { CustomerRepository } from '../repositories/customer.repository.js';
import { BookingRepository } from '../repositories/booking.repository.js';
import { OrganizerEventRepository } from '../repositories/organizerEvent.repository.js';
import { HashUtil } from '../utils/hash.util.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { formatStoredPhone } from '../utils/phone.util.js';
import { duplicateKeyMessage, isPrismaUniqueError } from '../utils/authIdentifier.util.js';

/**
 * Customer Business Service
 */
export class CustomerService {
  // ==================== PROFILE MANAGEMENT ====================
  static async getProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new AppError('Customer user not found', HTTP_STATUS.NOT_FOUND);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  static async updateProfile(userId, dto) {
    await this.getProfile(userId);

    const data = { ...dto };
    if (dto.email) {
      data.email = dto.email.trim().toLowerCase();
      const emailOwner = await UserRepository.findByEmail(data.email);
      if (emailOwner && emailOwner.id !== userId) {
        throw new AppError('An account with this email already exists.', HTTP_STATUS.CONFLICT);
      }
    }
    if (dto.phone) {
      data.phone = formatStoredPhone(dto.phone);
      const phoneOwner = await UserRepository.findByPhone(data.phone, userId);
      if (phoneOwner) {
        throw new AppError('An account with this mobile number already exists.', HTTP_STATUS.CONFLICT);
      }
    }

    let updatedUser;
    try {
      updatedUser = await UserRepository.updateUser(userId, data);
    } catch (error) {
      if (isPrismaUniqueError(error)) {
        throw new AppError(duplicateKeyMessage(error), HTTP_STATUS.CONFLICT);
      }
      throw error;
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
    };
  }

  static async changePassword(userId, oldPassword, newPassword) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

    const isMatch = await HashUtil.comparePassword(oldPassword, user.password);
    if (!isMatch) throw new AppError('Current password is incorrect', HTTP_STATUS.BAD_REQUEST);

    const newHashedPassword = await HashUtil.hashPassword(newPassword);
    await UserRepository.updatePassword(userId, newHashedPassword);

    return { message: 'Password changed successfully.' };
  }

  static async deleteAccount(userId) {
    await UserRepository.softDelete(userId);
    return { message: 'Your account has been deleted successfully.' };
  }

  // ==================== EVENT BROWSING & SEARCH ====================
  static async browseEvents(query) {
    return CustomerRepository.searchEvents(query);
  }

  static async getEventDetails(eventId) {
    const event = await CustomerRepository.findPublicEventById(eventId);
    if (!event) throw new AppError('Event not found or not published', HTTP_STATUS.NOT_FOUND);
    return event;
  }

  // ==================== BOOKINGS ====================
  static async createBooking(customerId, dto) {
    const event = await OrganizerEventRepository.findEventById(dto.eventId);
    if (!event || event.status !== 'PUBLISHED') {
      throw new AppError('Event is not available for booking', HTTP_STATUS.BAD_REQUEST);
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of dto.tickets) {
      const ticketType = await OrganizerEventRepository.findTicketTypeById(item.ticketTypeId);
      if (!ticketType || ticketType.eventId !== dto.eventId || !ticketType.isActive) {
        throw new AppError(`Selected ticket type (${item.ticketTypeId}) is invalid or inactive`, HTTP_STATUS.BAD_REQUEST);
      }

      if (ticketType.quantityAvailable < item.quantity) {
        throw new AppError(
          `Not enough tickets available for ${ticketType.name}. Requested: ${item.quantity}, Available: ${ticketType.quantityAvailable}`,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const itemCost = ticketType.price * item.quantity;
      totalAmount += itemCost;

      validatedItems.push({
        ticketTypeId: ticketType.id,
        quantity: item.quantity,
        price: ticketType.price,
      });
    }

    // Process Booking and Issue Tickets
    const booking = await BookingRepository.createBooking(customerId, dto.eventId, totalAmount, validatedItems);

    // Notify customer
    await CustomerRepository.createNotification(
      customerId,
      'Booking Confirmed! 🎉',
      `Your booking for "${event.title}" has been confirmed. Total amount: ₹${totalAmount}.`
    );

    return booking;
  }

  static async getBookingHistory(customerId) {
    return BookingRepository.findBookingsByCustomer(customerId);
  }

  static async getBookingDetails(bookingId, customerId) {
    const booking = await BookingRepository.findBookingById(bookingId, customerId);
    if (!booking) throw new AppError('Booking details not found', HTTP_STATUS.NOT_FOUND);
    return booking;
  }

  static async cancelBooking(bookingId, customerId) {
    const booking = await BookingRepository.findBookingById(bookingId, customerId);
    if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);

    if (booking.status === 'CANCELLED') {
      throw new AppError('Booking is already cancelled', HTTP_STATUS.BAD_REQUEST);
    }

    await BookingRepository.cancelBooking(bookingId, customerId);

    await CustomerRepository.createNotification(
      customerId,
      'Booking Cancelled',
      `Your booking for "${booking.event.title}" has been cancelled.`
    );

    return { message: 'Booking cancelled successfully.' };
  }

  // ==================== TICKETS & QR PAYLOAD ====================
  static async downloadTicket(ticketId, customerId) {
    const ticket = await BookingRepository.findTicketById(ticketId, customerId);
    if (!ticket) throw new AppError('Ticket not found or access denied', HTTP_STATUS.NOT_FOUND);

    return {
      ticketId: ticket.id,
      ticketCode: ticket.ticketCode,
      status: ticket.status,
      ticketType: ticket.ticketType.name,
      price: ticket.ticketType.price,
      eventTitle: ticket.booking.event.title,
      startDate: ticket.booking.event.startDate,
      venueName: ticket.booking.event.venue?.name || 'TBA',
      venueAddress: ticket.booking.event.venue?.address || 'TBA',
      customerName: `${ticket.booking.customer.firstName} ${ticket.booking.customer.lastName}`,
    };
  }

  static async getQrTicketPayload(ticketId, customerId) {
    const ticket = await BookingRepository.findTicketById(ticketId, customerId);
    if (!ticket) throw new AppError('Ticket not found or access denied', HTTP_STATUS.NOT_FOUND);

    return {
      ticketCode: ticket.ticketCode,
      status: ticket.status,
      qrDataPayload: ticket.qrToken || JSON.stringify({
        ticketId: ticket.id,
        bookingId: ticket.bookingId || ticket.booking?.id,
        ticketCode: ticket.ticketCode,
      }),
    };
  }

  // ==================== WISHLIST ====================
  static async addToWishlist(userId, eventId) {
    const event = await OrganizerEventRepository.findEventById(eventId);
    if (!event) throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);

    const isInWishlist = await CustomerRepository.isEventInWishlist(userId, eventId);
    if (isInWishlist) throw new AppError('Event is already in your wishlist', HTTP_STATUS.CONFLICT);

    return CustomerRepository.addToWishlist(userId, eventId);
  }

  static async removeFromWishlist(userId, eventId) {
    await CustomerRepository.removeFromWishlist(userId, eventId);
    return { message: 'Event removed from wishlist.' };
  }

  static async getWishlist(userId) {
    return CustomerRepository.findWishlistByUser(userId);
  }

  // ==================== REVIEWS & RATINGS ====================
  static async createReview(userId, eventId, dto) {
    const event = await OrganizerEventRepository.findEventById(eventId);
    if (!event) throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);

    return CustomerRepository.createReview({
      userId,
      eventId,
      rating: dto.rating,
      comment: dto.comment || null,
    });
  }

  static async updateReview(userId, reviewId, dto) {
    const review = await CustomerRepository.findReviewById(reviewId);
    if (!review || review.userId !== userId) {
      throw new AppError('Review not found or access denied', HTTP_STATUS.NOT_FOUND);
    }

    return CustomerRepository.updateReview(reviewId, dto);
  }

  static async deleteReview(userId, reviewId) {
    const review = await CustomerRepository.findReviewById(reviewId);
    if (!review || review.userId !== userId) {
      throw new AppError('Review not found or access denied', HTTP_STATUS.NOT_FOUND);
    }

    await CustomerRepository.deleteReview(reviewId);
    return { message: 'Review deleted successfully.' };
  }

  // ==================== NOTIFICATIONS ====================
  static async getNotifications(userId) {
    return CustomerRepository.findNotificationsByUser(userId);
  }

  static async markNotificationAsRead(userId, notificationId) {
    await CustomerRepository.markNotificationAsRead(notificationId, userId);
    return { message: 'Notification marked as read.' };
  }
}
