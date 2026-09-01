import { PaymentRepository } from '../repositories/payment.repository.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Automated Tax Invoice Generation Service
 */
export class InvoiceService {
  static async getInvoice(bookingId) {
    const invoice = await PaymentRepository.findInvoiceByBooking(bookingId);
    if (!invoice) throw new AppError('Tax Invoice not found for this booking', HTTP_STATUS.NOT_FOUND);

    return {
      invoiceNumber: invoice.invoiceNumber,
      bookingNumber: invoice.booking.bookingNumber,
      eventTitle: invoice.booking.event.title,
      customerName: `${invoice.booking.customer.firstName} ${invoice.booking.customer.lastName}`,
      customerEmail: invoice.booking.customer.email,
      subtotal: invoice.subtotal,
      gstAmount: invoice.gstAmount,
      totalAmount: invoice.totalAmount,
      currency: invoice.booking.currency,
      invoiceDate: invoice.createdAt,
      items: invoice.booking.items,
    };
  }
}
