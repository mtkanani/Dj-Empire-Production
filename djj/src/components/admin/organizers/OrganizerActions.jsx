import React from 'react';
import { Eye, CheckCircle2, XCircle, Ban, RefreshCw } from 'lucide-react';
import { Button } from '../../common/Button.jsx';
import { C } from '../../../constants/theme.js';

/**
 * Status-aware action buttons for a single organizer row.
 * Props:
 *   organizer — the organizer object
 *   onView   — callback(organizer)
 *   onApprove — callback(organizer)
 *   onReject  — callback(organizer)
 *   onSuspend — callback(organizer)
 *   onActivate — callback(organizer) [for SUSPENDED]
 *   loading   — boolean (disable buttons while processing)
 */
export function OrganizerActions({
  organizer,
  onView,
  onApprove,
  onReject,
  onSuspend,
  onActivate,
  loading = false,
}) {
  const { status } = organizer;

  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {/* View is always available */}
      <button
        title="View Details"
        disabled={loading}
        onClick={() => onView?.(organizer)}
        style={{
          background: C.blueDim,
          border: `1px solid ${C.borderBlue}`,
          borderRadius: '8px',
          color: C.blue,
          padding: '5px 10px',
          fontSize: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 600,
          transition: 'opacity 0.2s',
        }}
      >
        <Eye size={12} /> View
      </button>

      {/* PENDING_APPROVAL  → Approve + Reject */}
      {status === 'PENDING_APPROVAL' && (
        <>
          <button
            title="Approve Organizer"
            disabled={loading}
            onClick={() => onApprove?.(organizer)}
            style={{
              background: C.greenDim,
              border: `1px solid ${C.green}`,
              borderRadius: '8px',
              color: C.green,
              padding: '5px 10px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={12} /> Approve
          </button>
          <button
            title="Reject Application"
            disabled={loading}
            onClick={() => onReject?.(organizer)}
            style={{
              background: C.redDim,
              border: `1px solid ${C.red}`,
              borderRadius: '8px',
              color: C.red,
              padding: '5px 10px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
            }}
          >
            <XCircle size={12} /> Reject
          </button>
        </>
      )}

      {/* ACTIVE → Suspend */}
      {status === 'ACTIVE' && (
        <button
          title="Suspend Account"
          disabled={loading}
          onClick={() => onSuspend?.(organizer)}
          style={{
            background: C.amberDim,
            border: `1px solid ${C.amber}`,
            borderRadius: '8px',
            color: C.amber,
            padding: '5px 10px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 600,
          }}
        >
          <Ban size={12} /> Suspend
        </button>
      )}

      {/* SUSPENDED → Re-Activate (Approve) */}
      {status === 'SUSPENDED' && (
        <button
          title="Re-Activate Account"
          disabled={loading}
          onClick={() => onActivate?.(organizer)}
          style={{
            background: C.greenDim,
            border: `1px solid ${C.green}`,
            borderRadius: '8px',
            color: C.green,
            padding: '5px 10px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 600,
          }}
        >
          <RefreshCw size={12} /> Reactivate
        </button>
      )}
    </div>
  );
}
