import React, { useState, useEffect } from 'react';
import { C } from '../../constants/theme.js';

export const OTPCountdown = ({ initialSeconds = 60, onResend, loading = false }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;

    const timerId = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [seconds]);

  const handleResendClick = () => {
    if (seconds > 0 || loading) return;
    onResend();
    setSeconds(initialSeconds);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: C.muted }}>
      {seconds > 0 ? (
        <span>
          Resend OTP code in <strong style={{ color: C.gold }}>{seconds}s</strong>
        </span>
      ) : (
        <button
          type="button"
          onClick={handleResendClick}
          disabled={loading}
          style={{
            background: 'none',
            border: 'none',
            color: C.gold,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            textDecoration: 'underline',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '14px',
          }}
        >
          {loading ? 'Sending OTP...' : 'Resend OTP'}
        </button>
      )}
    </div>
  );
};
