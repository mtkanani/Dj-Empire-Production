import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { C } from '../../constants/theme.js';

export const GateDistributionChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { gateName: 'Main Entrance A', checkIns: 840 },
    { gateName: 'West Gate B', checkIns: 520 },
    { gateName: 'VIP Turnstile', checkIns: 210 },
  ];

  const colors = [C.gold, C.blue, C.green, C.purple || '#8B5CF6'];

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: C.text, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>
          Check-in Volume by Entrance Gate
        </h3>
        <span style={{ fontSize: '11px', color: C.blue, fontWeight: 700, textTransform: 'uppercase' }}>
          Gate Throughput
        </span>
      </div>

      <div style={{ width: '100%', height: '240px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="gateName" stroke={C.muted} fontSize={12} tickLine={false} />
            <YAxis stroke={C.muted} fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#0D111C', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '12px' }}
            />
            <Bar dataKey="checkIns" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
