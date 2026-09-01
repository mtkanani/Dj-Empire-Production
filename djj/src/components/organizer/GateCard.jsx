import React from 'react';
import { DoorOpen, Edit2, Trash2, Users, Layers, ShieldCheck, Mail } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const GateCard = ({ gate, onEdit, onDelete }) => {
  const name = gate.name || 'Entrance Gate';
  const code = gate.code || 'GATE_01';
  const capacity = gate.capacity || 1000;
  const sections = gate.allowedSections || [];
  const scanners = gate.scanners || [];

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: '20px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: C.blueDim,
              color: C.blue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DoorOpen size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.gold, fontWeight: 700, fontFamily: 'Space Grotesk, monospace' }}>
              Code: {code}
            </span>
            <h3 style={{ margin: '2px 0 0', fontSize: '17px', fontWeight: 700, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
              {name}
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {onEdit && (
            <button
              onClick={() => onEdit(gate)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${C.border}`,
                borderRadius: '8px',
                color: C.text,
                padding: '6px',
                cursor: 'pointer',
              }}
              title="Edit Gate & Credentials"
            >
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(gate)}
              style={{
                background: C.redDim,
                border: `1px solid ${C.red}`,
                borderRadius: '8px',
                color: C.red,
                padding: '6px',
                cursor: 'pointer',
              }}
              title="Delete Gate"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {gate.description && (
        <p style={{ margin: 0, fontSize: '13px', color: C.muted, lineHeight: 1.4 }}>
          {gate.description}
        </p>
      )}

      {/* Meta Row: Capacity & Allowed Sections */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          background: 'rgba(255,255,255,0.02)',
          border: `1px solid ${C.border}`,
          borderRadius: '12px',
          padding: '12px',
          fontSize: '12px',
        }}
      >
        <div>
          <span style={{ color: C.muted, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={12} color={C.gold} /> Capacity Limit
          </span>
          <strong style={{ color: C.text, display: 'block', marginTop: '2px' }}>{capacity.toLocaleString()} guests</strong>
        </div>

        <div>
          <span style={{ color: C.muted, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={12} color={C.blue} /> Allowed Sections
          </span>
          <strong style={{ color: C.text, display: 'block', marginTop: '2px' }}>
            {sections.length > 0 ? `${sections.length} sections` : 'All Sections'}
          </strong>
        </div>
      </div>

      {/* Assigned Scanner Accounts Badge Section */}
      <div
        style={{
          background: 'rgba(234, 179, 8, 0.04)',
          border: `1px dashed ${C.borderGold}`,
          borderRadius: '12px',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: C.gold, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={13} /> Assigned Scanner Staff ({scanners.length})
          </span>
        </div>

        {scanners.length === 0 ? (
          <span style={{ fontSize: '11px', color: C.muted, fontStyle: 'italic' }}>
            No scanner staff credentials assigned yet. Click Edit to create credentials.
          </span>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {scanners.map((sc) => (
              <div key={sc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: C.text, fontWeight: 600 }}>{sc.scannerName || 'Scanner Staff'}</span>
                <span style={{ color: C.muted, fontFamily: 'Space Grotesk, monospace', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Mail size={10} color={C.gold} /> {sc.scannerEmail}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
