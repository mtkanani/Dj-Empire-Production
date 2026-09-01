import React from 'react';
import { Calendar, Search, RefreshCw } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { EventCard } from './EventCard.jsx';

export const EventGrid = ({ events = [], loading = false, error = null, onRetry }) => {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', width: '100%' }}>
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: '20px',
              height: '340px',
              animation: 'pulse 1.5s infinite ease-in-out',
            }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '20px', padding: '40px 20px', textAlign: 'center', color: C.red, width: '100%' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>
          Unable to Load Events
        </h3>
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: C.text }}>{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: C.red,
              color: '#FFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} /> Retry Loading
          </button>
        )}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: '20px',
          padding: '60px 20px',
          textAlign: 'center',
          color: C.muted,
          width: '100%',
        }}
      >
        <Search size={40} color={C.gold} style={{ marginBottom: '12px' }} />
        <h3 style={{ color: C.text, margin: '0 0 8px', fontSize: '20px', fontFamily: 'Space Grotesk, sans-serif' }}>
          No Events Found
        </h3>
        <p style={{ margin: 0, fontSize: '14px', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
          We couldn't find any public events matching your search or active filter criteria. Try clearing filters or searching for another keyword.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', width: '100%' }}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};
