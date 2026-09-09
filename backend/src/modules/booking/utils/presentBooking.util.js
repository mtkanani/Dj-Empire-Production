import { getPaymentDisplayStatus } from '../../../constants/paymentStatus.js';

export function maskMobile(mobile) {
  const digits = String(mobile || '').replace(/\D/g, '');
  if (!digits) return '';
  const visible = digits.slice(-3);
  return `${'X'.repeat(Math.max(0, digits.length - 3))}${visible}`;
}

/**
 * Strip identity-document storage keys from API responses.
 * Customers see names/mobiles and a boolean; staff additionally receive document ids.
 */
export function presentBooking(booking, { isStaff = false } = {}) {
  if (!booking) return booking;

  const attendees = (booking.attendees || []).map((attendee) => {
    const presented = {
      id: attendee.id,
      attendeeIndex: attendee.attendeeIndex,
      fullName: attendee.fullName,
      mobileNumber: attendee.mobileNumber,
      hasIdentityDocument: Boolean(attendee.identityDocumentId),
      ticketId: attendee.ticketId || null,
    };
    if (isStaff) {
      presented.identityDocumentId = attendee.identityDocumentId || null;
    }
    return presented;
  });

  return {
    ...booking,
    attendees,
    displayPaymentStatus: getPaymentDisplayStatus(booking.paymentStatus, booking.paymentGateway),
  };
}
