import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up', // "up" | "down"
  subtitle = 'vs last month',
  loading = false,
  error = null,
  onClick,
  accentColor = C.gold,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: '20px',
        padding: '22px',
        boxShadow: `0 10px 30px rgba(0, 0, 0, 0.4)`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="admin-stat-card"
    >
      {/* Top Accent Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: accentColor,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <span style={{ fontSize: '13px', color: C.muted, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>
          {title}
        </span>

        {Icon && (
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${C.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={20} color={accentColor} />
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ fontSize: '20px', color: C.muted, margin: '10px 0' }}>Loading...</div>
      ) : error ? (
        <div style={{ fontSize: '13px', color: C.red, margin: '10px 0' }}>{error}</div>
      ) : (
        <div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: C.text,
              fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: '6px',
            }}
          >
            {value !== undefined && value !== null ? value : 0}
          </div>

          {trend !== undefined && trend !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              {trendDirection === 'up' ? (
                <span style={{ color: C.green, display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                  <TrendingUp size={14} /> +{trend}%
                </span>
              ) : (
                <span style={{ color: C.red, display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                  <TrendingDown size={14} /> -{trend}%
                </span>
              )}
              <span style={{ color: C.faint }}>{subtitle}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
