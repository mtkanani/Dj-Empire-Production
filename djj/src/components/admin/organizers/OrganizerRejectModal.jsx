import React, { useState } from 'react';
import { Modal } from '../../common/Modal.jsx';
import { XCircle } from 'lucide-react';
import { C } from '../../../constants/theme.js';

/**
 * OrganizerRejectModal
 * Props:
 *   isOpen      boolean
 *   onClose     () => void
 *   onConfirm   (reason: string) => Promise<void>
 *   organizer   object
 *   loading     boolean
 */
export function OrganizerRejectModal({ isOpen, onClose, onConfirm, organizer, loading }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!organizer) return null;
  const name = organizer.organizerProfile?.companyName
    || `${organizer.firstName || ''} ${organizer.lastName || ''}`.trim()
    || 'this organizer';

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  const handleSubmit = () => {
    if (!reason.trim() || reason.trim().length < 10) {
      setError('Please provide a clear rejection reason (at least 10 characters).');
      return;
    }
    setError('');
    onConfirm(reason.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reject Application" maxWidth="500px">
      <div style={{ padding: '8px 0 0' }}>
        {/* Icon */}
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: C.redDim, border: `1px solid ${C.red}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 18px',
        }}>
          <XCircle size={26} color={C.red} />
        </div>

        <h4 style={{ color: C.text, margin: '0 0 6px', fontSize: '17px', fontFamily: 'Space Grotesk, sans-serif', textAlign: 'center' }}>
          Reject <span style={{ color: C.red }}>{name}</span>?
        </h4>
        <p style={{ color: C.muted, fontSize: '13px', lineHeight: '1.6', marginBottom: '20px', textAlign: 'center' }}>
          Please provide a reason for rejecting this organizer's application. This will be recorded.
        </p>

        {/* Rejection reason textarea */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: C.muted, fontSize: '12px', fontWeight: 600, marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>
            Rejection Reason <span style={{ color: C.red }}>*</span>
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(''); }}
            placeholder="e.g. Missing valid tax clearance documentation, incomplete business registration details..."
            disabled={loading}
            style={{
              width: '100%',
              background: C.panel,
              border: `1px solid ${error ? C.red : C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              padding: '12px 14px',
              fontFamily: 'Space Grotesk, sans-serif',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              lineHeight: '1.6',
            }}
          />
          {error && (
            <p style={{ color: C.red, fontSize: '12px', margin: '6px 0 0' }}>{error}</p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              padding: '10px 22px', borderRadius: '10px', border: `1px solid ${C.border}`,
              background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: '14px',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '10px 26px', borderRadius: '10px', border: `1px solid ${C.red}`,
              background: C.redDim, color: C.red, cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
              opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {loading ? 'Rejecting...' : <><XCircle size={15} /> Reject Application</>}
          </button>
        </div>
      </div>
    </Modal>
  );
}
