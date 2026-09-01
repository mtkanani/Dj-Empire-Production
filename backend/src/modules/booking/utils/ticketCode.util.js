import { randomBytes } from 'crypto';

export function generateTicketCode() {
  return `TCK-${randomBytes(4).toString('hex').toUpperCase()}`;
}

export function mapTicketPublicStatus(status) {
  switch (status) {
    case 'CHECKED_IN':
      return 'USED';
    case 'CANCELLED':
      return 'CANCELLED';
    case 'EXPIRED':
      return 'EXPIRED';
    case 'ISSUED':
    default:
      return 'CONFIRMED';
  }
}
