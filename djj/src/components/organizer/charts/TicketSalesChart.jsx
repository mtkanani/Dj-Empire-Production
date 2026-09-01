import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { C } from '../../../constants/theme.js';

export const TicketSalesChart = ({ data = [], loading = false }) => {
  const hasData = data && data.length > 0 && data.some((d) => d.tickets > 0);

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
          Ticket Sales Quantity
        </h4>
        <span style={{ fontSize: '12px', color: C.muted }}>Tickets Issued</span>
      </div>

      {loading ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
          Loading ticket sales data...
        </div>
      ) : !hasData ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: '14px' }}>
          No ticket sales data available for this period.
        </div>
      ) : (
        <div style={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="date" stroke={C.muted} tick={{ fontSize: 12 }} />
              <YAxis stroke={C.muted} tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: C.bgCard, border: `1px solid ${C.green}`, borderRadius: '12px', color: C.text }}
                formatter={(val) => [`${val} Tickets`, 'Sold']}
              />
              <Bar dataKey="tickets" fill={C.green} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
