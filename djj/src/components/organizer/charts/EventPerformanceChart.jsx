import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { C } from '../../../constants/theme.js';
import { formatCurrency } from '../../../utils/formatters.js';

export const EventPerformanceChart = ({ data = [], loading = false }) => {
  const hasData = data && data.length > 0 && data.some((d) => d.revenue > 0 || d.ticketsSold > 0);

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
          Event Performance Overview
        </h4>
        <span style={{ fontSize: '12px', color: C.muted }}>Revenue By Event</span>
      </div>

      {loading ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
          Loading event performance...
        </div>
      ) : !hasData ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: '14px' }}>
          No event performance data available.
        </div>
      ) : (
        <div style={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis type="number" stroke={C.muted} tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val}`} />
              <YAxis dataKey="name" type="category" stroke={C.muted} tick={{ fontSize: 11 }} width={120} />
              <Tooltip
                contentStyle={{ background: C.bgCard, border: `1px solid ${C.purple}`, borderRadius: '12px', color: C.text }}
                formatter={(val, name) => [name === 'revenue' ? formatCurrency(val) : val, name === 'revenue' ? 'Revenue' : 'Tickets Sold']}
              />
              <Bar dataKey="revenue" fill={C.purple} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
