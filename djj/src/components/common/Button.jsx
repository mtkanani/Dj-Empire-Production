import React from 'react';
import { C } from '../../constants/theme.js';

export const Button = ({
  children,
  onClick,
  variant = 'primary', // primary (gold), secondary (cyan), outline, danger, ghost
  size = 'md', // sm, md, lg
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          background: `linear-gradient(135deg, ${C.gold} 0%, #D4AF37 100%)`,
          color: '#000000',
          border: 'none',
          boxShadow: `0 4px 15px ${C.goldGlow}`,
          fontWeight: 700,
        };
      case 'secondary':
        return {
          background: `linear-gradient(135deg, ${C.blue} 0%, #00B4D8 100%)`,
          color: '#000000',
          border: 'none',
          boxShadow: `0 4px 15px ${C.blueGlow}`,
          fontWeight: 700,
        };
      case 'outline':
        return {
          background: 'transparent',
          color: C.gold,
          border: `1px solid ${C.gold}`,
          boxShadow: 'none',
        };
      case 'danger':
        return {
          background: `linear-gradient(135deg, ${C.red} 0%, #CC0000 100%)`,
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 4px 15px rgba(255, 42, 82, 0.4)',
        };
      case 'ghost':
        return {
          background: C.panel,
          color: C.text,
          border: `1px solid ${C.border}`,
          boxShadow: 'none',
        };
      default:
        return {};
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 14px', fontSize: '12px' };
      case 'lg':
        return { padding: '14px 28px', fontSize: '16px' };
      case 'md':
      default:
        return { padding: '10px 20px', fontSize: '14px' };
    }
  };

  const baseStyle = {
    borderRadius: '999px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'Space Grotesk, sans-serif',
    letterSpacing: '0.5px',
    ...getVariantStyle(),
    ...getSizeStyle(),
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={baseStyle}
      className={`djj-btn ${className}`}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
      ) : null}
      {children}
    </button>
  );
};
