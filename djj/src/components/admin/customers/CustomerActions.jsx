import React from 'react';
import { Eye, Ban, RefreshCw } from 'lucide-react';
import { getCustomerActions } from '../../../utils/customerUtils.js';
import { C } from '../../../constants/theme.js';

const actionBtn = (bg, border, color) => ({
  background: bg,
  border: `1px solid ${border}`,
  borderRadius: '8px',
  color,
  padding: '5px 10px',
  fontSize: '12px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontFamily: 'Space Grotesk, sans-serif',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  transition: 'opacity 0.2s',
});

/**
 * CustomerActions — status-aware action buttons for a customer row.
 * Actions are derived from getCustomerActions() which inspects real backend capabilities.
 *
 * Props:
 *   customer      object
 *   onView        callback(customer)
 *   onSuspend     callback(customer)
 *   onActivate    callback(customer)
 *   loading       boolean — disables all buttons while API is in flight
 */
export function CustomerActions({ customer, onView, onSuspend, onActivate, loading = false }) {
  const { status } = customer;
  const { canView, canSuspend, canActivate } = getCustomerActions(status);

  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {/* View — always available */}
      {canView && (
        <button
          title="View Customer Details"
          disabled={loading}
          onClick={() => onView?.(customer)}
          style={actionBtn(C.blueDim, C.borderBlue, C.blue)}
        >
          <Eye size={12} /> View
        </button>
      )}

      {/* Suspend — ACTIVE only */}
      {canSuspend && (
        <button
          title="Suspend Customer Account"
          disabled={loading}
          onClick={() => onSuspend?.(customer)}
          style={actionBtn(C.redDim, C.red, C.red)}
        >
          <Ban size={12} /> Suspend
        </button>
      )}

      {/* Activate — SUSPENDED only */}
      {canActivate && (
        <button
          title="Reactivate Customer Account"
          disabled={loading}
          onClick={() => onActivate?.(customer)}
          style={actionBtn(C.greenDim, C.green, C.green)}
        >
          <RefreshCw size={12} /> Activate
        </button>
      )}
    </div>
  );
}
