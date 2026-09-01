import crypto from 'crypto';
import { env } from '../../../config/env.js';

/**
 * QR Code Ticket Cryptographic Payload Utility
 */
export function generateTicketQrPayload({ bookingNumber, ticketCode, ticketId, eventId, scheduleId, sectionName, ticketTypeName }) {
  const payloadData = {
    ticketId: ticketId || null,
    bookingId: bookingNumber,
    ticketCode,
    eventId,
    timestamp: Date.now(),
  };

  // Generate SHA-256 HMAC signature for security verification
  const secretKey = env.JWT_ACCESS_SECRET || 'secret-key';
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(JSON.stringify(payloadData));
  const signature = hmac.digest('hex');

  return {
    ...payloadData,
    signature,
    qrPayloadString: JSON.stringify({ ...payloadData, signature }),
  };
}
