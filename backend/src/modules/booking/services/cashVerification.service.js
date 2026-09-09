import { BookingStatus, PaymentGateway, PaymentStatus, Role } from '@prisma/client';
import { prisma } from '../../../config/prisma.js';
import { BookingRepository } from '../repositories/booking.repository.js';
import { PaymentRepository } from '../../payment/repositories/payment.repository.js';
import { QrCryptoUtil } from '../../checkin/utils/qrCrypto.util.js';
import { BookingService } from './booking.service.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import { CASH_VERIFIER_ROLES, isPaid } from '../../../constants/paymentStatus.js';
import { presentBooking } from '../utils/presentBooking.util.js';
import { logger } from '../../../config/logger.js';

export class CashVerificationService {
  static assertVerifier(user, booking) {
    if (!CASH_VERIFIER_ROLES.includes(user.role)) {
      throw new AppError('Only an administrator or event organizer can verify cash payments', HTTP_STATUS.FORBIDDEN);
    }
    if (user.role === Role.EVENT_ORGANIZER && booking.event?.organizerId !== user.userId) {
      throw new AppError('You can only verify cash payments for your own events', HTTP_STATUS.FORBIDDEN);
    }
  }

  static async lookupByReference(user, bookingNumber) {
    const booking = await BookingRepository.findById(String(bookingNumber || '').trim());
    if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);
    this.assertVerifier(user, booking);
    return presentBooking(booking, { isStaff: true });
  }

  static async lookupByQr(user, qrToken) {
    const verified = QrCryptoUtil.verifyQrToken(qrToken, {
      requiredPurpose: 'CASH_VERIFY',
    });
    if (!verified.valid) {
      throw new AppError(verified.reason || 'Invalid cash verification QR', HTTP_STATUS.BAD_REQUEST);
    }

    const ref = verified.payload.bookingNumber || verified.payload.bookingId;
    if (!ref) {
      throw new AppError('QR token is missing a booking reference', HTTP_STATUS.BAD_REQUEST);
    }

    return this.lookupByReference(user, ref);
  }

  static buildCashQrToken(booking) {
    return QrCryptoUtil.createSignedQrToken({
      purpose: 'CASH_VERIFY',
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
    });
  }

  /**
   * Idempotent staff confirmation that the full cash amount was received.
   */
  static async verifyCashReceived(user, bookingNumber) {
    const booking = await BookingRepository.findById(String(bookingNumber || '').trim());
    if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);
    this.assertVerifier(user, booking);

    if (booking.paymentGateway !== PaymentGateway.CASH) {
      throw new AppError('This booking is not a cash payment', HTTP_STATUS.BAD_REQUEST);
    }

    if (booking.bookingStatus === BookingStatus.Cancelled || booking.bookingStatus === BookingStatus.Expired) {
      throw new AppError('This booking is no longer eligible for cash verification', HTTP_STATUS.BAD_REQUEST);
    }

    if (isPaid(booking.paymentStatus) || booking.bookingStatus === BookingStatus.Confirmed) {
      return {
        alreadyVerified: true,
        message: 'Cash payment has already been verified.',
        booking: presentBooking(booking, { isStaff: true }),
      };
    }

    const expectedAmount = booking.totalAmount;
    const now = new Date();

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        cashVerifiedAt: now,
        cashVerifiedById: user.userId,
        cashVerifierRole: user.role,
        cashAmountReceived: expectedAmount,
      },
    });

    const cashPayment = (booking.payments || []).find((p) => p.gateway === PaymentGateway.CASH);
    if (cashPayment) {
      await PaymentRepository.updateStatus(cashPayment.id, PaymentStatus.CASH_RECEIVED, {
        paidAmount: expectedAmount,
        gatewayPaymentId: `CASH-REC-${booking.bookingNumber}`,
        gatewayTransactionId: `CASH-TXN-${booking.bookingNumber}`,
      });
    }

    const confirmed = await BookingService.confirmBooking(booking.id, `CASH-${booking.bookingNumber}`, {
      paymentStatus: PaymentStatus.CASH_RECEIVED,
      asyncEmail: true,
    });

    await BookingRepository.createAuditLog(
      user.userId,
      'VERIFY_CASH',
      'Booking',
      booking.id,
      { paymentStatus: booking.paymentStatus },
      { paymentStatus: PaymentStatus.CASH_RECEIVED, cashAmountReceived: expectedAmount }
    );

    logger.info(`Cash verified for booking ${booking.bookingNumber} by ${user.userId}`);

    return {
      alreadyVerified: false,
      message: 'Cash payment received. Booking confirmed and tickets issued.',
      booking: presentBooking(confirmed, { isStaff: true }),
    };
  }

  /**
   * Cash bookings no longer auto-expire. They stay pending until an authorised
   * administrator or organizer confirms the cash was received.
   */
  static async expireUnpaidCashBookings() {
    return 0;
  }
}
