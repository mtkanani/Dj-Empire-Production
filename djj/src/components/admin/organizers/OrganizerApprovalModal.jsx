import React from 'react';
import { Modal } from '../../common/Modal.jsx';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { C } from '../../../constants/theme.js';

/**
 * OrganizerApprovalModal
 * Props:
 *   isOpen      boolean
 *   onClose     () => void
 *   onConfirm   () => Promise<void>
 *   organizer   { id, companyName, email }
 *   loading     boolean
 */
export function OrganizerApprovalModal({ isOpen, onClose, onConfirm, organizer, loading }) {
  if (!organizer) return null;
  const name = organizer.organizerProfile?.companyName
    || `${organizer.firstName || ''} ${organizer.lastName || ''}`.trim()
    || 'this organizer';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Organizer" maxWidth="460px">
      <div style={{ textAlign: 'center', padding: '8px 0 0' }}>
        {/* Icon */}
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: C.greenDim, border: `1px solid ${C.green}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <CheckCircle2 size={28} color={C.green} />
        </div>

        <h4 style={{ color: C.text, margin: '0 0 10px', fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>
          Approve <span style={{ color: C.gold }}>{name}</span>?
        </h4>
        <p style={{ color: C.muted, fontSize: '13px', lineHeight: '1.7', marginBottom: '28px' }}>
          Approving this organizer will activate their account and allow them to create and publish events on the platform.
          <br />
          An approval confirmation email will be sent automatically.
        </p>

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
              padding: '10px 28px', borderRadius: '10px', border: `1px solid ${C.green}`,
              background: C.greenDim, color: C.green, cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
              opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {loading ? 'Approving...' : <><CheckCircle2 size={16} /> Approve</>}
          </button>
        </div>
      </div>
    </Modal>
  );
}
