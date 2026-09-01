/**
 * Customer utility helpers.
 * Used by CustomerTable, CustomerActions, CustomerStatusBadge, CustomerDetailsPage.
 */
import { C } from '../constants/theme.js';
import { formatDate } from './formatters.js';

// ──────────────────────────────────────────────
// Status configuration
// ──────────────────────────────────────────────
export const CUSTOMER_STATUS_CONFIG = {
  ACTIVE: {
    label: 'Active',
    color: C.green,
    bg: C.greenDim,
    border: C.green,
  },
  SUSPENDED: {
    label: 'Suspended',
    color: C.red,
    bg: C.redDim,
    border: C.red,
  },
  PENDING_EMAIL_VERIFICATION: {
    label: 'Pending Email',
    color: C.blue,
    bg: C.blueDim,
    border: C.borderBlue,
  },
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    color: C.amber,
    bg: C.amberDim,
    border: C.amber,
  },
  DELETED: {
    label: 'Deleted',
    color: C.faint,
    bg: 'rgba(102,102,102,0.12)',
    border: C.faint,
  },
};

/**
 * Returns display label for a customer status.
 */
export function formatCustomerStatus(status) {
  return CUSTOMER_STATUS_CONFIG[status]?.label || status || 'Unknown';
}

/**
 * Returns the display name for a customer user object.
 */
export function getCustomerDisplayName(customer) {
  if (!customer) return '—';
  const name = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
  return name || customer.email || `Customer #${customer.id?.slice(-6) || '?'}`;
}

/**
 * Determines which actions are available for a customer, based on their status.
 * Only actions backed by actual API endpoints are included.
 *
 * Available backend actions:
 *   PATCH /admin/customers/:id/suspend   (ACTIVE → SUSPENDED)
 *   PATCH /admin/customers/:id/activate  (SUSPENDED → ACTIVE)
 *
 * No permanent deletion endpoint exists in the backend.
 */
export function getCustomerActions(status) {
  const actions = { canView: true, canSuspend: false, canActivate: false };

  if (status === 'ACTIVE') {
    actions.canSuspend = true;
  }

  if (status === 'SUSPENDED') {
    actions.canActivate = true;
  }

  return actions;
}

/**
 * Formats a booking status into a human-readable label.
 * BookingStatus enum from Prisma (PascalCase in the schema):
 * Pending, Reserved, AwaitingPayment, Confirmed, Cancelled, Expired, Refunded, CheckedIn
 */
const BOOKING_STATUS_CONFIG = {
  Confirmed: { label: 'Confirmed', color: C.green, bg: C.greenDim, border: C.green },
  Pending: { label: 'Pending', color: C.amber, bg: C.amberDim, border: C.amber },
  Reserved: { label: 'Reserved', color: C.blue, bg: C.blueDim, border: C.borderBlue },
  AwaitingPayment: { label: 'Awaiting Payment', color: C.amber, bg: C.amberDim, border: C.amber },
  Cancelled: { label: 'Cancelled', color: C.red, bg: C.redDim, border: C.red },
  Expired: { label: 'Expired', color: C.faint, bg: 'rgba(102,102,102,0.12)', border: C.faint },
  Refunded: { label: 'Refunded', color: C.purple, bg: C.purpleDim, border: C.purple },
  CheckedIn: { label: 'Checked In', color: C.green, bg: C.greenDim, border: C.green },
};

export function getBookingStatusConfig(status) {
  return BOOKING_STATUS_CONFIG[status] || {
    label: status || '—',
    color: C.muted,
    bg: C.panel,
    border: C.border,
  };
}

/**
 * Formats a date string for display in the admin UI.
 */
export function formatCustomerDate(dateStr) {
  return formatDate(dateStr) || '—';
}

/**
 * Formats a currency amount in INR.
 * Uses the backend's totalAmount values directly without recalculation.
 */
export function formatCustomerAmount(amount) {
  if (amount === null || amount === undefined) return '—';
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Derives summary statistics from a customer's bookings array.
 * These are computed client-side from `GET /admin/customers/:id` response.
 * The backend does not provide pre-aggregated stats.
 */
export function computeCustomerStats(bookings = []) {
  const total = bookings.length;
  const confirmed = bookings.filter((b) => b.status === 'Confirmed' || b.status === 'CheckedIn').length;
  const cancelled = bookings.filter((b) => b.status === 'Cancelled').length;
  const pending = bookings.filter((b) => ['Pending', 'Reserved', 'AwaitingPayment'].includes(b.status)).length;
  const totalSpent = bookings
    .filter((b) => b.status === 'Confirmed' || b.status === 'CheckedIn')
    .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  return { total, confirmed, cancelled, pending, totalSpent };
}
