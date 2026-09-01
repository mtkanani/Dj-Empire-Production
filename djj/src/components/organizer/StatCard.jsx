import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  loading = false,
  error = null,
  accentColor = C.gold,
}) => {
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: '20px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = C.borderGold;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top Row: Title & Icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span
          style={{
            color: C.muted,
            fontSize: '13px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {title}
        </span>

        {Icon && (
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${C.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor,
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      {/* Middle Row: Main Metric Value */}
      {loading ? (
        <div style={{ height: '36px', width: '60%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '8px', margin: '6px 0', animation: 'pulse 1.5s infinite' }} />
      ) : error ? (
        <div style={{ color: C.red, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', margin: '8px 0' }}>
          <AlertCircle size={15} /> Unable to load data
        </div>
      ) : (
        <div
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: C.text,
            fontFamily: 'Space Grotesk, sans-serif',
            margin: '4px 0 8px',
            lineHeight: 1.1,
          }}
        >
          {value !== undefined && value !== null ? value : '0'}
        </div>
      )}

      {/* Bottom Row: Optional Trend or Context Label */}
      {(trend !== undefined || trendLabel) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '4px' }}>
          {trend !== undefined && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600,
                color: trend >= 0 ? C.green : C.red,
              }}
            >
              {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          {trendLabel && <span style={{ color: C.muted }}>{trendLabel}</span>}
        </div>
      )}
    </div>
  );
};
