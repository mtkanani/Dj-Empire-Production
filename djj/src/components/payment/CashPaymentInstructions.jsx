import React from 'react';
import { Banknote, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const CashPaymentInstructions = ({ bookingNumber = '' }) => {
  return (
    <div
      style={{
        background: 'rgba(249, 115, 22, 0.05)',
        border: `1px solid ${C.orange}`,
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        fontSize: '13px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: C.orange }}>
        <Banknote size={20} />
        <h4 style={{ margin: 0, fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif' }}>
          Pay Cash at Venue Instructions
        </h4>
      </div>

      <p style={{ margin: 0, color: C.text, lineHeight: 1.5 }}>
        Your tickets are reserved under <strong>Awaiting Cash Payment</strong> status. Please pay cash at the event entrance or organizer ticket booth before entering.
      </p>

      <div style={{ background: C.bgCard, padding: '14px', borderRadius: '12px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>Booking Reference ID</span>
          <strong style={{ color: C.gold, fontFamily: 'Space Grotesk, monospace' }}>#{bookingNumber || 'BK-REF'}</strong>
        </div>
        <span style={{ padding: '4px 10px', borderRadius: '6px', background: C.amberDim, color: C.amber, fontSize: '11px', fontWeight: 700 }}>
          Pending Counter Verification
        </span>
      </div>
    </div>
  );
};
