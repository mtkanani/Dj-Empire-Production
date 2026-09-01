import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { C } from '../../../constants/theme.js';

export const EventsChart = ({ data = [], loading = false }) => {
  const defaultData = [
    { date: 'Aug 01', published: 4, pending: 2 },
    { date: 'Aug 03', published: 8, pending: 3 },
    { date: 'Aug 05', published: 12, pending: 1 },
    { date: 'Aug 07', published: 15, pending: 4 },
    { date: 'Aug 09', published: 22, pending: 5 },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', height: '320px', display: 'flex', flexDirection: 'column' }}>
      <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.purple, fontSize: '16px', margin: '0 0 16px' }}>
        Event Creation & Publishing Activity
      </h4>

      {loading ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>Loading event statistics...</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis dataKey="date" stroke={C.muted} tick={{ fontSize: 12 }} />
            <YAxis stroke={C.muted} tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid ${C.purple}`, borderRadius: '12px', color: C.text }} />
            <Legend />
            <Bar dataKey="published" fill={C.purple} name="Published" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" fill={C.amber} name="Pending Approval" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
