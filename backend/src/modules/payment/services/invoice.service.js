import { PaymentRepository } from '../repositories/payment.repository.js';
import { BookingRepository } from '../../booking/repositories/booking.repository.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import { customerDisplayName, presentCustomer } from '../../booking/utils/presentBooking.util.js';

/**
 * Automated Tax Invoice Generation Service
 */
export class InvoiceService {
  static async getInvoice(bookingId) {
    const invoice = await PaymentRepository.findInvoiceByBooking(bookingId);
    if (invoice?.booking) {
      const customer = presentCustomer(invoice.booking.customer);
      return {
        invoiceNumber: invoice.invoiceNumber,
        bookingNumber: invoice.booking.bookingNumber,
        eventTitle: invoice.booking.event?.title,
        customerName: customerDisplayName(customer),
        customerEmail: customer.email,
        subtotal: invoice.subtotal,
        gstAmount: invoice.gstAmount,
        totalAmount: invoice.totalAmount,
        currency: invoice.booking.currency,
        invoiceDate: invoice.createdAt,
        items: invoice.booking.items,
        paymentGateway: invoice.booking.paymentGateway,
        paymentStatus: invoice.booking.paymentStatus,
        bookingStatus: invoice.booking.bookingStatus,
      };
    }

    const booking = await BookingRepository.findById(bookingId);
    if (!booking) throw new AppError('Tax Invoice not found for this booking', HTTP_STATUS.NOT_FOUND);
    const customer = presentCustomer(booking.customer);
    return {
      invoiceNumber: `INV-${booking.bookingNumber}`,
      bookingNumber: booking.bookingNumber,
      eventTitle: booking.event?.title,
      customerName: customerDisplayName(customer),
      customerEmail: customer.email,
      subtotal: booking.subtotal,
      gstAmount: booking.gstAmount,
      platformFee: booking.platformFee,
      bookingFee: booking.bookingFee,
      serviceCharge: booking.serviceCharge,
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      invoiceDate: booking.createdAt,
      items: booking.items,
      paymentGateway: booking.paymentGateway,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
    };
  }
}
