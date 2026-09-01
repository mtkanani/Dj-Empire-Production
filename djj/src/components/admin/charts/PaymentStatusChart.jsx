import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { C } from '../../../constants/theme.js';

export const PaymentStatusChart = ({ data = [], loading = false }) => {
  const defaultData = [
    { name: 'Successful', value: 85, color: C.green },
    { name: 'Pending', value: 10, color: C.amber },
    { name: 'Failed / Refunded', value: 5, color: C.red },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', height: '320px', display: 'flex', flexDirection: 'column' }}>
      <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.gold, fontSize: '16px', margin: '0 0 16px' }}>
        Payment Transaction Status Ratio
      </h4>

      {loading ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>Loading payment distribution...</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid ${C.gold}`, borderRadius: '12px', color: C.text }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
