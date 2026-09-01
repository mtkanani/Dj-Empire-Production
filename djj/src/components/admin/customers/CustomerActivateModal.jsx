import React from 'react';
import { Modal } from '../../common/Modal.jsx';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { getCustomerDisplayName } from '../../../utils/customerUtils.js';
import { C } from '../../../constants/theme.js';

/**
 * CustomerActivateModal
 * Confirmation before calling PATCH /admin/customers/:id/activate.
 *
 * Props:
 *   isOpen      boolean
 *   onClose     () => void
 *   onConfirm   () => Promise<void>
 *   customer    object
 *   loading     boolean
 */
export function CustomerActivateModal({ isOpen, onClose, onConfirm, customer, loading }) {
  if (!customer) return null;
  const name = getCustomerDisplayName(customer);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reactivate Customer Account" maxWidth="460px">
      <div style={{ textAlign: 'center', padding: '8px 0 0' }}>
        {/* Icon */}
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: C.greenDim,
            border: `1px solid ${C.green}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <RefreshCw size={28} color={C.green} />
        </div>

        <h4 style={{ color: C.text, margin: '0 0 10px', fontSize: '17px', fontFamily: 'Space Grotesk, sans-serif' }}>
          Reactivate <span style={{ color: C.green }}>{name}</span>?
        </h4>
        <p style={{ color: C.muted, fontSize: '13px', lineHeight: '1.7', marginBottom: '26px' }}>
          Reactivating this account will restore access for the customer and allow them to log in and place bookings again.
        </p>

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
              border: `1px solid ${C.green}`,
              background: C.greenDim,
              color: C.green,
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
            {loading ? 'Activating...' : <><CheckCircle2 size={15} /> Reactivate Account</>}
          </button>
        </div>
      </div>
    </Modal>
  );
}
