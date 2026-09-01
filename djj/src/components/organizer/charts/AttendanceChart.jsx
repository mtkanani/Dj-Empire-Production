import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { C } from '../../../constants/theme.js';

export const AttendanceChart = ({ data = [], loading = false }) => {
  const hasData = data && data.length > 0 && data.some((d) => d.value > 0);

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: '20px',
        padding: '24px',
        height: '340px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.gold, fontSize: '16px', margin: 0, fontWeight: 700 }}>
          Check-in & Attendance Status
        </h4>
        <span style={{ fontSize: '12px', color: C.muted }}>Ticket Breakdown</span>
      </div>

      {loading ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
          Loading attendance data...
        </div>
      ) : !hasData ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: '14px' }}>
          No attendance data available yet.
        </div>
      ) : (
        <div style={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || [C.green, C.gold, C.red][index % 3]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px', color: C.text }}
                formatter={(val, name) => [`${val} Tickets`, name]}
              />
              <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ color: C.text, fontSize: '12px' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
