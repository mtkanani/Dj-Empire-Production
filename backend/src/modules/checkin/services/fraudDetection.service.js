import { CheckInLogRepository } from '../repositories/checkinLog.repository.js';
import { ScanResult } from '@prisma/client';
import { isValidObjectId } from '../../../utils/objectId.util.js';

/**
 * Service for Fraud Detection & Duplicate Scan Prevention Rules Engine
 */
export class FraudDetectionService {
  /**
   * Log suspicious scan attempt for audit compliance
   */
  static async logSuspiciousAttempt(eventId, bookingId, ticketId, gateId, deviceId, staffUserId, scanResult, reason) {
    if (!isValidObjectId(eventId)) return null;

    return CheckInLogRepository.createLog({
      eventId,
      bookingId: isValidObjectId(bookingId) ? bookingId : null,
      ticketId: isValidObjectId(ticketId) ? ticketId : null,
      gateId: isValidObjectId(gateId) ? gateId : null,
      deviceId: isValidObjectId(deviceId) ? deviceId : null,
      scannedByUserId: isValidObjectId(staffUserId) ? staffUserId : null,
      scanResult: scanResult || ScanResult.FRAUD_DETECTED,
      rejectionReason: reason,
      isOffline: false,
    });
  }
}
