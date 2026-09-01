import { ScanResult, TicketStatus, BookingStatus, PaymentStatus } from '@prisma/client';
import { CheckInQrService } from './qr.service.js';
import { FraudDetectionService } from './fraudDetection.service.js';
import { CheckInLogRepository } from '../repositories/checkinLog.repository.js';
import { BookingRepository } from '../../booking/repositories/booking.repository.js';
import { TicketRepository } from '../../../repositories/ticket.repository.js';
import { GateRepository } from '../repositories/gate.repository.js';
import { ScannerAccountRepository } from '../repositories/scannerAccount.repository.js';
import { prisma } from '../../../config/prisma.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import { isValidObjectId } from '../../../utils/objectId.util.js';
import { RealtimeService } from '../../realtime/services/realtime.service.js';

const PAID_STATUSES = new Set([PaymentStatus.Paid, PaymentStatus.Captured]);
const ADMITTABLE_BOOKING = new Set([BookingStatus.Confirmed, BookingStatus.CheckedIn]);
const BLOCKED_BOOKING = new Set([
  BookingStatus.Cancelled,
  BookingStatus.Expired,
  BookingStatus.Refunded,
]);

const looksLikeTicketCode = (value) => /^TCK[-_]?/i.test(String(value || '').trim());

const normalizeRef = (value) => String(value || '').trim().replace(/^#/, '');

/**
 * Domain Service for Scan Validation & Entry Access Control
 */
export class CheckInService {
  static parseScanPayload(rawToken) {
    const trimmed = String(rawToken || '').trim();
    if (!trimmed) return {};

    const hmac = CheckInQrService.verifyQrToken(trimmed);
    if (hmac.valid && hmac.payload) {
      return hmac.payload;
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch {
      // not JSON
    }

    if (looksLikeTicketCode(trimmed)) {
      return { ticketCode: normalizeRef(trimmed) };
    }

    return { bookingNumber: normalizeRef(trimmed) };
  }

  static async resolveBookingAndTicket({ ticketCode, bookingNumber, bookingId, eventId, ticketId }) {
    const code = normalizeRef(ticketCode);
    const bookingRef = normalizeRef(bookingId || bookingNumber);
    let ticket = null;
    let booking = null;

    if (ticketId && isValidObjectId(ticketId)) {
      ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { ticketType: { include: { section: true } } },
      });
      if (ticket?.bookingId) {
        booking = await BookingRepository.findById(ticket.bookingId);
      }
    }

    if (!ticket && (code || looksLikeTicketCode(bookingRef))) {
      ticket = await TicketRepository.findByTicketCode(code || bookingRef);
      if (ticket?.bookingId) {
        booking = await BookingRepository.findById(ticket.bookingId);
      }
    }

    if (!booking && bookingRef && !looksLikeTicketCode(bookingRef)) {
      booking = await BookingRepository.findById(bookingRef);
    }

    if (!booking) {
      throw new AppError('Entry Denied. Ticket or booking not found', HTTP_STATUS.NOT_FOUND);
    }

    if (eventId && booking.eventId !== eventId) {
      throw new AppError(
        'Entry Denied. This ticket does not belong to the selected event',
        HTTP_STATUS.FORBIDDEN
      );
    }

    if (ticket && ticket.bookingId !== booking.id) {
      throw new AppError('Entry Denied. Ticket does not match this booking', HTTP_STATUS.BAD_REQUEST);
    }

    return { booking, ticket };
  }

  static async deny(staffUser, dto, booking, ticket, scanResult, reason, status = HTTP_STATUS.BAD_REQUEST) {
    await FraudDetectionService.logSuspiciousAttempt(
      (isValidObjectId(dto.eventId) && dto.eventId) || booking?.eventId || null,
      booking?.id || null,
      ticket?.id || null,
      dto.gateId,
      dto.deviceId,
      staffUser?.userId,
      scanResult,
      reason
    );
    throw new AppError(reason, status);
  }

  /**
   * Validate QR Code Payload without marking attendance
   */
  static async validateQr(dto) {
    const payload = this.parseScanPayload(dto.qrToken);
    if (!payload.ticketCode && !payload.bookingNumber && !payload.bookingId && !payload.ticketId) {
      return { valid: false, reason: 'Invalid digital signature or ticket payload' };
    }

    try {
      const { booking, ticket } = await this.resolveBookingAndTicket({
        ticketCode: payload.ticketCode,
        bookingNumber: payload.bookingNumber,
        bookingId: payload.bookingId,
        ticketId: payload.ticketId,
        eventId: dto.eventId || payload.eventId,
      });

      const firstTicket = ticket || booking.tickets[0];
      const totalQuantity =
        booking.quantity ||
        booking.tickets?.length ||
        booking.items?.reduce((sum, item) => sum + item.quantity, 0) ||
        1;

      return {
        valid: true,
        bookingNumber: booking.bookingNumber,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        ticketStatus: firstTicket ? firstTicket.status : 'Unused',
        ticketCode: firstTicket?.ticketCode || payload.ticketCode || null,
        customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
        customerEmail: booking.customer.email,
        section: {
          id: booking.items[0]?.section?.id || booking.sectionId || null,
          name: booking.items[0]?.section?.name || 'General',
          color: booking.items[0]?.section?.color || '#3B82F6',
          ticketCount: totalQuantity,
          ticketType: booking.items[0]?.ticketType?.name || firstTicket?.ticketType?.name || 'Standard',
        },
        eventTitle: booking.event.title,
        eventId: booking.eventId,
      };
    } catch (err) {
      return { valid: false, reason: err.message || 'Ticket could not be validated' };
    }
  }

  /**
   * Scan QR Code & Execute Validation Pipeline
   */
  static async scanEntry(staffUser, dto) {
    const payload = this.parseScanPayload(dto.qrToken);
    const eventId = dto.eventId || staffUser?.eventId || payload.eventId;

    if (!payload.ticketCode && !payload.bookingNumber && !payload.bookingId && !payload.ticketId) {
      await this.deny(
        staffUser,
        { ...dto, eventId },
        null,
        null,
        ScanResult.INVALID_SIGNATURE,
        'Entry Denied. Invalid or tampered QR code'
      );
    }

    let booking;
    let ticket;
    try {
      ({ booking, ticket } = await this.resolveBookingAndTicket({
        ticketCode: payload.ticketCode,
        bookingNumber: payload.bookingNumber,
        bookingId: payload.bookingId,
        ticketId: payload.ticketId,
        eventId,
      }));
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Entry Denied. Booking not found', HTTP_STATUS.NOT_FOUND);
    }

    return this.admitTickets(staffUser, dto, booking, ticket, eventId);
  }

  /**
   * Manual Check-In by Booking Number / Ticket Passcode / Email
   */
  static async manualCheckIn(staffUser, dto) {
    const eventId = dto.eventId || staffUser?.eventId;
    const ticketCode = normalizeRef(dto.ticketCode);
    const bookingNumber = normalizeRef(dto.bookingNumber);
    const passcode = ticketCode || bookingNumber;

    let booking = null;
    let ticket = null;

    const tryTicketFirst = Boolean(ticketCode) || looksLikeTicketCode(passcode);

    if (tryTicketFirst) {
      try {
        ({ booking, ticket } = await this.resolveBookingAndTicket({
          ticketCode: looksLikeTicketCode(passcode) ? passcode : ticketCode,
          eventId,
        }));
      } catch {
        booking = null;
        ticket = null;
      }
    }

    if (!booking && bookingNumber && !looksLikeTicketCode(bookingNumber)) {
      ({ booking, ticket } = await this.resolveBookingAndTicket({
        bookingNumber,
        eventId,
      }));
    } else if (!booking && dto.customerEmail) {
      const found = await BookingRepository.searchAndFilter({ eventId, limit: 100 });
      const match = (found.data || []).find(
        (b) => b.customer?.email?.toLowerCase() === dto.customerEmail.toLowerCase()
      );
      if (match) booking = await BookingRepository.findById(match.id);
    } else if (!booking && dto.customerPhone) {
      const found = await BookingRepository.searchAndFilter({ eventId, limit: 100 });
      const phone = String(dto.customerPhone).replace(/\s+/g, '');
      const match = (found.data || []).find(
        (b) => String(b.customer?.phone || '').replace(/\s+/g, '').endsWith(phone)
      );
      if (match) booking = await BookingRepository.findById(match.id);
    }

    if (!booking) {
      throw new AppError('No matching ticket or booking found for check-in', HTTP_STATUS.NOT_FOUND);
    }

    return this.admitTickets(
      staffUser,
      { ...dto, admitCount: ticket ? 1 : dto.admitCount || 1 },
      booking,
      ticket,
      eventId
    );
  }

  static async admitTickets(staffUser, dto, booking, specificTicket, eventId) {
    const scanDto = { ...dto, eventId: eventId || booking.eventId };

    let gateName = 'Main Entrance';
    let gate = null;
    if (dto.gateId) {
      gate = await GateRepository.findById(dto.gateId);
      if (!gate) {
        await this.deny(
          staffUser,
          scanDto,
          booking,
          specificTicket,
          ScanResult.WRONG_GATE,
          'Entry Denied. Selected gate was not found',
          HTTP_STATUS.BAD_REQUEST
        );
      }
      gateName = gate.name;

      if (gate.eventId !== booking.eventId) {
        await this.deny(
          staffUser,
          scanDto,
          booking,
          specificTicket,
          ScanResult.WRONG_GATE,
          'Entry Denied. This gate does not belong to the ticket event',
          HTTP_STATUS.FORBIDDEN
        );
      }
    }

    const bookingSectionId =
      specificTicket?.ticketType?.sectionId ||
      specificTicket?.ticketType?.section?.id ||
      booking.items[0]?.sectionId ||
      booking.sectionId;

    if (gate?.allowedSections?.length > 0) {
      if (bookingSectionId && !gate.allowedSections.includes(bookingSectionId)) {
        await this.deny(
          staffUser,
          scanDto,
          booking,
          specificTicket,
          ScanResult.WRONG_SECTION,
          'Entry Denied: Section Mismatch. This ticket is not authorized for this gate',
          HTTP_STATUS.FORBIDDEN
        );
      }
    }

    if (staffUser?.assignedSectionIds?.length > 0) {
      if (bookingSectionId && !staffUser.assignedSectionIds.includes(bookingSectionId)) {
        await this.deny(
          staffUser,
          scanDto,
          booking,
          specificTicket,
          ScanResult.WRONG_SECTION,
          'Entry Denied: Section Mismatch. Ticket section is not authorized for this scanner station',
          HTTP_STATUS.FORBIDDEN
        );
      }
    }

    if (staffUser?.assignedGateIds?.length > 0 && dto.gateId) {
      if (!staffUser.assignedGateIds.includes(dto.gateId)) {
        await this.deny(
          staffUser,
          scanDto,
          booking,
          specificTicket,
          ScanResult.WRONG_GATE,
          'Entry Denied. This scanner is not assigned to the selected gate',
          HTTP_STATUS.FORBIDDEN
        );
      }
    }

    if (BLOCKED_BOOKING.has(booking.bookingStatus) || booking.paymentStatus === PaymentStatus.Cancelled || booking.paymentStatus === PaymentStatus.Refunded) {
      await this.deny(
        staffUser,
        scanDto,
        booking,
        specificTicket,
        ScanResult.CANCELLED_BOOKING,
        'Entry Denied. Booking is cancelled, expired, or refunded'
      );
    }

    if (!PAID_STATUSES.has(booking.paymentStatus)) {
      await this.deny(
        staffUser,
        scanDto,
        booking,
        specificTicket,
        ScanResult.CANCELLED_BOOKING,
        'Entry Denied. Payment is not complete for this ticket'
      );
    }

    if (!ADMITTABLE_BOOKING.has(booking.bookingStatus)) {
      await this.deny(
        staffUser,
        scanDto,
        booking,
        specificTicket,
        ScanResult.CANCELLED_BOOKING,
        'Entry Denied. Booking is not confirmed'
      );
    }

    const totalQuantity =
      booking.quantity ||
      booking.tickets?.length ||
      booking.items?.reduce((sum, item) => sum + item.quantity, 0) ||
      1;
    const previouslyCheckedIn = booking.checkedInTicketsCount || 0;
    const remainingUnused = Math.max(0, totalQuantity - previouslyCheckedIn);

    const unusedTickets = (booking.tickets || []).filter(
      (t) => t.status !== TicketStatus.CHECKED_IN && t.status !== TicketStatus.CANCELLED
    );

    let ticketsToAdmit = [];
    if (specificTicket) {
      const live = unusedTickets.find((t) => t.id === specificTicket.id || t.ticketCode === specificTicket.ticketCode);
      if (!live) {
        const alreadyIn = (booking.tickets || []).find(
          (t) => t.id === specificTicket.id || t.ticketCode === specificTicket.ticketCode
        );
        if (alreadyIn?.status === TicketStatus.CHECKED_IN) {
          await this.deny(
            staffUser,
            scanDto,
            booking,
            specificTicket,
            ScanResult.DUPLICATE_SCAN,
            `Entry Denied. Pass code ${specificTicket.ticketCode} is already checked in`
          );
        }
        await this.deny(
          staffUser,
          scanDto,
          booking,
          specificTicket,
          ScanResult.CANCELLED_BOOKING,
          'Entry Denied. This ticket cannot be checked in'
        );
      }
      ticketsToAdmit = [live];
    } else {
      if (remainingUnused <= 0 || unusedTickets.length === 0) {
        await this.deny(
          staffUser,
          scanDto,
          booking,
          booking.tickets[0] || null,
          ScanResult.DUPLICATE_SCAN,
          `Entry Denied: All ${totalQuantity} tickets in this booking have already been checked in`
        );
      }
      const toAdmit = Math.min(dto.admitCount || 1, unusedTickets.length, remainingUnused);
      ticketsToAdmit = unusedTickets.slice(0, toAdmit);
    }

    const toAdmit = ticketsToAdmit.length;
    const totalCheckedInNow = previouslyCheckedIn + toAdmit;

    for (const t of ticketsToAdmit) {
      const claimed = await prisma.ticket.updateMany({
        where: { id: t.id, status: TicketStatus.ISSUED },
        data: { status: TicketStatus.CHECKED_IN, checkedInAt: new Date() },
      });
      if (claimed.count === 0) {
        await this.deny(
          staffUser,
          scanDto,
          booking,
          t,
          ScanResult.DUPLICATE_SCAN,
          `Entry Denied. Pass code ${t.ticketCode} is already checked in`
        );
      }
    }

    const isFullyCheckedIn = totalCheckedInNow >= totalQuantity;
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        checkedInTicketsCount: totalCheckedInNow,
        bookingStatus: isFullyCheckedIn ? BookingStatus.CheckedIn : booking.bookingStatus,
      },
    });

    if (staffUser?.scannerAccountId) {
      await ScannerAccountRepository.incrementScanCount(staffUser.scannerAccountId);
    }

    await CheckInLogRepository.createLog({
      ticketId: ticketsToAdmit[0]?.id || null,
      bookingId: booking.id,
      eventId: booking.eventId,
      sectionId: bookingSectionId || null,
      gateId: dto.gateId || null,
      deviceId: dto.deviceId || null,
      scannerAccountId: staffUser?.scannerAccountId || null,
      scannedByUserId: staffUser?.userId || null,
      scanResult: ScanResult.SUCCESS,
      isOffline: dto.isOffline || false,
    });

    RealtimeService.broadcastCheckInUpdated({
      eventId: booking.eventId,
      organizerId: booking.event?.organizerId,
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
      scanResult: ScanResult.SUCCESS,
      gate: gateName,
    });

    return {
      valid: true,
      bookingNumber: booking.bookingNumber,
      ticketCode: ticketsToAdmit[0]?.ticketCode || specificTicket?.ticketCode || null,
      bookingStatus: isFullyCheckedIn ? 'CheckedIn' : booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      ticketStatus: isFullyCheckedIn ? 'CheckedIn' : 'PartialCheckin',
      customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
      customerEmail: booking.customer.email,
      eventId: booking.eventId,
      eventTitle: booking.event?.title,
      section: {
        id: bookingSectionId || null,
        name: booking.items[0]?.section?.name || 'General',
        color: booking.items[0]?.section?.color || '#3B82F6',
        ticketCount: totalQuantity,
        ticketType: booking.items[0]?.ticketType?.name || ticketsToAdmit[0]?.ticketType?.name || 'Standard',
      },
      groupCheckinSummary: {
        totalTicketsPurchased: totalQuantity,
        previouslyCheckedIn,
        newlyCheckedIn: toAdmit,
        totalCheckedInNow,
        remainingUnusedTickets: Math.max(0, totalQuantity - totalCheckedInNow),
        isFullyCheckedIn,
      },
      gate: gateName,
      checkedInAt: new Date(),
    };
  }

  /**
   * Verify a single ticket (by ticketId / ticketCode / signed QR) and mark USED atomically.
   */
  static async verifyTicketAndCheckIn(staffUser, dto = {}) {
    const raw = dto.qrToken || dto.ticketId || dto.ticketCode || '';
    const parsed = this.parseScanPayload(dto.qrToken || dto.ticketId || '');
    const ticketId = dto.ticketId || parsed.ticketId || null;
    const ticketCode = dto.ticketCode || parsed.ticketCode || (looksLikeTicketCode(raw) ? raw : null);

    if (!ticketId && !ticketCode && !dto.qrToken) {
      throw new AppError('ticketId is required', HTTP_STATUS.BAD_REQUEST);
    }

    const resolved = await this.resolveBookingAndTicket({
      ticketId,
      ticketCode,
      bookingId: parsed.bookingId || parsed.bookingNumber,
      eventId: parsed.eventId || dto.eventId,
    });

    const booking = resolved.booking;
    const ticket = resolved.ticket;

    if (!ticket) {
      throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);
    }

    if (!booking) {
      throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);
    }

    if (booking.bookingStatus === BookingStatus.Cancelled) {
      throw new AppError('Ticket belongs to a cancelled booking', HTTP_STATUS.BAD_REQUEST);
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      throw new AppError('Ticket is cancelled', HTTP_STATUS.BAD_REQUEST);
    }

    if (ticket.status === TicketStatus.EXPIRED) {
      throw new AppError('Ticket has expired', HTTP_STATUS.BAD_REQUEST);
    }

    const eventEnd = booking.event?.schedules?.[0]?.endDate;
    if (eventEnd && new Date() > new Date(eventEnd) && ticket.status === TicketStatus.ISSUED) {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: TicketStatus.EXPIRED },
      });
      throw new AppError('Ticket has expired', HTTP_STATUS.BAD_REQUEST);
    }

    if (!PAID_STATUSES.has(booking.paymentStatus) && booking.bookingStatus !== BookingStatus.Confirmed && booking.bookingStatus !== BookingStatus.CheckedIn) {
      throw new AppError('Booking is not confirmed', HTTP_STATUS.BAD_REQUEST);
    }

    const claimed = await prisma.ticket.updateMany({
      where: { id: ticket.id, status: TicketStatus.ISSUED },
      data: { status: TicketStatus.CHECKED_IN, checkedInAt: new Date() },
    });

    if (claimed.count === 0) {
      throw new AppError('Ticket has already been used', HTTP_STATUS.CONFLICT);
    }

    const totalQuantity = booking.quantity || booking.tickets?.length || 1;
    const totalCheckedInNow = (booking.checkedInTicketsCount || 0) + 1;
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        checkedInTicketsCount: totalCheckedInNow,
        bookingStatus: totalCheckedInNow >= totalQuantity ? BookingStatus.CheckedIn : booking.bookingStatus,
      },
    });

    await CheckInLogRepository.createLog({
      ticketId: ticket.id,
      bookingId: booking.id,
      eventId: booking.eventId,
      scannedByUserId: staffUser?.userId || null,
      scannerAccountId: staffUser?.scannerAccountId || null,
      scanResult: ScanResult.SUCCESS,
    });

    return {
      valid: true,
      checkedIn: true,
      ticketId: ticket.id,
      ticketCode: ticket.ticketCode,
      publicStatus: 'USED',
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      eventTitle: booking.event?.title,
      customerName: `${booking.customer?.firstName || ''} ${booking.customer?.lastName || ''}`.trim(),
    };
  }

  /**
   * Revoke Check-In Status
   */
  static async revokeCheckIn(bookingId, staffUser) {
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);

    await prisma.ticket.updateMany({
      where: { bookingId },
      data: { status: TicketStatus.ISSUED, checkedInAt: null },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { bookingStatus: BookingStatus.Confirmed, checkedInTicketsCount: 0 },
    });

    return { message: 'Check-In status revoked. Ticket restored to Unused status.' };
  }
}
