import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { C } from '../../../../constants/theme.js';

export const EventPoliciesStep = ({ data = {}, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, color: C.gold, fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>
        Step 4 — Event Policies & Guidelines
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
            Refund Policy
          </label>
          <textarea
            rows={3}
            value={data.refundPolicy || ''}
            onChange={(e) => onChange({ refundPolicy: e.target.value })}
            placeholder="e.g. Non-refundable except if event is cancelled."
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
            Cancellation Policy
          </label>
          <textarea
            rows={3}
            value={data.cancellationPolicy || ''}
            onChange={(e) => onChange({ cancellationPolicy: e.target.value })}
            placeholder="Cancellation terms and deadlines..."
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
            Entry Policy & Security Guidelines
          </label>
          <textarea
            rows={3}
            value={data.entryPolicy || ''}
            onChange={(e) => onChange({ entryPolicy: e.target.value })}
            placeholder="e.g. Physical or digital QR ticket required for entry."
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
            Camera & Media Policy
          </label>
          <textarea
            rows={3}
            value={data.cameraPolicy || ''}
            onChange={(e) => onChange({ cameraPolicy: e.target.value })}
            placeholder="e.g. Professional DSLR cameras not allowed without press pass."
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      <div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '13px',
            color: C.text,
            width: 'fit-content',
          }}
        >
          <input
            type="checkbox"
            checked={data.idProofRequired ?? true}
            onChange={(e) => onChange({ idProofRequired: e.target.checked })}
            style={{ accentColor: C.gold, width: '16px', height: '16px' }}
          />
          Mandatory Government-issued ID Proof Required at Entry
        </label>
      </div>
    </div>
  );
};
