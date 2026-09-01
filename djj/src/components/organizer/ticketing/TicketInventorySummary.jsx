import React from 'react';
import { Ticket, ShoppingBag, Lock, CheckCircle2, RefreshCw } from 'lucide-react';
import { C } from '../../../constants/theme.js';

export const TicketInventorySummary = ({
  total = 0,
  sold = 0,
  reserved = 0,
  available = 0,
  onRefresh,
  loading = false,
}) => {
  const soldPercentage = total > 0 ? Math.min(100, Math.round((sold / total) * 100)) : 0;
  const availablePercentage = total > 0 ? Math.min(100, Math.round((available / total) * 100)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Card 1: Total */}
        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Capacity
            </span>
            <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: 700, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
              {total.toLocaleString()}
            </h3>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: C.goldDim, color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ticket size={22} />
          </div>
        </div>

        {/* Card 2: Sold */}
        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Sold Tickets
            </span>
            <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: 700, color: C.green, fontFamily: 'Space Grotesk, sans-serif' }}>
              {sold.toLocaleString()}
            </h3>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: C.greenDim, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Card 3: Reserved */}
        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Reserved Locks
            </span>
            <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: 700, color: C.amber, fontFamily: 'Space Grotesk, sans-serif' }}>
              {reserved.toLocaleString()}
            </h3>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: C.amberDim, color: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={22} />
          </div>
        </div>

        {/* Card 4: Available */}
        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Available Stock
            </span>
            <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: 700, color: C.blue, fontFamily: 'Space Grotesk, sans-serif' }}>
              {available.toLocaleString()}
            </h3>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: C.blueDim, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Progress Bar & Refresh Action */}
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ flexGrow: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.muted, marginBottom: '6px' }}>
            <span>Inventory Sales Progress</span>
            <span style={{ fontWeight: 600, color: C.gold }}>{soldPercentage}% Sold ({sold} / {total})</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${soldPercentage}%`, background: C.green, height: '100%', transition: 'width 0.4s ease' }} />
            <div style={{ width: `${total > 0 ? (reserved / total) * 100 : 0}%`, background: C.amber, height: '100%', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: C.goldDim,
              border: `1px solid ${C.borderGold}`,
              borderRadius: '10px',
              color: C.gold,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> {loading ? 'Refreshing...' : 'Refresh Stock'}
          </button>
        )}
      </div>
    </div>
  );
};
