import React from 'react';
import { Modal } from '../../common/Modal.jsx';
import { Ban, AlertTriangle } from 'lucide-react';
import { getCustomerDisplayName } from '../../../utils/customerUtils.js';
import { C } from '../../../constants/theme.js';

/**
 * CustomerSuspendModal
 * Confirmation before calling PATCH /admin/customers/:id/suspend.
 *
 * Props:
 *   isOpen      boolean
 *   onClose     () => void
 *   onConfirm   () => Promise<void>
 *   customer    object
 *   loading     boolean
 */
export function CustomerSuspendModal({ isOpen, onClose, onConfirm, customer, loading }) {
  if (!customer) return null;
  const name = getCustomerDisplayName(customer);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Suspend Customer Account" maxWidth="460px">
      <div style={{ textAlign: 'center', padding: '8px 0 0' }}>
        {/* Icon */}
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: C.redDim,
            border: `1px solid ${C.red}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
          }}
        >
          <Ban size={28} color={C.red} />
        </div>

        <h4 style={{ color: C.text, margin: '0 0 8px', fontSize: '17px', fontFamily: 'Space Grotesk, sans-serif' }}>
          Suspend <span style={{ color: C.red }}>{name}</span>?
        </h4>

        {/* Warning box */}
        <div
          style={{
            background: C.redDim,
            border: `1px solid ${C.red}`,
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '24px',
            textAlign: 'left',
            display: 'flex',
            gap: '10px',
          }}
        >
          <AlertTriangle size={18} color={C.red} style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ color: C.red, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
            Suspending this account will immediately revoke all active sessions and prevent the customer from logging in until the account is reactivated.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: `1px solid ${C.border}`,
              background: 'transparent',
              color: C.muted,
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '10px 26px',
              borderRadius: '10px',
              border: `1px solid ${C.red}`,
              background: C.redDim,
              color: C.red,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {loading ? 'Suspending...' : <><Ban size={15} /> Suspend Account</>}
          </button>
        </div>
      </div>
    </Modal>
  );
}
