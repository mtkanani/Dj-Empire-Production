import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Filter, RefreshCw, Eye } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { financialService } from '../../services/organizer/financialService.js';
import { eventService as organizerEventService } from '../../services/organizer/eventService.js';
import { PaymentStatusBadge } from '../../components/payment/PaymentStatusBadge.jsx';
import { formatDate, formatCurrency } from '../../utils/formatters.js';

const customerLabel = (payment) => {
  const user = payment?.user || payment?.booking?.customer;
  if (!user) return 'Unknown customer';
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return name || user.email || 'Unknown customer';
};

const methodLabel = (payment) => {
  const gateway = String(payment?.gateway || payment?.paymentMethod || '').toUpperCase();
  if (gateway === 'CASH') return 'Cash';
  if (gateway === 'RAZORPAY') return 'Razorpay';
  if (gateway === 'STRIPE') return 'Stripe';
  if (gateway === 'BANK_TRANSFER') return 'Bank Transfer';
  return gateway || '—';
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await organizerEventService.getMyEvents({ limit: 100 });
        const data = res.data || res;
        setEvents(Array.isArray(data) ? data : data.events || []);
      } catch {
        setEvents([]);
      }
    };
    fetchEvents();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await financialService.getOrganizerPayments({
        limit: 100,
        eventId: eventFilter || undefined,
        paymentStatus: statusFilter || undefined,
      });
      const data = res.data || res;
      setPayments(Array.isArray(data) ? data : data.payments || []);
    } catch (err) {
      setError(err.message || 'Unable to load payment transactions.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [eventFilter, statusFilter]);

  const filteredPayments = payments.filter((p) => {
    const haystack = [
      p.paymentNumber,
      p.id,
      p.booking?.bookingNumber,
      p.user?.firstName,
      p.user?.lastName,
      p.user?.email,
      p.booking?.customer?.firstName,
      p.booking?.customer?.email,
      p.event?.title,
      p.booking?.event?.title,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = !search || haystack.includes(search.toLowerCase());
    const matchesGateway = !gatewayFilter || String(p.gateway || p.paymentMethod || '').toUpperCase() === gatewayFilter;
    return matchesSearch && matchesGateway;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, margin: 0, color: C.text }}>
          Event Payments
        </h1>
        <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '13px' }}>
          All customer payments for your events, including Cash and Razorpay
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} color={C.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search customer, booking, or payment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            style={{ padding: '8px 12px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px', color: C.text, fontSize: '13px', outline: 'none' }}
          >
            <option value="">All Events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '6px 12px' }}>
            <CreditCard size={16} color={C.gold} />
            <select
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: C.text, fontSize: '13px', outline: 'none' }}
            >
              <option value="" style={{ background: C.bgCard }}>All Methods</option>
              <option value="CASH" style={{ background: C.bgCard }}>Cash</option>
              <option value="RAZORPAY" style={{ background: C.bgCard }}>Razorpay</option>
              <option value="STRIPE" style={{ background: C.bgCard }}>Stripe</option>
              <option value="BANK_TRANSFER" style={{ background: C.bgCard }}>Bank Transfer</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '6px 12px' }}>
            <Filter size={16} color={C.blue} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: C.text, fontSize: '13px', outline: 'none' }}
            >
              <option value="" style={{ background: C.bgCard }}>All Statuses</option>
              <option value="Pending" style={{ background: C.bgCard }}>Pending</option>
              <option value="CASH_RECEIVED" style={{ background: C.bgCard }}>Cash Received</option>
              <option value="Paid" style={{ background: C.bgCard }}>Paid</option>
              <option value="Created" style={{ background: C.bgCard }}>Created</option>
              <option value="Failed" style={{ background: C.bgCard }}>Failed</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px', color: C.text, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {selectedPayment && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: C.bgCard, border: `1px solid ${C.borderGold}`, borderRadius: '24px', padding: '24px', maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', color: C.gold }}>
              {selectedPayment.paymentNumber || selectedPayment.id}
            </h3>
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><span style={{ color: C.muted }}>Customer:</span> <strong style={{ color: C.text }}>{customerLabel(selectedPayment)}</strong></div>
              <div><span style={{ color: C.muted }}>Email:</span> <strong style={{ color: C.text }}>{selectedPayment.user?.email || selectedPayment.booking?.customer?.email || '—'}</strong></div>
              <div><span style={{ color: C.muted }}>Event:</span> <strong style={{ color: C.text }}>{selectedPayment.event?.title || selectedPayment.booking?.event?.title || '—'}</strong></div>
              <div><span style={{ color: C.muted }}>Booking ID:</span> <strong style={{ color: C.gold, fontFamily: 'Space Grotesk, monospace' }}>{selectedPayment.booking?.bookingNumber || '—'}</strong></div>
              <div><span style={{ color: C.muted }}>Method:</span> <strong style={{ color: C.blue }}>{methodLabel(selectedPayment)}</strong></div>
              <div><span style={{ color: C.muted }}>Ticket subtotal:</span> <strong style={{ color: C.text }}>{formatCurrency(selectedPayment.subtotal || selectedPayment.booking?.subtotal || 0, selectedPayment.currency)}</strong></div>
              {(selectedPayment.platformFee || 0) > 0 && (
                <div><span style={{ color: C.muted }}>Platform fee:</span> <strong style={{ color: C.text }}>{formatCurrency(selectedPayment.platformFee, selectedPayment.currency)}</strong></div>
              )}
              {(selectedPayment.bookingFee || 0) > 0 && (
                <div><span style={{ color: C.muted }}>Booking fee:</span> <strong style={{ color: C.text }}>{formatCurrency(selectedPayment.bookingFee, selectedPayment.currency)}</strong></div>
              )}
              {(selectedPayment.serviceCharge || 0) > 0 && (
                <div><span style={{ color: C.muted }}>Service charge:</span> <strong style={{ color: C.text }}>{formatCurrency(selectedPayment.serviceCharge, selectedPayment.currency)}</strong></div>
              )}
              <div><span style={{ color: C.muted }}>GST:</span> <strong style={{ color: C.text }}>{formatCurrency(selectedPayment.taxAmount || selectedPayment.booking?.gstAmount || 0, selectedPayment.currency)}</strong></div>
              <div><span style={{ color: C.muted }}>Total:</span> <strong style={{ color: C.green, fontSize: '16px' }}>{formatCurrency(selectedPayment.totalAmount, selectedPayment.currency)}</strong></div>
              {selectedPayment.gatewayPaymentId && (
                <div><span style={{ color: C.muted }}>Gateway payment ID:</span> <strong style={{ color: C.text }}>{selectedPayment.gatewayPaymentId}</strong></div>
              )}
              <div><span style={{ color: C.muted }}>Date:</span> <strong style={{ color: C.text }}>{formatDate(selectedPayment.paymentDate || selectedPayment.createdAt)}</strong></div>
            </div>
            <button
              onClick={() => setSelectedPayment(null)}
              style={{ width: '100%', padding: '10px', background: C.gold, color: '#000', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading payment transactions...</div>
      ) : error ? (
        <div style={{ padding: '20px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '14px', color: C.red, textAlign: 'center' }}>{error}</div>
      ) : filteredPayments.length === 0 ? (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '60px 24px', textAlign: 'center', color: C.muted }}>
          No customer payments found for your events.
        </div>
      ) : (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '14px 16px' }}>Payment Ref</th>
                <th style={{ padding: '14px 16px' }}>Customer</th>
                <th style={{ padding: '14px 16px' }}>Event</th>
                <th style={{ padding: '14px 16px' }}>Booking ID</th>
                <th style={{ padding: '14px 16px' }}>Method</th>
                <th style={{ padding: '14px 16px' }}>Amount</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '14px 16px', color: C.gold, fontFamily: 'Space Grotesk, monospace', fontWeight: 700 }}>
                    #{p.paymentNumber || p.id}
                  </td>
                  <td style={{ padding: '14px 16px', color: C.text, fontWeight: 600 }}>
                    <div>{customerLabel(p)}</div>
                    {(p.user?.email || p.booking?.customer?.email) && (
                      <span style={{ fontSize: '11px', color: C.muted }}>{p.user?.email || p.booking?.customer?.email}</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', color: C.text }}>
                    {p.event?.title || p.booking?.event?.title || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', color: C.gold, fontFamily: 'Space Grotesk, monospace', fontWeight: 700 }}>
                    {p.booking?.bookingNumber || '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ color: C.blue, fontWeight: 700 }}>{methodLabel(p)}</span>
                  </td>
                  <td style={{ padding: '14px 16px', color: C.text, fontWeight: 700 }}>
                    {formatCurrency(p.totalAmount, p.currency)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <PaymentStatusBadge status={p.paymentStatus} gateway={p.gateway} />
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedPayment(p)}
                      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
