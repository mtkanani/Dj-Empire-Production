import React from 'react';
import { C } from '../../constants/theme.js';

export const Loading = ({ fullScreen = false, text = 'Loading...' }) => {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '40px' }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: `3px solid ${C.border}`,
          borderTopColor: C.gold,
          borderRightColor: C.blue,
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span style={{ color: C.gold, fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1px' }}>
        {text}
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99999,
          background: C.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};
