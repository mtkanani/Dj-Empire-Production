import React from 'react';
import { Banknote, CreditCard } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { isCashPendingBooking, paymentViaLabel } from '../../utils/paymentBooking.js';

export const PaymentMethodChip = ({ booking, compact = false }) => {
  const pending = isCashPendingBooking(booking);
  const gateway = String(booking?.paymentGateway || '').toUpperCase();
  const isCash = gateway === 'CASH';
  const Icon = isCash ? Banknote : CreditCard;
  const label = pending ? `${paymentViaLabel(gateway)} · Pending` : paymentViaLabel(gateway);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: compact ? '3px 8px' : '4px 10px',
        borderRadius: '8px',
        background: pending ? C.goldDim : isCash ? 'rgba(249, 115, 22, 0.12)' : C.greenDim,
        color: pending ? C.gold : isCash ? (C.orange || C.gold) : C.green,
        border: `1px solid ${pending ? C.gold : isCash ? (C.orange || C.borderGold) : C.green}`,
        fontSize: compact ? '10px' : '11px',
        fontWeight: 800,
        fontFamily: 'Space Grotesk, sans-serif',
      }}
    >
      <Icon size={compact ? 11 : 13} />
      {label}
    </span>
  );
};
