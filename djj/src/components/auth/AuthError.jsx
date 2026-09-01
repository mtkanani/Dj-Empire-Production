import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const AuthError = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      style={{
        background: C.redDim,
        border: `1px solid ${C.red}`,
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: C.red,
        fontSize: '13px',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <AlertTriangle size={18} style={{ flexShrink: 0 }} />
      <span style={{ flexGrow: 1 }}>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontWeight: 700 }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
