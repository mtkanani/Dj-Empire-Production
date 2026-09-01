import { C } from '../constants/theme.js';
import { formatCurrency } from './formatters.js';

export const TICKET_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SOLD_OUT: 'SOLD_OUT',
  EXPIRED: 'EXPIRED',
};

export const getTicketStatus = (ticket) => {
  if (!ticket) return TICKET_STATUSES.INACTIVE;
  if (!ticket.isActive) return TICKET_STATUSES.INACTIVE;
  if (ticket.quantityAvailable <= 0) return TICKET_STATUSES.SOLD_OUT;
  if (ticket.saleEndDate && new Date(ticket.saleEndDate) < new Date()) return TICKET_STATUSES.EXPIRED;
  return TICKET_STATUSES.ACTIVE;
};

export const getTicketStatusBadgeProps = (ticket) => {
  const status = typeof ticket === 'string' ? ticket : getTicketStatus(ticket);

  switch (status) {
    case TICKET_STATUSES.ACTIVE:
      return { label: 'Active', bg: C.greenDim, color: C.green, border: C.green };
    case TICKET_STATUSES.SOLD_OUT:
      return { label: 'Sold Out', bg: C.redDim, color: C.red, border: C.red };
    case TICKET_STATUSES.INACTIVE:
      return { label: 'Inactive', bg: 'rgba(255, 255, 255, 0.05)', color: C.muted, border: C.border };
    case TICKET_STATUSES.EXPIRED:
      return { label: 'Sale Ended', bg: C.amberDim, color: C.amber, border: C.amber };
    default:
      return { label: status || 'Active', bg: C.greenDim, color: C.green, border: C.green };
  }
};

export const formatTicketPrice = (price, currency = 'INR') => {
  if (price === undefined || price === null || price === 0) {
    return 'Free';
  }
  return formatCurrency(price, currency);
};

export const getBookingTickets = (booking) => {
  const tickets = Array.isArray(booking?.tickets) ? [...booking.tickets] : [];
  if (tickets.length > 0) {
    tickets.sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      if (aTime !== bTime) return aTime - bTime;
      return String(a.ticketCode || '').localeCompare(String(b.ticketCode || ''));
    });
    return tickets;
  }

  return [
    {
      id: booking?.id || 'fallback',
      ticketCode: booking?.bookingNumber || booking?.id || null,
      ticketType: booking?.items?.[0]?.ticketType || null,
      status: 'ISSUED',
    },
  ];
};

export const buildTicketQrValue = (booking, ticket, event = null) =>
  ticket?.qrToken ||
  JSON.stringify({
    ticketId: ticket?.id || null,
    bookingId: booking?.id || null,
    ticketCode: ticket?.ticketCode || null,
  });

export const isTicketCheckedIn = (ticket) => {
  const status = String(ticket?.status || '').toUpperCase();
  return status === 'CHECKED_IN' || status === 'CHECKEDIN';
};
