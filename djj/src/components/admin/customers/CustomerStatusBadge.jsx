import React from 'react';
import { CUSTOMER_STATUS_CONFIG } from '../../../utils/customerUtils.js';
import { C } from '../../../constants/theme.js';

/**
 * CustomerStatusBadge
 * Props:
 *   status  string — exact UserStatus enum value from backend
 *   size    'sm' | 'lg'
 */
export function CustomerStatusBadge({ status, size = 'sm' }) {
  const cfg = CUSTOMER_STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    color: C.muted,
    bg: 'rgba(160,160,160,0.1)',
    border: C.muted,
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'lg' ? '6px 14px' : '4px 10px',
        borderRadius: '999px',
        fontSize: size === 'lg' ? '13px' : '11px',
        fontWeight: 700,
        fontFamily: 'Space Grotesk, sans-serif',
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}
