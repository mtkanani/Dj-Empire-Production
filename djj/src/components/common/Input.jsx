import React from 'react';
import { C } from '../../constants/theme.js';

export const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  disabled = false,
  required = false,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginBottom: '16px' }}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: 600, color: C.muted, fontFamily: 'Space Grotesk, sans-serif' }}>
          {label} {required && <span style={{ color: C.red }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        {icon && (
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: C.muted }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            padding: icon ? '12px 14px 12px 42px' : '12px 16px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: error ? `1px solid ${C.red}` : `1px solid ${C.border}`,
            borderRadius: '12px',
            color: C.text,
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            fontFamily: 'Poppins, sans-serif',
          }}
          className={`djj-input ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <span style={{ fontSize: '12px', color: C.red }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: '12px', color: C.faint }}>{helperText}</span>
      ) : null}
    </div>
  );
};
