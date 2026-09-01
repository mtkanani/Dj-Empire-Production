import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { C } from '../../../constants/theme.js';

export const BookingChart = ({ data = [], loading = false }) => {
  const defaultData = [
    { date: 'Aug 01', bookings: 45 },
    { date: 'Aug 03', bookings: 88 },
    { date: 'Aug 05', bookings: 62 },
    { date: 'Aug 07', bookings: 120 },
    { date: 'Aug 09', bookings: 154 },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', height: '320px', display: 'flex', flexDirection: 'column' }}>
      <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.blue, fontSize: '16px', margin: '0 0 16px' }}>
        Ticket Bookings Volume
      </h4>

      {loading ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>Loading booking trends...</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis dataKey="date" stroke={C.muted} tick={{ fontSize: 12 }} />
            <YAxis stroke={C.muted} tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid ${C.blue}`, borderRadius: '12px', color: C.text }} />
            <Bar dataKey="bookings" fill={C.blue} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
