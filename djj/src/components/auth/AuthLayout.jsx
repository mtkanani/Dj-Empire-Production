import React from 'react';
import { C } from '../../constants/theme.js';

export const AuthLayout = ({ title, subtitle, children, badgeText }) => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: C.bgCard,
          border: `1px solid ${C.borderGold}`,
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px ${C.goldDim}`,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {badgeText && (
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span
              style={{
                background: C.goldDim,
                color: C.gold,
                border: `1px solid ${C.gold}`,
                padding: '4px 14px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
            >
              {badgeText}
            </span>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2
            style={{
              margin: '0 0 8px 0',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '26px',
              fontWeight: 700,
              color: C.text,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ margin: 0, color: C.muted, fontSize: '14px', fontFamily: 'Poppins, sans-serif' }}>
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
};
