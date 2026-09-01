import { v4 as uuidv4 } from 'uuid';

/**
 * Generates unique booking number format: BMS-YYYYMMDD-XXXXXX
 */
export function generateBookingNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = uuidv4().substring(0, 6).toUpperCase();
  return `BMS-${dateStr}-${randomStr}`;
}

/**
 * Generates unique reservation lock number format: RSV-YYYYMMDD-XXXXXX
 */
export function generateReservationNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = uuidv4().substring(0, 6).toUpperCase();
  return `RSV-${dateStr}-${randomStr}`;
}
