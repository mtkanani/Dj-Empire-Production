import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { C } from '../../../constants/theme.js';

export const SalesChart = ({ data = [], loading = false }) => {
  const hasData = data && data.length > 0 && data.some((d) => d.sales > 0);

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
          Daily Sales Count
        </h4>
        <span style={{ fontSize: '12px', color: C.muted }}>Confirmed Transactions</span>
      </div>

      {loading ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
          Loading sales data...
        </div>
      ) : !hasData ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: '14px' }}>
          No sales data available for this period.
        </div>
      ) : (
        <div style={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.blue} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="date" stroke={C.muted} tick={{ fontSize: 12 }} />
              <YAxis stroke={C.muted} tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: C.bgCard, border: `1px solid ${C.blue}`, borderRadius: '12px', color: C.text }}
                formatter={(val) => [`${val} Sales`, 'Transactions']}
              />
              <Area type="monotone" dataKey="sales" stroke={C.blue} strokeWidth={3} fillOpacity={1} fill="url(#salesGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
