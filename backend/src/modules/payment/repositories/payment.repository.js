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
        paymentStatus: PaymentStatus.Created,
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
    const { page = 1, limit = 50, paymentStatus, eventId } = params;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Math.min(200, parseInt(limit, 10) || 50));
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
    const whereClause = { AND: andFilters };

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where: whereClause }),
      prisma.payment.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, phone: true },
          },
          event: { select: { id: true, title: true, organizerId: true } },
          booking: {
            select: {
              id: true,
              bookingNumber: true,
              bookingStatus: true,
              event: { select: { id: true, title: true } },
            },
          },
          refunds: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNumber,
      }),
    ]);

    return {
      data: payments,
      meta: { page: pageNumber, limit: limitNumber, total, totalPages: Math.ceil(total / limitNumber) || 1 },
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
    if (paymentStatus === PaymentStatus.Paid) data.paymentDate = new Date();

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
