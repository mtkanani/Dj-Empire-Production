/**
 * Real-Time Socket Event Name Constants
 */
export const REALTIME_EVENTS = {
  // Seat Events
  SEAT_HELD: 'seat:held',
  SEAT_RELEASED: 'seat:released',
  SEAT_SOLD: 'seat:sold',
  SEAT_BLOCKED: 'seat:blocked',
  SEAT_UNBLOCKED: 'seat:unblocked',

  // Inventory & Availability Events
  INVENTORY_UPDATED: 'inventory:updated',
  EVENT_AVAILABILITY_UPDATED: 'event:availability_updated',

  // Booking & Ticket Lifecycle Events
  BOOKING_CONFIRMED: 'booking:confirmed',
  BOOKING_CANCELLED: 'booking:cancelled',
  TICKET_UPDATED: 'ticket:updated',

  // Check-In & Attendance Events
  CHECKIN_UPDATED: 'checkin:updated',

  // System Events
  CONNECTED: 'system:connected',
  DISCONNECTED: 'system:disconnected',
  ROOM_JOINED: 'room:joined',
  ROOM_LEFT: 'room:left',
};
