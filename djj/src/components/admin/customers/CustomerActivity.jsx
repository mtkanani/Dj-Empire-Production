import React from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import { C } from '../../../constants/theme.js';

/**
 * CustomerActivity
 *
 * NOTE: The backend does NOT have a dedicated customer activity / audit log endpoint.
 * Verified routes: GET /admin/customers, GET /admin/customers/:id,
 *                  PATCH suspend, PATCH activate — no activity route exists.
 *
 * This component displays a clear, honest "not available" state rather than inventing data.
 */
export function CustomerActivity() {
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: '16px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '14px',
          background: C.amberDim,
          border: `1px solid ${C.amber}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AlertCircle size={24} color={C.amber} />
      </div>

      <div>
        <h4 style={{ color: C.amber, fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 700, margin: '0 0 6px' }}>
          Activity Log Not Available
        </h4>
        <p style={{ color: C.muted, fontSize: '13px', lineHeight: '1.6', margin: 0, maxWidth: '420px' }}>
          A dedicated customer activity or audit log API is not available in the current backend.
          Customer activity history (logins, bookings, profile changes) will appear here once the backend provides this endpoint.
        </p>
      </div>

      <div style={{
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: '10px',
        padding: '10px 18px',
        fontSize: '12px',
        color: C.faint,
        fontFamily: 'monospace',
      }}>
        Missing: GET /admin/customers/:id/activity
      </div>
    </div>
  );
}
