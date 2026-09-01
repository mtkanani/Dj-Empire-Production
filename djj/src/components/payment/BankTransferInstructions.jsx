import React from 'react';
import { Building2, Copy, ShieldAlert } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const BankTransferInstructions = ({ bookingNumber = '', amount = 0, currency = 'INR' }) => {
  return (
    <div
      style={{
        background: 'rgba(16, 185, 129, 0.05)',
        border: `1px solid ${C.green}`,
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        fontSize: '13px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: C.green }}>
        <Building2 size={20} />
        <h4 style={{ margin: 0, fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif' }}>
          Bank Transfer Instructions
        </h4>
      </div>

      <p style={{ margin: 0, color: C.text, lineHeight: 1.5 }}>
        Please initiate a direct wire transfer (NEFT / RTGS / IMPS) using the official event organizer bank account details below. Include your Booking Reference in the transfer remarks.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: C.bgCard, padding: '14px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
        <div>
          <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>Account Holder</span>
          <strong style={{ color: C.text }}>EventPass SaaS Pvt Ltd</strong>
        </div>
        <div>
          <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>Bank Name</span>
          <strong style={{ color: C.text }}>HDFC Bank Ltd</strong>
        </div>
        <div>
          <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>Account Number</span>
          <strong style={{ color: C.gold, fontFamily: 'Space Grotesk, monospace' }}>50200012345678</strong>
        </div>
        <div>
          <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>IFSC / SWIFT Code</span>
          <strong style={{ color: C.text, fontFamily: 'Space Grotesk, monospace' }}>HDFC0001234</strong>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.amber, fontSize: '12px' }}>
        <ShieldAlert size={16} />
        <span>Use Booking Ref: <strong>#{bookingNumber || 'BK-REF'}</strong> as transfer reference</span>
      </div>
    </div>
  );
};
