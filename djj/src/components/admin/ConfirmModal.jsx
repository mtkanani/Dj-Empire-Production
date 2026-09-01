import React from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { AlertTriangle } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  variant = 'danger', // "danger" | "primary"
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: C.redDim, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: `1px solid ${C.red}` }}>
          <AlertTriangle size={24} color={C.red} />
        </div>

        <p style={{ color: C.muted, fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>

          <Button variant={variant} loading={loading} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
