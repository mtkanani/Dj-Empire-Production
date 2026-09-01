import { PaymentStatus } from '@prisma/client';
import { PaymentRepository } from '../repositories/payment.repository.js';
import { PaymentProviderFactory } from '../providers/paymentProvider.factory.js';
import { BookingService } from '../../booking/services/booking.service.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

const REFUNDABLE_STATUSES = [PaymentStatus.Paid, PaymentStatus.Captured, PaymentStatus.PartiallyRefunded];

/**
 * Service handling Refund Processing
 */
export class RefundService {
  static async processRefund(user, dto) {
    const payment = await PaymentRepository.findById(dto.paymentId);
    if (!payment) throw new AppError('Payment not found', HTTP_STATUS.NOT_FOUND);

    const organizerId = payment.event?.organizerId || payment.booking?.event?.organizerId;
    if (user.role === 'EVENT_ORGANIZER' && organizerId !== user.userId) {
      throw new AppError('Access denied. This payment does not belong to your events', HTTP_STATUS.FORBIDDEN);
    }

    if (!REFUNDABLE_STATUSES.includes(payment.paymentStatus)) {
      throw new AppError('Only Paid transactions can be refunded', HTTP_STATUS.BAD_REQUEST);
    }

    const paidAmount = payment.paidAmount || payment.totalAmount || 0;
    const alreadyRefunded = payment.refundAmount || 0;
    const remainingRefundable = Math.max(0, paidAmount - alreadyRefunded);

    if (dto.refundAmount > remainingRefundable) {
      throw new AppError(
        `Refund amount (₹${dto.refundAmount}) cannot exceed remaining refundable amount (₹${remainingRefundable})`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const provider = PaymentProviderFactory.getProvider(payment.gateway, payment.currency);

    const gatewayRefund = await provider.processRefund({
      gatewayPaymentId: payment.gatewayPaymentId,
      amount: dto.refundAmount,
      reason: dto.reason,
    });

    const refund = await PaymentRepository.createRefund({
      paymentId: payment.id,
      bookingId: payment.bookingId,
      userId: payment.userId,
      refundAmount: dto.refundAmount,
      reason: dto.reason,
    });

    const nextStatus =
      dto.refundAmount >= remainingRefundable ? PaymentStatus.Refunded : PaymentStatus.PartiallyRefunded;
    await PaymentRepository.applyRefundAmount(payment.id, dto.refundAmount, nextStatus);

    if (nextStatus === PaymentStatus.Refunded) {
      await BookingService.cancelBooking(payment.bookingId, user, dto.reason || 'Organizer Refund');
    }

    return {
      message: 'Refund processed successfully.',
      refund,
      gatewayRefund,
    };
  }

  static async getOrganizerRefunds(organizerId) {
    return PaymentRepository.findRefundsByOrganizer(organizerId);
  }
}
