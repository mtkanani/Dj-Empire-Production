import React, { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { financialService } from '../../services/organizer/financialService.js';
import { CreateRefundModal } from '../../components/financial/CreateRefundModal.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { useToast } from '../../hooks/useToast.js';

const customerLabel = (user) => {
  if (!user) return 'Customer';
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return name || user.email || 'Customer';
};

export default function RefundsPage() {
  const { showToast } = useToast();

  const [paidPayments, setPaidPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [paymentsRes, refundsRes] = await Promise.allSettled([
        financialService.getOrganizerPayments({ limit: 200 }),
        financialService.getOrganizerRefunds(),
      ]);

      if (paymentsRes.status === 'fulfilled') {
        const data = paymentsRes.value.data || paymentsRes.value;
        const list = (Array.isArray(data) ? data : []).filter((p) =>
          ['Paid', 'Captured', 'PartiallyRefunded'].includes(p.paymentStatus)
        );
        setPaidPayments(list);
        if (list.length > 0 && !selectedPaymentId) {
          setSelectedPaymentId(list[0].id);
        }
      }

      if (refundsRes.status === 'fulfilled') {
        const data = refundsRes.value.data || refundsRes.value;
        setRefunds(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message || 'Unable to load refund records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedPayment = paidPayments.find((p) => p.id === selectedPaymentId) || null;

  const handleProcessRefundSubmit = async (payload) => {
    try {
      await financialService.processRefund(payload);
      showToast('Refund processed successfully!', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to process refund.', 'error');
      throw err;
    }
  };

  const handleOpenRefund = () => {
    if (!selectedPayment) {
      showToast('Select a paid customer payment first.', 'error');
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, margin: 0, color: C.text }}>
            Refund Management
          </h1>
          <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '13px' }}>
            Select a paying customer and process a refund for their event booking
          </p>
        </div>

        <button
          onClick={handleOpenRefund}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: C.red,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '13px',
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={16} /> Process Refund
        </button>
      </div>

      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', color: C.muted, fontWeight: 600 }}>Select customer payment</label>
        <select
          value={selectedPaymentId}
          onChange={(e) => setSelectedPaymentId(e.target.value)}
          style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none' }}
        >
          <option value="">Choose a paid customer...</option>
          {paidPayments.map((p) => (
            <option key={p.id} value={p.id}>
              {customerLabel(p.user)} — {p.event?.title || p.booking?.event?.title || 'Event'} — {formatCurrency(p.totalAmount, p.currency)} ({p.paymentNumber})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading refund records...</div>
      ) : error ? (
        <div style={{ padding: '20px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '14px', color: C.red, textAlign: 'center' }}>{error}</div>
      ) : refunds.length === 0 ? (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '60px 24px', textAlign: 'center', color: C.muted }}>
          <RotateCcw size={42} color={C.muted} style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
            No Refund Transactions
          </h3>
          <p style={{ margin: 0, fontSize: '13px' }}>Select a paid customer above to process a refund.</p>
        </div>
      ) : (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '14px 16px' }}>Refund Ref</th>
                <th style={{ padding: '14px 16px' }}>Customer</th>
                <th style={{ padding: '14px 16px' }}>Event</th>
                <th style={{ padding: '14px 16px' }}>Booking</th>
                <th style={{ padding: '14px 16px' }}>Amount</th>
                <th style={{ padding: '14px 16px' }}>Date</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '14px 16px', color: C.red, fontFamily: 'Space Grotesk, monospace', fontWeight: 700 }}>
                    #{r.refundNumber || r.id}
                  </td>
                  <td style={{ padding: '14px 16px', color: C.text, fontWeight: 600 }}>
                    {customerLabel(r.user)}
                  </td>
                  <td style={{ padding: '14px 16px', color: C.text }}>
                    {r.booking?.event?.title || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', color: C.gold, fontFamily: 'Space Grotesk, monospace' }}>
                    #{r.booking?.bookingNumber || r.bookingId}
                  </td>
                  <td style={{ padding: '14px 16px', color: C.red, fontWeight: 700 }}>
                    {formatCurrency(r.refundAmount, r.payment?.currency)}
                  </td>
                  <td style={{ padding: '14px 16px', color: C.muted }}>{formatDate(r.processedAt || r.createdAt)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '8px', background: C.redDim, color: C.red, fontWeight: 700, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> {r.refundStatus || 'PROCESSED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateRefundModal
        isOpen={isModalOpen}
        payment={selectedPayment}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleProcessRefundSubmit}
      />
    </div>
  );
}
