import { prisma } from '../config/prisma.js';
import { TicketStatus } from '@prisma/client';

/**
 * Ticket Repository for Ticket issuance, QR code verification, and Attendance check-in
 */
export class TicketRepository {
  /**
   * Find Ticket by unique Ticket Code (with booking & event details)
   * @param {string} ticketCode
   * @returns {Promise<Object|null>}
   */
  static async findByTicketCode(ticketCode) {
    return prisma.ticket.findUnique({
      where: { ticketCode },
      include: {
        ticketType: { include: { section: true } },
        booking: {
          include: {
            customer: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            event: {
              select: {
                id: true,
                title: true,
                organizerId: true,
                schedules: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Mark Ticket status as CHECKED_IN
   * @param {string} id
   * @returns {Promise<Object>}
   */
  static async markAttendance(id) {
    return prisma.ticket.update({
      where: { id },
      data: {
        status: TicketStatus.CHECKED_IN,
        checkedInAt: new Date(),
      },
      include: {
        ticketType: true,
        booking: {
          include: {
            customer: true,
            event: true,
          },
        },
      },
    });
  }
}
