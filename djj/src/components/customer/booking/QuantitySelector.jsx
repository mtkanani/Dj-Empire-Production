import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { C } from '../../../constants/theme.js';

export const QuantitySelector = ({
  value = 0,
  min = 0,
  max = 10,
  onChange,
  disabled = false,
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${C.border}`,
          color: value <= min ? C.muted : C.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: value <= min || disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <Minus size={14} />
      </button>

      <span
        style={{
          minWidth: '24px',
          textAlign: 'center',
          fontWeight: 700,
          color: value > 0 ? C.gold : C.text,
          fontSize: '14px',
          fontFamily: 'Space Grotesk, sans-serif',
        }}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${C.border}`,
          color: value >= max ? C.muted : C.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: value >= max || disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
