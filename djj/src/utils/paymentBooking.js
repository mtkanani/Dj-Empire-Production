export function isCashPendingBooking(booking) {
  if (!booking) return false;
  const gateway = String(booking.paymentGateway || '').toUpperCase();
  const payment = booking.paymentStatus;
  const status = booking.bookingStatus;
  if (gateway !== 'CASH') return false;
  if (['Cancelled', 'Expired', 'Refunded'].includes(status)) return false;
  return payment !== 'CASH_RECEIVED' && payment !== 'Paid';
}

export function isHiddenTicketBooking(booking) {
  return ['Cancelled', 'Expired', 'Refunded'].includes(booking?.bookingStatus);
}

/** My Tickets: pending cash holds, or bookings that still have real Ticket rows. */
export function shouldShowInMyTickets(booking) {
  if (!booking || isHiddenTicketBooking(booking)) return false;
  if (isCashPendingBooking(booking)) return true;
  return Array.isArray(booking.tickets) && booking.tickets.length > 0;
}

export function paymentViaLabel(gateway) {
  switch (String(gateway || '').toUpperCase()) {
    case 'CASH':
      return 'Payment via Cash';
    case 'RAZORPAY':
      return 'Payment via Razorpay';
    case 'PAYPAL':
      return 'Payment via PayPal';
    case 'STRIPE':
      return 'Payment via Stripe';
    default:
      return gateway ? `Payment via ${gateway}` : 'Payment method pending';
  }
}
