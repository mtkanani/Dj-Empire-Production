import { CheckInLogRepository } from '../repositories/checkinLog.repository.js';
import { DeviceRepository } from '../repositories/device.repository.js';

/**
 * Service handling Offline Batch Sync & Reconciliation
 */
export class OfflineSyncService {
  static async syncOfflineLogs(deviceId, logs = []) {
    const device = await DeviceRepository.findById(deviceId);
    if (!device) return { syncedCount: 0, message: 'Device not registered' };

    let syncedCount = 0;
    for (const item of logs) {
      await CheckInLogRepository.createLog({
        eventId: device.eventId,
        gateId: device.gateId,
        deviceId: device.id,
        ticketId: item.ticketId || null,
        scanResult: item.scanResult || 'SUCCESS',
        isOffline: true,
        scannedAt: item.scannedAt,
      });
      syncedCount++;
    }

    await DeviceRepository.updateSyncTimestamp(deviceId);
    return { syncedCount, message: `Successfully reconciled ${syncedCount} offline scan logs.` };
  }
}
