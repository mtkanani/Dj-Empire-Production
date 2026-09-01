import React, { useEffect } from 'react';
import { C } from '../../constants/theme.js';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '550px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.borderGold}`,
          borderRadius: '24px',
          width: '100%',
          maxWidth: maxWidth,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px ${C.goldDim}`,
          padding: '28px',
          position: 'relative',
          color: C.text,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: `1px solid ${C.border}`, paddingBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontFamily: 'Space Grotesk, sans-serif', color: C.gold }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              color: C.muted,
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
