import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { C } from '../../../constants/theme.js';

export const EventStatusChart = ({ data = [], loading = false }) => {
  const defaultData = [
    { name: 'Published', value: 65, color: C.green },
    { name: 'Pending Approval', value: 15, color: C.amber },
    { name: 'Draft', value: 12, color: C.blue },
    { name: 'Cancelled', value: 8, color: C.red },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', height: '320px', display: 'flex', flexDirection: 'column' }}>
      <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.blue, fontSize: '16px', margin: '0 0 16px' }}>
        Event Status Distribution
      </h4>

      {loading ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>Loading event metrics...</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" outerRadius={90} paddingAngle={4} dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid ${C.blue}`, borderRadius: '12px', color: C.text }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
