import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { C } from '../../../constants/theme.js';

export const UsersChart = ({ data = [], loading = false }) => {
  const defaultData = [
    { date: 'Aug 01', customers: 120, organizers: 12 },
    { date: 'Aug 03', customers: 240, organizers: 18 },
    { date: 'Aug 05', customers: 380, organizers: 25 },
    { date: 'Aug 07', customers: 510, organizers: 32 },
    { date: 'Aug 09', customers: 680, organizers: 45 },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', height: '320px', display: 'flex', flexDirection: 'column' }}>
      <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.green, fontSize: '16px', margin: '0 0 16px' }}>
        User Acquisition Growth
      </h4>

      {loading ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>Loading user metrics...</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis dataKey="date" stroke={C.muted} tick={{ fontSize: 12 }} />
            <YAxis stroke={C.muted} tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid ${C.green}`, borderRadius: '12px', color: C.text }} />
            <Legend />
            <Line type="monotone" dataKey="customers" stroke={C.green} strokeWidth={2} name="Customers" />
            <Line type="monotone" dataKey="organizers" stroke={C.gold} strokeWidth={2} name="Organizers" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
