import { prisma } from '../../../config/prisma.js';

/**
 * Check-In Scan Log & Attendance Audit Repository
 */
export class CheckInLogRepository {
  static async createLog(data) {
    return prisma.checkInLog.create({
      data: {
        ticketId: data.ticketId || null,
        bookingId: data.bookingId || null,
        eventId: data.eventId,
        sectionId: data.sectionId || null,
        gateId: data.gateId || null,
        deviceId: data.deviceId || null,
        scannerAccountId: data.scannerAccountId || null,
        scannedByUserId: data.scannedByUserId || null,
        scanResult: data.scanResult || 'SUCCESS',
        rejectionReason: data.rejectionReason || null,
        isOffline: data.isOffline || false,
        scannedAt: data.scannedAt ? new Date(data.scannedAt) : new Date(),
      },
    });
  }

  static async findByEvent(eventId, params = {}) {
    const { page = 1, limit = 20, scanResult } = params;
    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause = { eventId };
    if (scanResult) whereClause.scanResult = scanResult;

    const [total, data] = await Promise.all([
      prisma.checkInLog.count({ where: whereClause }),
      prisma.checkInLog.findMany({
        where: whereClause,
        include: {
          gate: true,
          device: true,
          scannedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
          booking: { select: { bookingNumber: true, customer: { select: { firstName: true, lastName: true } } } },
        },
        orderBy: { scannedAt: 'desc' },
        skip,
        take: limitNumber,
      }),
    ]);

    return { data, meta: { page: pageNumber, limit: limitNumber, total } };
  }

  /**
   * Aggregate Attendance & Occupancy Statistics
   */
  static async getAttendanceStats(eventId) {
    const [sectionCap, seatCount, ticketTypeTotal, soldTickets, checkedInCount, logsCount] = await Promise.all([
      prisma.eventSection.aggregate({ _sum: { capacity: true }, where: { eventId } }),
      prisma.seatMap.count({ where: { section: { eventId } } }),
      prisma.ticketType.aggregate({ _sum: { quantityTotal: true }, where: { eventId } }),
      prisma.ticket.count({ where: { booking: { eventId } } }),
      prisma.ticket.count({ where: { booking: { eventId }, status: 'CHECKED_IN' } }),
      prisma.checkInLog.count({ where: { eventId, scanResult: 'SUCCESS' } }),
    ]);

    const totalSeats =
      sectionCap._sum.capacity ||
      seatCount ||
      ticketTypeTotal._sum.quantityTotal ||
      soldTickets ||
      0;

    const remaining = Math.max(0, totalSeats - checkedInCount);
    const occupancyPercentage = totalSeats > 0 ? parseFloat(((checkedInCount / totalSeats) * 100).toFixed(2)) : 0;

    return {
      totalSeats,
      totalTickets: totalSeats,
      checkedIn: checkedInCount,
      checkedInCount,
      remaining,
      occupancyPercentage,
      attendanceRate: occupancyPercentage,
      totalScansAttempted: logsCount,
    };
  }
}
