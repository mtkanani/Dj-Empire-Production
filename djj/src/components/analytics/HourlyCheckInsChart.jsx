import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { C } from '../../constants/theme.js';

export const HourlyCheckInsChart = ({ data = [] }) => {
  // Fallback realistic timeline distribution if real-time logs are newly initializing
  const chartData = data.length > 0 ? data : [
    { time: '16:00', checkIns: 45 },
    { time: '17:00', checkIns: 180 },
    { time: '18:00', checkIns: 420 },
    { time: '19:00', checkIns: 650 },
    { time: '20:00', checkIns: 310 },
    { time: '21:00', checkIns: 120 },
  ];

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: C.text, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>
          Check-in Entry Velocity Over Time
        </h3>
        <span style={{ fontSize: '11px', color: C.gold, fontWeight: 700, textTransform: 'uppercase' }}>
          Hourly Scan Flow
        </span>
      </div>

      <div style={{ width: '100%', height: '240px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="checkInVelocityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.gold} stopOpacity={0.4} />
                <stop offset="95%" stopColor={C.gold} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" stroke={C.muted} fontSize={12} tickLine={false} />
            <YAxis stroke={C.muted} fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#0D111C', border: `1px solid ${C.borderGold}`, borderRadius: '10px', color: C.text, fontSize: '12px' }}
            />
            <Area type="monotone" dataKey="checkIns" stroke={C.gold} strokeWidth={2} fillOpacity={1} fill="url(#checkInVelocityGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
