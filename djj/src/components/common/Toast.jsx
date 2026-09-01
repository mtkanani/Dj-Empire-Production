import React from 'react';
import { C } from '../../constants/theme.js';

export const Toast = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const getTypeStyle = () => {
    switch (type) {
      case 'success':
        return { borderLeft: `4px solid ${C.green}`, background: 'rgba(34, 197, 94, 0.12)', color: C.green };
      case 'error':
        return { borderLeft: `4px solid ${C.red}`, background: 'rgba(255, 42, 82, 0.12)', color: C.red };
      case 'warning':
        return { borderLeft: `4px solid ${C.amber}`, background: 'rgba(255, 184, 0, 0.12)', color: C.amber };
      case 'info':
      default:
        return { borderLeft: `4px solid ${C.blue}`, background: 'rgba(0, 229, 255, 0.12)', color: C.blue };
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 100000,
        padding: '14px 20px',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${C.border}`,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '14px',
        ...getTypeStyle(),
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
