import React from 'react';
import { BarChart3 } from 'lucide-react';
import { C } from '../../constants/theme.js';

export default function AnalyticsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: C.text, margin: 0 }}>
          Business & Event Analytics
        </h1>
        <p style={{ color: C.muted, fontSize: '14px', margin: '4px 0 0' }}>
          Deep-dive into sales channels, revenue performance, ticket velocity, and customer metrics.
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
        <BarChart3 size={42} color={C.purple} style={{ marginBottom: '16px' }} />
        <h3 style={{ color: C.text, margin: '0 0 8px', fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>
          Advanced Analytics Module Foundation
        </h3>
        <p style={{ margin: '0 auto', fontSize: '14px', maxWidth: '500px' }}>
          In-depth sales reporting, cohort analytics, and custom export capabilities will be expanded in the Advanced Analytics phase.
        </p>
      </div>
    </div>
  );
}
