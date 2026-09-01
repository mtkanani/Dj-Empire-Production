import React from 'react';
import { Ticket } from 'lucide-react';
import { C } from '../../constants/theme.js';

export default function TicketingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: C.text, margin: 0 }}>
          Ticketing Management
        </h1>
        <p style={{ color: C.muted, fontSize: '14px', margin: '4px 0 0' }}>
          Configure ticket types, pricing tiers, capacity rules, and early bird passes.
        </p>
      </div>

      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: '20px',
          padding: '60px 20px',
          textAlign: 'center',
          color: C.muted,
        }}
      >
        <Ticket size={42} color={C.purple} style={{ marginBottom: '16px' }} />
        <h3 style={{ color: C.text, margin: '0 0 8px', fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>
          Ticketing Module Foundation
        </h3>
        <p style={{ margin: '0 auto', fontSize: '14px', maxWidth: '500px' }}>
          Detailed ticket configuration (VIP, General Admission, Early Bird pricing, and Inventory capacity control) will be implemented in the dedicated Ticketing Phase.
        </p>
      </div>
    </div>
  );
}
