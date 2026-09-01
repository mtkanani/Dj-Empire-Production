import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { C } from '../../../constants/theme.js';
import { formatCurrency } from '../../../utils/formatters.js';

export const RevenueChart = ({ data = [], loading = false }) => {
  const hasData = data && data.length > 0 && data.some((d) => d.revenue > 0);

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
          Revenue Growth Trend
        </h4>
        <span style={{ fontSize: '12px', color: C.muted }}>Gross Revenue</span>
      </div>

      {loading ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
          Loading revenue data...
        </div>
      ) : !hasData ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: '14px' }}>
          No revenue data available for this period.
        </div>
      ) : (
        <div style={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.gold} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={C.gold} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="date" stroke={C.muted} tick={{ fontSize: 12 }} />
              <YAxis stroke={C.muted} tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
              <Tooltip
                contentStyle={{ background: C.bgCard, border: `1px solid ${C.gold}`, borderRadius: '12px', color: C.text }}
                formatter={(val) => [formatCurrency(val), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke={C.gold} strokeWidth={3} fillOpacity={1} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
