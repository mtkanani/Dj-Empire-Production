import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Search, Filter, FileText, ArrowRight, Eye, Calendar } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { paymentService } from '../../services/payment/paymentService.js';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar.jsx';
import { CustomerFooter } from '../../components/customer/CustomerFooter.jsx';
import { PaymentStatusBadge } from '../../components/payment/PaymentStatusBadge.jsx';
import { formatDate, formatCurrency } from '../../utils/formatters.js';

export default function CustomerPaymentHistoryPage() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('ALL');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await paymentService.getPaymentHistory();
        setBookings(Array.isArray(data) ? data : data.bookings || []);
      } catch (err) {
        setError(err.message || 'Unable to load payment history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Filter payment records
  const filteredBookings = bookings.filter((item) => {
    const matchesSearch =
      !search ||
      (item.id && item.id.toLowerCase().includes(search.toLowerCase())) ||
      (item.bookingNumber && item.bookingNumber.toLowerCase().includes(search.toLowerCase())) ||
      (item.event?.title && item.event.title.toLowerCase().includes(search.toLowerCase()));

    const matchesGateway =
      gatewayFilter === 'ALL' ||
      (item.payment && String(item.payment.gateway).toUpperCase() === gatewayFilter);

    return matchesSearch && matchesGateway;
  });

  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
      <CustomerNavbar />

      <main style={{ flexGrow: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 800, margin: 0, color: C.text }}>
              My Payment History
            </h1>
            <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '14px' }}>
              View payment transactions, gateway receipts, and tax invoices
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
            <Search size={16} color={C.muted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by Booking Ref or Event Title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                color: C.text,
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Gateway Filter */}
          <select
            value={gatewayFilter}
            onChange={(e) => setGatewayFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
            }}
          >
            <option value="ALL">All Gateways</option>
            <option value="RAZORPAY">Razorpay</option>
            <option value="PAYPAL">PayPal</option>
            <option value="STRIPE">Stripe</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
        </div>

        {/* Table / List View */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading payment transactions...</div>
        ) : error ? (
          <div style={{ padding: '20px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '16px', color: C.red, textAlign: 'center' }}>
            {error}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '40px', textAlign: 'center', color: C.muted }}>
            No payment records found.
          </div>
        ) : (
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, textTransform: 'uppercase', fontSize: '11px' }}>
                  <th style={{ padding: '16px 20px' }}>Booking Ref</th>
                  <th style={{ padding: '16px 20px' }}>Event</th>
                  <th style={{ padding: '16px 20px' }}>Amount</th>
                  <th style={{ padding: '16px 20px' }}>Gateway</th>
                  <th style={{ padding: '16px 20px' }}>Status</th>
                  <th style={{ padding: '16px 20px' }}>Date</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const bookingRef = b.bookingNumber || b.id;
                  const eventTitle = b.event?.title || 'Event Booking';
                  const total = b.totalAmount || 0;
                  const currency = b.currency || 'INR';
                  const gateway = b.payment?.gateway || 'CARD';
                  const status = b.paymentStatus || 'Pending';

                  return (
                    <tr key={b.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: C.gold, fontFamily: 'Space Grotesk, monospace' }}>
                        #{bookingRef}
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: C.text }}>
                        {eventTitle}
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 800, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
                        {formatCurrency(total, currency)}
                      </td>
                      <td style={{ padding: '16px 20px', color: C.muted }}>
                        {gateway}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <PaymentStatusBadge status={status} />
                      </td>
                      <td style={{ padding: '16px 20px', color: C.muted }}>
                        {formatDate(b.createdAt)}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => navigate(`/invoices/${b.id}`)}
                            title="View Tax Invoice"
                            style={{
                              padding: '6px 12px',
                              background: C.goldDim,
                              border: `1px solid ${C.borderGold}`,
                              borderRadius: '8px',
                              color: C.gold,
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <FileText size={14} /> Tax Invoice
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
      </main>

      <CustomerFooter />
    </div>
  );
}
