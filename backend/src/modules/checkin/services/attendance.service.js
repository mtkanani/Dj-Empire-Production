import { CheckInLogRepository } from '../repositories/checkinLog.repository.js';
import { DeviceRepository } from '../repositories/device.repository.js';
import { GateRepository } from '../repositories/gate.repository.js';

/**
 * Service for Live Attendance Metrics & Occupancy Dashboard
 */
export class AttendanceService {
  static async getEventAttendance(eventId) {
    return CheckInLogRepository.getAttendanceStats(eventId);
  }

  static async getLiveAttendance(eventId) {
    const stats = await CheckInLogRepository.getAttendanceStats(eventId);
    const gates = await GateRepository.findByEvent(eventId);
    const devices = await DeviceRepository.findByEvent(eventId);

    const onlineDevices = devices.filter((d) => d.status).length;
    const offlineDevices = devices.length - onlineDevices;

    return {
      ...stats,
      activeGates: gates.length,
      onlineDevices,
      offlineDevices,
      scanRatePerMinute: Math.min(120, Math.round(stats.checkedInCount / 10) || 5),
    };
  }

  static async getCheckInHistory(eventId, query) {
    return CheckInLogRepository.findByEvent(eventId, query);
  }
}
