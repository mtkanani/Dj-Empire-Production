import React from 'react';
import { C } from '../../constants/theme.js';

export const AuthInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  autoComplete,
  icon: Icon,
  ...props
}) => {
  return (
    <div style={{ marginBottom: '18px', width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: C.muted,
            fontFamily: 'Space Grotesk, sans-serif',
          }}
        >
          {label} {required && <span style={{ color: C.red }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        {Icon && (
          <span
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: C.muted,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Icon size={18} />
          </span>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          style={{
            width: '100%',
            padding: Icon ? '12px 14px 12px 42px' : '12px 16px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: error ? `1px solid ${C.red}` : `1px solid ${C.border}`,
            borderRadius: '12px',
            color: C.text,
            fontSize: '14px',
            outline: 'none',
            fontFamily: 'Poppins, sans-serif',
            boxSizing: 'border-box',
            transition: 'all 0.2s ease',
          }}
          {...props}
        />
      </div>

      {error && (
        <span style={{ display: 'block', marginTop: '4px', fontSize: '12px', color: C.red }}>
          {error}
        </span>
      )}
    </div>
  );
};
