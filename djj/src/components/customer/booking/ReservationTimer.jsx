import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { C } from '../../../constants/theme.js';

export const ReservationTimer = ({ expiresAt = null, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;

    const expiryTime = new Date(expiresAt).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(difference);

      if (difference <= 0 && onExpire) {
        onExpire();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (!expiresAt) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isExpiringSoon = timeLeft < 180; // Less than 3 mins

  return (
    <div
      style={{
        background: isExpiringSoon ? C.redDim : C.amberDim,
        border: `1px solid ${isExpiringSoon ? C.red : C.amber}`,
        borderRadius: '14px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: isExpiringSoon ? C.red : C.amber,
        fontSize: '13px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={16} />
        <span style={{ fontWeight: 600 }}>Ticket Lock Expiration</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'Space Grotesk, monospace' }}>
          {timeLeft > 0 ? formattedTime : 'EXPIRED'}
        </span>
      </div>
    </div>
  );
};
