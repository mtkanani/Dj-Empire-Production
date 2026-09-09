import { randomBytes } from 'crypto';

/**
 * Customer-facing booking reference: DJE-YYYYMMDD-XXXXXX
 * Collision retries live in BookingRepository, not here.
 */
export function generateBookingNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = randomBytes(4).toString('hex').slice(0, 6).toUpperCase();
  return `DJE-${dateStr}-${randomStr}`;
}

export function generateReservationNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = randomBytes(4).toString('hex').slice(0, 6).toUpperCase();
  return `RSV-${dateStr}-${randomStr}`;
}
