import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, Ban } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const ScanResultBreakdown = ({ results = {} }) => {
  const items = [
    { label: 'Successful Entries', count: results.SUCCESS || results.success || 0, icon: CheckCircle2, color: C.green, bg: C.greenDim },
    { label: 'Duplicate / Already Used', count: results.DUPLICATE_SCAN || 0, icon: AlertTriangle, color: C.gold, bg: C.goldDim },
    { label: 'Invalid / Tampered QR', count: results.INVALID_SIGNATURE || 0, icon: ShieldAlert, color: C.red, bg: C.redDim },
    { label: 'Cancelled / Refunded', count: results.CANCELLED_BOOKING || 0, icon: Ban, color: C.red, bg: C.redDim },
    { label: 'Section Permission Mismatch', count: results.WRONG_SECTION || 0, icon: XCircle, color: C.purple || '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' },
  ];

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ margin: 0, fontSize: '16px', color: C.text, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>
        Scan Result Outcome Breakdown
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              style={{
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} />
                </div>
                <span style={{ fontSize: '13px', color: C.text, fontWeight: 500 }}>{item.label}</span>
              </div>

              <strong style={{ fontSize: '15px', color: item.color, fontFamily: 'Space Grotesk, monospace' }}>
                {item.count.toLocaleString()}
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
};
