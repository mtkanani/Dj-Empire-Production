import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const PaymentStatusBadge = ({ status = 'Pending', gateway = null }) => {
  const normalized = String(status).toLowerCase().replace(/\s+/g, '_');
  const isCash = String(gateway || '').toUpperCase() === 'CASH';

  let config = {
    label: isCash ? 'Pending Cash Verification' : 'Pending',
    color: C.amber || C.gold,
    bgColor: C.amberDim || C.goldDim,
    icon: Clock,
  };

  if (normalized === 'paid' || normalized === 'confirmed' || normalized === 'success' || normalized === 'captured') {
    config = {
      label: isCash ? 'Cash Received' : 'Paid & Confirmed',
      color: C.green,
      bgColor: C.greenDim,
      icon: CheckCircle2,
    };
  } else if (normalized === 'cash_received' || normalized === 'cashreceived') {
    config = {
      label: 'Cash Received',
      color: C.green,
      bgColor: C.greenDim,
      icon: CheckCircle2,
    };
  } else if (normalized === 'awaitingpayment' || normalized === 'awaiting_payment' || normalized === 'pending') {
    config = {
      label: isCash ? 'Pending Cash Verification' : 'Pending',
      color: C.amber || C.gold,
      bgColor: C.amberDim || C.goldDim,
      icon: Clock,
    };
  } else if (normalized === 'authorized') {
    config = {
      label: 'Authorized',
      color: C.blue,
      bgColor: C.blueDim,
      icon: CheckCircle2,
    };
  } else if (normalized === 'failed') {
    config = {
      label: 'Payment Failed',
      color: C.red,
      bgColor: C.redDim,
      icon: XCircle,
    };
  } else if (normalized === 'cancelled' || normalized === 'expired') {
    config = {
      label: normalized === 'expired' ? 'Expired' : 'Cancelled',
      color: C.muted,
      bgColor: 'rgba(255,255,255,0.04)',
      icon: AlertTriangle,
    };
  } else if (normalized === 'refunded' || normalized === 'partiallyrefunded') {
    config = {
      label: normalized === 'partiallyrefunded' ? 'Partially Refunded' : 'Refunded',
      color: C.purple,
      bgColor: C.purpleDim,
      icon: RefreshCw,
    };
  }

  const Icon = config.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '8px',
        background: config.bgColor,
        color: config.color,
        fontSize: '12px',
        fontWeight: 700,
        fontFamily: 'Space Grotesk, sans-serif',
      }}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
};
