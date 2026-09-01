import React, { useRef, useEffect } from 'react';
import { C } from '../../constants/theme.js';

export const OTPInput = ({ value = '', onChange, length = 6, disabled = false, error }) => {
  const inputsRef = useRef([]);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    // Focus first empty input on mount
    const firstEmptyIndex = digits.findIndex((d) => !d);
    const focusIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
    if (inputsRef.current[focusIndex]) {
      inputsRef.current[focusIndex].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...digits];
    // Handle single digit input or paste
    if (val.length > 1) {
      const pastedDigits = val.slice(0, length).split('');
      pastedDigits.forEach((digit, i) => {
        newDigits[i] = digit;
      });
      onChange(newDigits.join(''));
      const lastPastedIndex = Math.min(pastedDigits.length - 1, length - 1);
      if (inputsRef.current[lastPastedIndex]) {
        inputsRef.current[lastPastedIndex].focus();
      }
      return;
    }

    newDigits[index] = val.slice(-1);
    onChange(newDigits.join(''));

    // Move to next input box if digit entered
    if (val && index < length - 1 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0 && inputsRef.current[index - 1]) {
        inputsRef.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pastedData)) return;

    const pastedDigits = pastedData.slice(0, length).split('');
    const newDigits = Array.from({ length }, (_, i) => pastedDigits[i] || '');
    onChange(newDigits.join(''));

    const focusIdx = Math.min(pastedDigits.length, length - 1);
    if (inputsRef.current[focusIdx]) {
      inputsRef.current[focusIdx].focus();
    }
  };

  return (
    <div style={{ width: '100%', marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPaste={handlePaste}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={disabled}
            style={{
              width: '46px',
              height: '52px',
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: '700',
              fontFamily: 'Space Grotesk, sans-serif',
              background: 'rgba(255, 255, 255, 0.05)',
              border: error
                ? `1px solid ${C.red}`
                : digit
                ? `1px solid ${C.gold}`
                : `1px solid ${C.border}`,
              borderRadius: '12px',
              color: digit ? C.gold : C.text,
              outline: 'none',
              boxShadow: digit ? `0 0 10px ${C.goldDim}` : 'none',
              transition: 'all 0.2s ease',
            }}
          />
        ))}
      </div>

      {error && (
        <span style={{ display: 'block', textAlign: 'center', marginTop: '8px', fontSize: '13px', color: C.red }}>
          {error}
        </span>
      )}
    </div>
  );
};
