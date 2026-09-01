import { getIO } from '../socket.js';
import { REALTIME_EVENTS } from '../realtime.events.js';
import { logger } from '../../../config/logger.js';

/**
 * Real-Time Socket Event Dispatch Service
 */
export class RealtimeService {
  /**
   * Broadcast seat held event (AVAILABLE -> HELD)
   */
  static broadcastSeatHeld(payload) {
    const { eventId, sectionId, seat, inventory } = payload;
    const io = getIO();
    if (!io) return;

    const data = {
      event: REALTIME_EVENTS.SEAT_HELD,
      eventId,
      sectionId,
      seat,
      inventory,
      timestamp: new Date().toISOString(),
    };

    io.to(`event:${eventId}`).to(`section:${sectionId}`).to('admin').emit(REALTIME_EVENTS.SEAT_HELD, data);
    this.broadcastInventoryUpdated({ eventId, sectionId, inventory });
  }

  /**
   * Broadcast seat released event (HELD -> AVAILABLE)
   */
  static broadcastSeatReleased(payload) {
    const { eventId, sectionId, seat, inventory } = payload;
    const io = getIO();
    if (!io) return;

    const data = {
      event: REALTIME_EVENTS.SEAT_RELEASED,
      eventId,
      sectionId,
      seat,
      inventory,
      timestamp: new Date().toISOString(),
    };

    io.to(`event:${eventId}`).to(`section:${sectionId}`).to('admin').emit(REALTIME_EVENTS.SEAT_RELEASED, data);
    this.broadcastInventoryUpdated({ eventId, sectionId, inventory });
  }

  /**
   * Broadcast seat sold event (HELD/AVAILABLE -> SOLD)
   */
  static broadcastSeatSold(payload) {
    const { eventId, sectionId, seat, inventory, bookingId, ticket } = payload;
    const io = getIO();
    if (!io) return;

    const data = {
      event: REALTIME_EVENTS.SEAT_SOLD,
      eventId,
      sectionId,
      seat,
      inventory,
      bookingId,
      ticket,
      timestamp: new Date().toISOString(),
    };

    io.to(`event:${eventId}`).to(`section:${sectionId}`).to('admin').emit(REALTIME_EVENTS.SEAT_SOLD, data);
    this.broadcastInventoryUpdated({ eventId, sectionId, inventory });
  }

  /**
   * Broadcast seat blocked/unblocked event
   */
  static broadcastSeatBlocked(payload) {
    const { eventId, sectionId, seat, isBlocked, inventory } = payload;
    const io = getIO();
    if (!io) return;

    const eventName = isBlocked ? REALTIME_EVENTS.SEAT_BLOCKED : REALTIME_EVENTS.SEAT_UNBLOCKED;
    const data = {
      event: eventName,
      eventId,
      sectionId,
      seat,
      inventory,
      timestamp: new Date().toISOString(),
    };

    io.to(`event:${eventId}`).to(`section:${sectionId}`).to('admin').emit(eventName, data);
    this.broadcastInventoryUpdated({ eventId, sectionId, inventory });
  }

  /**
   * Broadcast live inventory counts update
   */
  static broadcastInventoryUpdated(payload) {
    const { eventId, sectionId, inventory } = payload;
    const io = getIO();
    if (!io) return;

    const data = {
      event: REALTIME_EVENTS.INVENTORY_UPDATED,
      eventId,
      sectionId,
      inventory,
      timestamp: new Date().toISOString(),
    };

    io.to(`event:${eventId}`).to(`section:${sectionId}`).to('admin').emit(REALTIME_EVENTS.INVENTORY_UPDATED, data);
  }

  /**
   * Broadcast overall event availability statistics update
   */
  static broadcastEventAvailability(payload) {
    const { eventId, availability } = payload;
    const io = getIO();
    if (!io) return;

    const data = {
      event: REALTIME_EVENTS.EVENT_AVAILABILITY_UPDATED,
      eventId,
      availability,
      timestamp: new Date().toISOString(),
    };

    io.to(`event:${eventId}`).to('admin').emit(REALTIME_EVENTS.EVENT_AVAILABILITY_UPDATED, data);
  }

  /**
   * Broadcast booking confirmed event to specific user and organizer
   */
  static broadcastBookingConfirmed(booking) {
    const io = getIO();
    if (!io) return;

    const data = {
      event: REALTIME_EVENTS.BOOKING_CONFIRMED,
      bookingNumber: booking.bookingNumber,
      bookingId: booking.id,
      eventId: booking.eventId,
      quantity: booking.quantity,
      totalAmount: booking.totalAmount,
      timestamp: new Date().toISOString(),
    };

    if (booking.customerId) {
      io.to(`user:${booking.customerId}`).emit(REALTIME_EVENTS.BOOKING_CONFIRMED, data);
    }
    if (booking.event?.organizerId) {
      io.to(`organizer:${booking.event.organizerId}`).emit(REALTIME_EVENTS.BOOKING_CONFIRMED, data);
    }
    io.to('admin').emit(REALTIME_EVENTS.BOOKING_CONFIRMED, data);
  }

  /**
   * Broadcast live check-in / attendance update
   */
  static broadcastCheckInUpdated(payload) {
    const io = getIO();
    if (!io) return;

    const data = {
      event: REALTIME_EVENTS.CHECKIN_UPDATED,
      eventId: payload.eventId,
      bookingId: payload.bookingId,
      bookingNumber: payload.bookingNumber,
      customerName: payload.customerName,
      scanResult: payload.scanResult || 'SUCCESS',
      gate: payload.gate,
      timestamp: new Date().toISOString(),
    };

    if (payload.eventId) {
      io.to(`event:${payload.eventId}`).emit(REALTIME_EVENTS.CHECKIN_UPDATED, data);
    }
    if (payload.organizerId) {
      io.to(`organizer:${payload.organizerId}`).emit(REALTIME_EVENTS.CHECKIN_UPDATED, data);
    }
    io.to('admin').emit(REALTIME_EVENTS.CHECKIN_UPDATED, data);
  }
}
