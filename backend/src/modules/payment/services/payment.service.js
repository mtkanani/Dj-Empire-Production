import { PaymentStatus } from '@prisma/client';
import { PaymentRepository } from '../repositories/payment.repository.js';
import { PaymentProviderFactory } from '../providers/paymentProvider.factory.js';
import { BookingService } from '../../booking/services/booking.service.js';
import { BookingRepository } from '../../booking/repositories/booking.repository.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Domain Service for Payment Processing using Strategy Pattern Providers
 */
export class PaymentService {
  /**
   * Create Gateway Payment Order
   */
  static async createPaymentOrder(userId, dto) {
    const booking = await BookingRepository.findById(dto.bookingId);
    if (!booking) throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND);

    if (booking.customerId !== userId) {
      throw new AppError('Access denied. Booking does not belong to your account', HTTP_STATUS.FORBIDDEN);
    }

    if (booking.bookingStatus === 'Confirmed' || booking.paymentStatus === 'Paid') {
      throw new AppError('Booking has already been paid and confirmed', HTTP_STATUS.BAD_REQUEST);
    }

    const currency = dto.currency || booking.currency || 'INR';

    // Get Payment Gateway Provider instance via Strategy Factory
    const provider = PaymentProviderFactory.getProvider(dto.gateway, currency);

    // Create Order with Gateway
    const gatewayOrder = await provider.createOrder({
      bookingId: booking.id,
      amount: booking.totalAmount,
      currency,
      customerEmail: booking.customer.email,
    });

    // Record Payment Order in database
    const payment = await PaymentRepository.createPayment({
      bookingId: booking.id,
      eventId: booking.eventId,
      userId,
      gateway: gatewayOrder.gateway,
      gatewayOrderId: gatewayOrder.gatewayOrderId,
      currency,
      subtotal: booking.subtotal,
      discount: booking.discount + booking.couponDiscount,
      taxAmount: booking.gstAmount,
      platformFee: booking.platformFee,
      bookingFee: booking.bookingFee,
      serviceCharge: booking.serviceCharge,
      totalAmount: booking.totalAmount,
    });

    return {
      paymentId: payment.id,
      paymentNumber: payment.paymentNumber,
      gateway: payment.gateway,
      gatewayOrderId: payment.gatewayOrderId,
      totalAmount: payment.totalAmount,
      currency: payment.currency,
      approvalUrl: gatewayOrder.approvalUrl || null,
      clientSecret: gatewayOrder.clientSecret || null,
    };
  }

  /**
   * Verify Payment Signature / Callback Response
   */
  static async verifyPayment(dto) {
    const payment = await PaymentRepository.findById(dto.paymentId);
    if (!payment) throw new AppError('Payment record not found', HTTP_STATUS.NOT_FOUND);

    if (payment.paymentStatus === PaymentStatus.Paid) {
      return { message: 'Payment already verified & paid.', payment };
    }

    const provider = PaymentProviderFactory.getProvider(payment.gateway, payment.currency);

    // Verify signature with Gateway Strategy
    const result = await provider.verifyPayment({
      gatewayOrderId: dto.gatewayOrderId || payment.gatewayOrderId,
      gatewayPaymentId: dto.gatewayPaymentId,
      signature: dto.signature,
    });

    if (!result.verified) {
      await PaymentRepository.updateStatus(payment.id, PaymentStatus.Failed);
      throw new AppError('Payment signature verification failed. HMAC mismatch', HTTP_STATUS.BAD_REQUEST);
    }

    // Mark Payment as Paid
    const updatedPayment = await PaymentRepository.updateStatus(payment.id, PaymentStatus.Paid, {
      gatewayPaymentId: result.gatewayPaymentId,
      gatewayTransactionId: result.gatewayTransactionId,
      paidAmount: payment.totalAmount,
    });

    // Confirm Booking & Issue Tickets
    await BookingService.confirmBooking(payment.bookingId, result.gatewayPaymentId);

    // Auto-generate Tax Invoice
    await PaymentRepository.createInvoice({
      bookingId: payment.bookingId,
      paymentId: payment.id,
      userId: payment.userId,
      subtotal: payment.subtotal,
      gstAmount: payment.taxAmount,
      totalAmount: payment.totalAmount,
    });

    return {
      success: true,
      message: 'Payment verified successfully! Booking confirmed and tickets issued.',
      payment: updatedPayment,
    };
  }

  static async getPaymentDetails(paymentId) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) throw new AppError('Payment record not found', HTTP_STATUS.NOT_FOUND);
    return payment;
  }

  static async getOrganizerPayments(organizerId, query = {}) {
    return PaymentRepository.findByOrganizer(organizerId, query);
  }
}
