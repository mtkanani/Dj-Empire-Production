import { PaymentRepository } from '../repositories/payment.repository.js';
import { PaymentProviderFactory } from '../providers/paymentProvider.factory.js';
import { BookingService } from '../../booking/services/booking.service.js';
import { logger } from '../../../config/logger.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Service handling Idempotent Gateway Webhooks
 */
export class WebhookService {
  static async handleWebhook(gatewayName, payload, headers) {
    const provider = PaymentProviderFactory.getProvider(gatewayName);
    const parsed = await provider.parseWebhook(payload, headers);

    // Log webhook execution
    await PaymentRepository.logWebhook(gatewayName, parsed.eventType, payload);

    // Webhook endpoints are public. An unsigned or badly signed payload is not
    // proof of payment and must never confirm a booking.
    if (!parsed.verified) {
      logger.warn(`Rejected unverified ${gatewayName} webhook (event: ${parsed.eventType})`);
      throw new AppError('Webhook signature verification failed', HTTP_STATUS.UNAUTHORIZED);
    }

    if (parsed.gatewayOrderId) {
      const payment = await PaymentRepository.findByGatewayOrderId(parsed.gatewayOrderId);
      if (payment && !['Paid', 'CASH_RECEIVED', 'Captured'].includes(payment.paymentStatus) && parsed.status === 'Paid') {
        await PaymentRepository.updateStatus(payment.id, 'Paid', {
          gatewayPaymentId: parsed.gatewayPaymentId,
        });

        // Confirm Booking & Issue Tickets
        await BookingService.confirmBooking(payment.bookingId, parsed.gatewayPaymentId);
      }
    }

    return { received: true, eventType: parsed.eventType };
  }
}
