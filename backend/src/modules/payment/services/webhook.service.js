import { PaymentRepository } from '../repositories/payment.repository.js';
import { PaymentProviderFactory } from '../providers/paymentProvider.factory.js';
import { BookingService } from '../../booking/services/booking.service.js';

/**
 * Service handling Idempotent Gateway Webhooks
 */
export class WebhookService {
  static async handleWebhook(gatewayName, payload, headers) {
    const provider = PaymentProviderFactory.getProvider(gatewayName);
    const parsed = await provider.parseWebhook(payload, headers);

    // Log webhook execution
    await PaymentRepository.logWebhook(gatewayName, parsed.eventType, payload);

    if (parsed.gatewayOrderId) {
      const payment = await PaymentRepository.findByGatewayOrderId(parsed.gatewayOrderId);
      if (payment && payment.paymentStatus !== 'Paid' && parsed.status === 'Paid') {
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
