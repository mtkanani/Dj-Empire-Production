import React from 'react';
import { Modal } from '../../common/Modal.jsx';
import { Ban, AlertTriangle } from 'lucide-react';
import { C } from '../../../constants/theme.js';

/**
 * OrganizerSuspendModal
 * Props:
 *   isOpen      boolean
 *   onClose     () => void
 *   onConfirm   () => Promise<void>
 *   organizer   object
 *   loading     boolean
 */
export function OrganizerSuspendModal({ isOpen, onClose, onConfirm, organizer, loading }) {
  if (!organizer) return null;
  const name = organizer.organizerProfile?.companyName
    || `${organizer.firstName || ''} ${organizer.lastName || ''}`.trim()
    || 'this organizer';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Suspend Organizer" maxWidth="460px">
      <div style={{ textAlign: 'center', padding: '8px 0 0' }}>
        {/* Icon */}
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: C.amberDim, border: `1px solid ${C.amber}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Ban size={28} color={C.amber} />
        </div>

        <h4 style={{ color: C.text, margin: '0 0 10px', fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>
          Suspend <span style={{ color: C.amber }}>{name}</span>?
        </h4>

        {/* Warning box */}
        <div style={{
          background: C.amberDim,
          border: `1px solid ${C.amber}`,
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '24px',
          textAlign: 'left',
          display: 'flex',
          gap: '10px',
        }}>
          <AlertTriangle size={18} color={C.amber} style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ color: C.amber, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
            Suspending this account will immediately revoke all active sessions and prevent the organizer from accessing the platform or managing events until reactivated.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: `1px solid ${C.border}`,
              background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: '14px',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '10px 28px', borderRadius: '10px', border: `1px solid ${C.amber}`,
              background: C.amberDim, color: C.amber, cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
              opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {loading ? 'Suspending...' : <><Ban size={15} /> Suspend Account</>}
          </button>
        </div>
      </div>
    </Modal>
  );
}
