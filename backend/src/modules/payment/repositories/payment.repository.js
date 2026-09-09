import { prisma } from '../../../config/prisma.js';
import { PaymentStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Payment & Financial Repository
 */
export class PaymentRepository {
  /**
   * Create Payment Order record
   */
  static async createPayment(data) {
    const paymentNumber = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${uuidv4().substring(0, 6).toUpperCase()}`;

    return prisma.payment.create({
      data: {
        paymentNumber,
        bookingId: data.bookingId,
        eventId: data.eventId || null,
        userId: data.userId,
        gateway: data.gateway || 'RAZORPAY',
        gatewayOrderId: data.gatewayOrderId || null,
        currency: data.currency || 'INR',
        exchangeRate: data.exchangeRate || 1.0,
        subtotal: data.subtotal,
        discount: data.discount || 0.0,
        taxAmount: data.taxAmount || 0.0,
        platformFee: data.platformFee || 0.0,
        bookingFee: data.bookingFee || 0.0,
        serviceCharge: data.serviceCharge || 0.0,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod || 'CARD',
        paymentStatus: data.paymentStatus || PaymentStatus.Created,
        paymentType: 'SALE',
      },
    });
  }

  static async findById(id) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            event: { select: { id: true, title: true, organizerId: true } },
          },
        },
        event: { select: { id: true, title: true, organizerId: true } },
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        refunds: true,
        invoices: true,
      },
    });
  }

  static async findByOrganizer(organizerId, params = {}) {
    const { page = 1, limit = 10, paymentStatus, eventId, gateway } = params;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * limitNumber;

    const andFilters = [
      {
        OR: [
          { event: { organizerId } },
          { booking: { event: { organizerId } } },
        ],
      },
    ];
    if (paymentStatus) andFilters.push({ paymentStatus });
    if (eventId) andFilters.push({ eventId });
    if (gateway) andFilters.push({ gateway });
    const whereClause = { AND: andFilters };

    const customerSelect = { id: true, email: true, firstName: true, lastName: true, phone: true };

    const paymentQuery = {
      where: whereClause,
      include: {
        user: { select: customerSelect },
        event: { select: { id: true, title: true, organizerId: true } },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            bookingStatus: true,
            paymentGateway: true,
            paymentStatus: true,
            subtotal: true,
            gstAmount: true,
            platformFee: true,
            bookingFee: true,
            serviceCharge: true,
            totalAmount: true,
            currency: true,
            customer: { select: customerSelect },
            event: { select: { id: true, title: true } },
          },
        },
        refunds: { select: { id: true, refundAmount: true, refundStatus: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNumber,
    };

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where: whereClause }),
      prisma.payment.findMany(paymentQuery),
    ]);

    const includeCashHolds =
      pageNumber === 1 && !paymentStatus && (!gateway || String(gateway).toUpperCase() === 'CASH');

    const cashWhere = {
      paymentGateway: 'CASH',
      paymentStatus: PaymentStatus.Pending,
      event: { organizerId },
    };
    if (eventId) cashWhere.eventId = eventId;

    const cashBookings = includeCashHolds
      ? await prisma.booking.findMany({
          where: cashWhere,
          select: {
            id: true,
            bookingNumber: true,
            bookingStatus: true,
            paymentStatus: true,
            currency: true,
            subtotal: true,
            couponDiscount: true,
            discount: true,
            gstAmount: true,
            platformFee: true,
            bookingFee: true,
            serviceCharge: true,
            totalAmount: true,
            createdAt: true,
            cashVerifiedAt: true,
            customer: { select: customerSelect },
            event: { select: { id: true, title: true, organizerId: true } },
            payments: { select: { id: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 25,
        })
      : [];

    const paymentBookingIds = new Set(payments.map((p) => p.bookingId).filter(Boolean));
    const synthetic = cashBookings
      .filter((booking) => !(booking.payments || []).length && !paymentBookingIds.has(booking.id))
      .map((booking) => ({
        id: `cash-hold-${booking.id}`,
        paymentNumber: booking.bookingNumber,
        bookingId: booking.id,
        synthetic: true,
        user: booking.customer,
        event: booking.event,
        booking: {
          id: booking.id,
          bookingNumber: booking.bookingNumber,
          bookingStatus: booking.bookingStatus,
          event: booking.event,
          customer: booking.customer,
        },
        gateway: 'CASH',
        paymentMethod: 'CASH',
        paymentStatus: booking.paymentStatus,
        currency: booking.currency,
        subtotal: booking.subtotal,
        discount: booking.couponDiscount || booking.discount || 0,
        taxAmount: booking.gstAmount,
        platformFee: booking.platformFee,
        bookingFee: booking.bookingFee,
        serviceCharge: booking.serviceCharge,
        totalAmount: booking.totalAmount,
        createdAt: booking.createdAt,
        paymentDate: booking.cashVerifiedAt || null,
      }));

    const data = [...synthetic, ...payments];

    return {
      data,
      meta: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.max(1, Math.ceil(total / limitNumber) || 1),
      },
    };
  }

  static async findByGatewayOrderId(gatewayOrderId) {
    return prisma.payment.findFirst({
      where: { gatewayOrderId },
      include: { booking: true },
    });
  }

  static async updateStatus(id, paymentStatus, { gatewayPaymentId, gatewayTransactionId, paidAmount, gatewayResponse } = {}) {
    const data = { paymentStatus };
    if (gatewayPaymentId) data.gatewayPaymentId = gatewayPaymentId;
    if (gatewayTransactionId) data.gatewayTransactionId = gatewayTransactionId;
    if (paidAmount !== undefined) data.paidAmount = paidAmount;
    if (gatewayResponse) data.gatewayResponse = JSON.stringify(gatewayResponse);
    if (paymentStatus === PaymentStatus.Paid || paymentStatus === PaymentStatus.CASH_RECEIVED) {
      data.paymentDate = new Date();
    }

    return prisma.payment.update({
      where: { id },
      data,
    });
  }

  // ==================== REFUNDS ====================
  static async createRefund(data) {
    const refundNumber = `RFD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${uuidv4().substring(0, 6).toUpperCase()}`;

    return prisma.refund.create({
      data: {
        refundNumber,
        paymentId: data.paymentId,
        bookingId: data.bookingId,
        userId: data.userId,
        refundAmount: data.refundAmount,
        reason: data.reason || null,
        refundStatus: 'PROCESSED',
      },
    });
  }

  static async findRefundsByPayment(paymentId) {
    return prisma.refund.findMany({ where: { paymentId } });
  }

  static async findRefundsByOrganizer(organizerId) {
    return prisma.refund.findMany({
      where: {
        booking: { event: { organizerId } },
      },
      include: {
        payment: true,
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            event: { select: { id: true, title: true } },
          },
        },
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async applyRefundAmount(id, refundAmount, paymentStatus) {
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return null;
    return prisma.payment.update({
      where: { id },
      data: {
        refundAmount: (payment.refundAmount || 0) + refundAmount,
        paymentStatus,
      },
    });
  }

  // ==================== INVOICES ====================
  static async createInvoice(data) {
    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${uuidv4().substring(0, 6).toUpperCase()}`;

    return prisma.invoice.create({
      data: {
        invoiceNumber,
        bookingId: data.bookingId,
        paymentId: data.paymentId || null,
        userId: data.userId,
        subtotal: data.subtotal,
        gstAmount: data.gstAmount,
        totalAmount: data.totalAmount,
      },
    });
  }

  static async findInvoiceByBooking(bookingId) {
    return prisma.invoice.findFirst({
      where: { bookingId },
      include: { booking: { include: { event: true, customer: true, items: true } } },
    });
  }

  // ==================== SETTLEMENTS ====================
  static async findSettlementsByOrganizer(organizerId) {
    return prisma.settlement.findMany({
      where: { organizerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== WEBHOOK LOGS ====================
  static async logWebhook(gateway, eventType, payload) {
    return prisma.webhookLog.create({
      data: {
        gateway,
        eventType,
        payload: JSON.stringify(payload),
      },
    });
  }
}
