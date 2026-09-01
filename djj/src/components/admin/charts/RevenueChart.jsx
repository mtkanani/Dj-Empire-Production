import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { C } from '../../../constants/theme.js';

export const RevenueChart = ({ data = [], loading = false }) => {
  const defaultData = [
    { date: 'Aug 01', revenue: 12000 },
    { date: 'Aug 03', revenue: 24500 },
    { date: 'Aug 05', revenue: 18900 },
    { date: 'Aug 07', revenue: 38000 },
    { date: 'Aug 09', revenue: 52450 },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', height: '320px', display: 'flex', flexDirection: 'column' }}>
      <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.gold, fontSize: '16px', margin: '0 0 16px' }}>
        Revenue Growth Trend (₹)
      </h4>

      {loading ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>Loading revenue data...</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis dataKey="date" stroke={C.muted} tick={{ fontSize: 12 }} />
            <YAxis stroke={C.muted} tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid ${C.gold}`, borderRadius: '12px', color: C.text }} />
            <Line type="monotone" dataKey="revenue" stroke={C.gold} strokeWidth={3} dot={{ fill: C.gold, r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
