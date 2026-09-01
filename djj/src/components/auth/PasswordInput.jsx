import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const PasswordInput = ({
  label = 'Password',
  name = 'password',
  value,
  onChange,
  placeholder = '••••••••',
  error,
  required = false,
  autoComplete = 'current-password',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

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
          <Lock size={18} />
        </span>

        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          style={{
            width: '100%',
            padding: '12px 42px 12px 42px',
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

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: C.muted,
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && (
        <span style={{ display: 'block', marginTop: '4px', fontSize: '12px', color: C.red }}>
          {error}
        </span>
      )}
    </div>
  );
};
