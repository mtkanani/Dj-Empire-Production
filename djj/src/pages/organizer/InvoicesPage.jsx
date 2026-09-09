import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Banknote } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { organizerBookingService } from '../../services/organizer/organizerBookingService.js';
import { PaymentStatusBadge } from '../../components/payment/PaymentStatusBadge.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

const customerName = (booking) => {
  const c = booking?.customer;
  if (!c) return 'Unknown customer';
  const name = `${c.firstName || ''} ${c.lastName || ''}`.trim();
  return name || c.email || 'Unknown customer';
};

const methodLabel = (booking) => {
  const gateway = String(booking?.paymentGateway || booking?.payments?.[0]?.gateway || '').toUpperCase();
  if (gateway === 'CASH') return 'Cash';
  if (gateway === 'RAZORPAY') return 'Razorpay';
  return gateway || '—';
};

const isCashPending = (booking) => {
  const gateway = String(booking?.paymentGateway || '').toUpperCase();
  const paid = ['Paid', 'Captured', 'CASH_RECEIVED'].includes(booking?.paymentStatus);
  return gateway === 'CASH' && !paid && !['Cancelled', 'Expired'].includes(booking?.bookingStatus);
};

const invoiceState = (booking) => {
  if (isCashPending(booking)) return { label: 'Pending', color: C.gold };
  if (['Confirmed', 'CheckedIn'].includes(booking.bookingStatus) || ['Paid', 'Captured', 'CASH_RECEIVED'].includes(booking.paymentStatus)) {
    return { label: 'Confirmed', color: C.green };
  }
  return { label: booking.displayPaymentStatus || booking.paymentStatus || booking.bookingStatus || 'Pending', color: C.muted };
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await organizerBookingService.getOrganizerBookings({ limit: 100 });
      const data = res.data || res;
      const list = Array.isArray(data) ? data : data.bookings || [];
      setBookings(list);
    } catch (err) {
      setError(err.message || 'Unable to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = bookings.filter((b) => {
    const hay = [
      b.bookingNumber,
      b.customer?.firstName,
      b.customer?.lastName,
      b.customer?.email,
      b.event?.title,
      methodLabel(b),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return !search || hay.includes(search.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, margin: 0, color: C.text }}>
          Tax Invoices & Payment Receipts
        </h1>
        <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '13px' }}>
          All ticket payments. Cash bookings stay Pending until you confirm them on Cash Verify.
        </p>
      </div>

      <div style={{ position: 'relative', width: '280px' }}>
        <Search size={16} color={C.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search booking, customer, or method..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '8px 12px 8px 36px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading invoices...</div>
      ) : error ? (
        <div style={{ padding: '20px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '14px', color: C.red, textAlign: 'center' }}>{error}</div>
      ) : filteredInvoices.length === 0 ? (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '60px 24px', textAlign: 'center', color: C.muted }}>
          <FileText size={42} color={C.muted} style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
            No invoices yet
          </h3>
          <p style={{ margin: 0, fontSize: '13px' }}>Bookings appear here as soon as they are created, including unpaid cash holds.</p>
        </div>
      ) : (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '14px 16px' }}>Booking ID</th>
                <th style={{ padding: '14px 16px' }}>Customer</th>
                <th style={{ padding: '14px 16px' }}>Event</th>
                <th style={{ padding: '14px 16px' }}>Method</th>
                <th style={{ padding: '14px 16px' }}>Subtotal</th>
                <th style={{ padding: '14px 16px' }}>Fees</th>
                <th style={{ padding: '14px 16px' }}>GST</th>
                <th style={{ padding: '14px 16px' }}>Total</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px' }}>Date</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((b) => {
                const fees = (b.platformFee || 0) + (b.bookingFee || 0) + (b.serviceCharge || 0);
                const state = invoiceState(b);
                return (
                  <tr key={b.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '14px 16px', color: C.gold, fontFamily: 'Space Grotesk, monospace', fontWeight: 700 }}>
                      {b.bookingNumber}
                    </td>
                    <td style={{ padding: '14px 16px', color: C.text, fontWeight: 600 }}>
                      <div>{customerName(b)}</div>
                      {b.customer?.email && <span style={{ fontSize: '11px', color: C.muted }}>{b.customer.email}</span>}
                    </td>
                    <td style={{ padding: '14px 16px', color: C.text }}>{b.event?.title || '—'}</td>
                    <td style={{ padding: '14px 16px', color: C.blue, fontWeight: 700 }}>{methodLabel(b)}</td>
                    <td style={{ padding: '14px 16px', color: C.muted }}>{formatCurrency(b.subtotal || 0, b.currency)}</td>
                    <td style={{ padding: '14px 16px', color: C.muted }}>{formatCurrency(fees, b.currency)}</td>
                    <td style={{ padding: '14px 16px', color: C.muted }}>{formatCurrency(b.gstAmount || 0, b.currency)}</td>
                    <td style={{ padding: '14px 16px', color: C.gold, fontWeight: 700 }}>{formatCurrency(b.totalAmount || 0, b.currency)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ color: state.color, fontWeight: 800, fontSize: 12 }}>{state.label}</span>
                        <PaymentStatusBadge status={b.displayPaymentStatus || b.paymentStatus} gateway={b.paymentGateway} />
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: C.muted }}>{formatDate(b.createdAt)}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {isCashPending(b) && (
                          <button
                            type="button"
                            onClick={() => navigate(`/organizer/cash-verify?bookingNumber=${encodeURIComponent(b.bookingNumber)}`)}
                            style={{ background: C.gold, border: 'none', borderRadius: '8px', color: '#000', padding: '6px 12px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Banknote size={14} /> Confirm cash
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate(`/invoices/${b.id}`)}
                          style={{ background: C.goldDim, border: `1px solid ${C.borderGold}`, borderRadius: '8px', color: C.gold, padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <FileText size={14} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
