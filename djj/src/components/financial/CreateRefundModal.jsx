import React, { useState } from 'react';
import { RotateCcw, X, AlertTriangle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { formatCurrency } from '../../utils/formatters.js';

export const CreateRefundModal = ({ isOpen, payment = null, onClose, onSubmit }) => {
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !payment) return null;

  const maxAmount = Math.max(0, (payment.paidAmount || payment.totalAmount || 0) - (payment.refundAmount || 0));
  const currency = payment.currency || 'INR';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        paymentId: payment.id,
        bookingId: payment.bookingId,
        refundAmount: Number(refundAmount || maxAmount),
        reason: reason.trim() || undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <form onSubmit={handleSubmit} style={{ background: C.bgCard, border: `1px solid ${C.red}`, borderRadius: '24px', padding: '24px', maxWidth: '460px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.red }}>
            <RotateCcw size={20} />
            <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px' }}>
              Process Customer Refund
            </h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '12px', padding: '12px', fontSize: '13px', color: C.red, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} />
          <span>Processing a refund will update booking status and reverse payment allocation.</span>
        </div>

        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>Payment Ref</label>
          <strong style={{ color: C.gold, fontFamily: 'Space Grotesk, monospace', fontSize: '14px' }}>
            #{payment.paymentNumber || payment.id}
          </strong>
        </div>

        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>
            Refund Amount ({currency}) * [Max: {formatCurrency(maxAmount, currency)}]
          </label>
          <input
            type="number"
            required
            step="0.01"
            max={maxAmount}
            placeholder={`Default: ${maxAmount}`}
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>Refund Reason *</label>
          <textarea
            rows={3}
            required
            placeholder="e.g. Event schedule cancellation, duplicate booking..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 16px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.muted, fontSize: '13px', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} style={{ padding: '10px 20px', background: C.red, color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? 'Processing...' : 'Confirm Refund'}
          </button>
        </div>
      </form>
    </div>
  );
};
