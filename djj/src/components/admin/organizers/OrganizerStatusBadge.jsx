import React from 'react';
import { C } from '../../../constants/theme.js';
import { CheckCircle2, Clock, Ban, XCircle, Mail } from 'lucide-react';

const STATUS_CONFIG = {
  ACTIVE: {
    label: 'Active',
    color: C.green,
    bg: C.greenDim,
    border: C.green,
    Icon: CheckCircle2,
  },
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    color: C.amber,
    bg: C.amberDim,
    border: C.amber,
    Icon: Clock,
  },
  PENDING_EMAIL_VERIFICATION: {
    label: 'Pending Email',
    color: C.blue,
    bg: C.blueDim,
    border: C.blue,
    Icon: Mail,
  },
  SUSPENDED: {
    label: 'Suspended',
    color: C.red,
    bg: C.redDim,
    border: C.red,
    Icon: Ban,
  },
  REJECTED: {
    label: 'Rejected',
    color: C.faint,
    bg: 'rgba(102,102,102,0.12)',
    border: C.faint,
    Icon: XCircle,
  },
};

export function OrganizerStatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    color: C.muted,
    bg: 'rgba(160,160,160,0.1)',
    border: C.muted,
    Icon: null,
  };

  const { label, color, bg, border, Icon } = cfg;
  const iconSize = size === 'lg' ? 14 : 11;
  const fontSize = size === 'lg' ? '13px' : '11px';
  const padding = size === 'lg' ? '6px 14px' : '4px 10px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding,
        borderRadius: '999px',
        fontSize,
        fontWeight: 700,
        fontFamily: 'Space Grotesk, sans-serif',
        background: bg,
        color,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {Icon && <Icon size={iconSize} />}
      {label}
    </span>
  );
}
