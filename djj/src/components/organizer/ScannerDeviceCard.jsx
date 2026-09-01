import React from 'react';
import { Smartphone, Tablet, Monitor, Key, Trash2, DoorOpen } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const ScannerDeviceCard = ({ device, onDelete }) => {
  const name = device.deviceName || 'Scanner Device';
  const platform = device.platform || 'ANDROID_SCANNER';
  const apiKey = device.apiKey || 'SK-KEY-XXXXXXXX';
  const gateName = device.gate?.name || 'All Gates';

  const getPlatformIcon = () => {
    switch (platform) {
      case 'TABLET':
        return <Tablet size={20} color={C.gold} />;
      case 'WEB_SCANNER':
        return <Monitor size={20} color={C.blue} />;
      default:
        return <Smartphone size={20} color={C.green} />;
    }
  };

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: '20px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getPlatformIcon()}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
              {name}
            </h4>
            <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase' }}>
              {platform.replace('_', ' ')}
            </span>
          </div>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(device)}
            style={{ background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '8px', color: C.red, padding: '6px', cursor: 'pointer' }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.muted }}>
          <DoorOpen size={13} color={C.blue} />
          <span>Assigned Gate: <strong style={{ color: C.text }}>{gateName}</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.muted }}>
          <Key size={13} color={C.gold} />
          <span>API Secret Token: <strong style={{ color: C.gold, fontFamily: 'Space Grotesk, monospace' }}>{apiKey.slice(0, 12)}...</strong></span>
        </div>
      </div>
    </div>
  );
};
