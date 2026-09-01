import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const PaymentStatusBadge = ({ status = 'Pending' }) => {
  const normalized = String(status).toLowerCase();

  let config = {
    label: 'Pending',
    color: C.amber,
    bgColor: C.amberDim,
    icon: Clock,
  };

  if (normalized === 'paid' || normalized === 'confirmed' || normalized === 'success') {
    config = {
      label: 'Paid & Confirmed',
      color: C.green,
      bgColor: C.greenDim,
      icon: CheckCircle2,
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
  } else if (normalized === 'cancelled') {
    config = {
      label: 'Cancelled',
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
