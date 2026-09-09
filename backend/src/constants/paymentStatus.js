import { PaymentStatus, PaymentGateway, Role } from '@prisma/client';

/**
 * Single source of truth for payment status semantics.
 *
 * Before this module existed, "is this booking paid?" was re-implemented in the
 * gate scanner, the refund guard, the scanner metrics query and the payment
 * service, each with its own hardcoded list. Adding CASH_RECEIVED to the enum
 * would have silently broken every one of them — a verified cash attendee
 * turned away at the door, cash revenue missing from dashboards, cash bookings
 * unrefundable. Every consumer now imports from here instead.
 */

/** Statuses that mean the money has been received. Cash counts once verified. */
export const PAID_PAYMENT_STATUSES = Object.freeze([
  PaymentStatus.Paid,
  PaymentStatus.Captured,
  PaymentStatus.CASH_RECEIVED,
]);

/** Statuses eligible for a refund. */
export const REFUNDABLE_PAYMENT_STATUSES = Object.freeze([
  PaymentStatus.Paid,
  PaymentStatus.Captured,
  PaymentStatus.CASH_RECEIVED,
  PaymentStatus.PartiallyRefunded,
]);

/** Statuses that block admission at the gate outright. */
export const VOIDED_PAYMENT_STATUSES = Object.freeze([
  PaymentStatus.Cancelled,
  PaymentStatus.Refunded,
  PaymentStatus.Failed,
  PaymentStatus.Expired,
]);

/** Roles permitted to verify offline (cash) settlement. */
export const CASH_VERIFIER_ROLES = Object.freeze([Role.SUPER_ADMIN, Role.EVENT_ORGANIZER]);

/** Roles allowed to read any payment/booking, not just their own. */
export const STAFF_ROLES = Object.freeze([
  Role.SUPER_ADMIN,
  Role.EVENT_ORGANIZER,
  Role.GATE_MANAGER,
  Role.SCANNER_STAFF,
  Role.SECURITY,
  Role.VOLUNTEER,
]);

/** Payment methods settled in person rather than through an online gateway. */
export const OFFLINE_GATEWAYS = Object.freeze([PaymentGateway.CASH, PaymentGateway.BANK_TRANSFER]);

export const isPaid = (status) => PAID_PAYMENT_STATUSES.includes(status);

export const isRefundable = (status) => REFUNDABLE_PAYMENT_STATUSES.includes(status);

export const isVoided = (status) => VOIDED_PAYMENT_STATUSES.includes(status);

export const isOfflineGateway = (gateway) => OFFLINE_GATEWAYS.includes(gateway);

/**
 * Customer-facing label for a payment status, disambiguated by gateway so a
 * pending cash booking reads as awaiting collection rather than merely pending.
 */
export const getPaymentDisplayStatus = (paymentStatus, gateway = null) => {
  if (paymentStatus === PaymentStatus.CASH_RECEIVED) return 'Cash Received';

  if (gateway === PaymentGateway.CASH && paymentStatus === PaymentStatus.Pending) {
    return 'Pending Cash Verification';
  }

  if (paymentStatus === PaymentStatus.Paid || paymentStatus === PaymentStatus.Captured) {
    return 'Paid';
  }

  return paymentStatus;
};
