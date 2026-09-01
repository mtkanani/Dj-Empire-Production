import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowRight, DollarSign } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export const RecentPayments = ({ payments = [], loading = false }) => {
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
              background: C.greenDim,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.green,
            }}
          >
            <CreditCard size={18} />
          </div>
          <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.text, fontSize: '16px', margin: 0, fontWeight: 700 }}>
            Recent Payments
          </h4>
        </div>

        <button
          onClick={() => navigate('/organizer/payments')}
          style={{
            background: 'transparent',
            border: 'none',
            color: C.green,
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
        <div style={{ padding: '30px 0', textAlign: 'center', color: C.muted }}>Loading payments...</div>
      ) : payments.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: C.muted, fontSize: '14px' }}>
          No payment transactions recorded yet.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted }}>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Transaction ID</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Customer</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Event</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Payment Method</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const customerName = p.customer
                  ? `${p.customer.firstName || ''} ${p.customer.lastName || ''}`.trim() || p.customer.email
                  : 'Customer';

                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', color: C.blue }}>
                      {p.transactionId || `TXN-${p.id?.slice(0, 8)}`}
                    </td>
                    <td style={{ padding: '12px', color: C.text }}>{customerName}</td>
                    <td style={{ padding: '12px', color: C.text }}>{p.event?.title || 'Event'}</td>
                    <td style={{ padding: '12px', color: C.green, fontWeight: 700 }}>
                      {formatCurrency(p.totalAmount)}
                    </td>
                    <td style={{ padding: '12px', color: C.muted }}>{p.paymentMethod || 'Online / Card'}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: p.status === 'CONFIRMED' || p.paymentStatus === 'PAID' ? C.greenDim : C.goldDim,
                          color: p.status === 'CONFIRMED' || p.paymentStatus === 'PAID' ? C.green : C.gold,
                        }}
                      >
                        {p.paymentStatus || p.status || 'PAID'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: C.muted }}>{formatDate(p.createdAt)}</td>
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
