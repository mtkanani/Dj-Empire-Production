import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, ArrowRight, Eye } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { formatDate } from '../../utils/formatters.js';

export const UpcomingEvents = ({ events = [], loading = false }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: C.goldDim,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.gold,
            }}
          >
            <Calendar size={18} />
          </div>
          <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.text, fontSize: '16px', margin: 0, fontWeight: 700 }}>
            Upcoming Events
          </h4>
        </div>

        <button
          onClick={() => navigate('/organizer/events')}
          style={{
            background: 'transparent',
            border: 'none',
            color: C.gold,
            fontSize: '13px',
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600,
          }}
        >
          View All <ArrowRight size={14} />
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '30px 0', textAlign: 'center', color: C.muted }}>Loading upcoming events...</div>
      ) : events.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: C.muted }}>
          <p style={{ margin: '0 0 16px', fontSize: '14px' }}>No upcoming events scheduled.</p>
          <button
            onClick={() => navigate('/organizer/events/create')}
            style={{
              padding: '8px 16px',
              background: C.gold,
              color: '#000',
              border: 'none',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Create Event
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {events.map((ev) => {
            let totalRemaining = 0;
            let totalSold = 0;
            if (Array.isArray(ev.ticketTypes)) {
              ev.ticketTypes.forEach((tt) => {
                totalRemaining += tt.quantityAvailable ?? 0;
                totalSold += (tt.quantityTotal || 0) - (tt.quantityAvailable || 0);
              });
            }

            return (
              <div
                key={ev.id}
                style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${C.border}`,
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flexGrow: 1, minWidth: '180px' }}>
                  <h5 style={{ margin: '0 0 6px', color: C.text, fontSize: '14px', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif' }}>
                    {ev.title}
                  </h5>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: C.muted, fontSize: '12px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} color={C.gold} /> {formatDate(ev.startDate) || 'TBA'}
                    </span>
                    {ev.venue?.name && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color={C.blue} /> {ev.venue.name}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: C.muted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Ticket size={13} color={C.green} /> {totalSold} Sold
                    </div>
                    <div style={{ fontSize: '11px', color: C.faint }}>{totalRemaining} Remaining</div>
                  </div>

                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: ev.status === 'PUBLISHED' ? C.greenDim : C.goldDim,
                      color: ev.status === 'PUBLISHED' ? C.green : C.gold,
                      border: `1px solid ${ev.status === 'PUBLISHED' ? C.green : C.gold}`,
                    }}
                  >
                    {ev.status || 'DRAFT'}
                  </span>

                  <button
                    onClick={() => navigate('/organizer/events')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${C.border}`,
                      borderRadius: '8px',
                      color: C.muted,
                      padding: '6px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                    }}
                    title="View details"
                  >
                    <Eye size={14} /> View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
