import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, User, Calendar } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export const RecentBookings = ({ bookings = [], loading = false }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: C.blueDim,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.blue,
            }}
          >
            <BookOpen size={18} />
          </div>
          <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.text, fontSize: '16px', margin: 0, fontWeight: 700 }}>
            Recent Bookings
          </h4>
        </div>

        <button
          onClick={() => navigate('/organizer/bookings')}
          style={{
            background: 'transparent',
            border: 'none',
            color: C.blue,
            fontSize: '13px',
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600,
          }}
        >
          View All <ArrowRight size={14} />
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '30px 0', textAlign: 'center', color: C.muted }}>Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: C.muted, fontSize: '14px' }}>
          No bookings recorded yet.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted }}>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Booking ID</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Customer</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Event</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Tickets</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const customerName = b.customer
                  ? `${b.customer.firstName || ''} ${b.customer.lastName || ''}`.trim() || b.customer.email
                  : 'Customer';
                const ticketsCount = Array.isArray(b.tickets) ? b.tickets.length : 1;

                return (
                  <tr key={b.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', color: C.gold }}>
                      {b.bookingCode || b.id?.slice(0, 8)}
                    </td>
                    <td style={{ padding: '12px', color: C.text }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={13} color={C.muted} /> {customerName}
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: C.text, fontWeight: 500 }}>
                      {b.event?.title || 'Event'}
                    </td>
                    <td style={{ padding: '12px', color: C.muted }}>{ticketsCount}</td>
                    <td style={{ padding: '12px', color: C.text, fontWeight: 600 }}>
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? C.greenDim : C.goldDim,
                          color: b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? C.green : C.gold,
                        }}
                      >
                        {b.status || 'PENDING'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: C.muted }}>{formatDate(b.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
