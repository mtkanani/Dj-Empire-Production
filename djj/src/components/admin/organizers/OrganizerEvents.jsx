import React from 'react';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { C } from '../../../constants/theme.js';

const STATUS_COLORS = {
  Published: { color: C.green, bg: C.greenDim, border: C.green },
  Draft: { color: C.gold, bg: C.goldDim, border: C.gold },
  PendingApproval: { color: C.amber, bg: C.amberDim, border: C.amber },
  Approved: { color: C.blue, bg: C.blueDim, border: C.borderBlue },
  Rejected: { color: C.red, bg: C.redDim, border: C.red },
  Unpublished: { color: C.purple, bg: C.purpleDim, border: C.purple },
  Cancelled: { color: C.red, bg: C.redDim, border: C.red },
  Completed: { color: C.blue, bg: C.blueDim, border: C.borderBlue },
  Archived: { color: C.faint, bg: 'rgba(102,102,102,0.12)', border: C.faint },
};

/**
 * OrganizerEvents
 * Props:
 *   events — array of event objects (from organizer.events)
 */
export function OrganizerEvents({ events = [] }) {
  if (events.length === 0) {
    return (
      <div style={{
        background: C.bgCard, border: `1px solid ${C.border}`,
        borderRadius: '16px', padding: '40px', textAlign: 'center',
      }}>
        <CalendarDays size={40} color={C.faint} style={{ marginBottom: '12px' }} />
        <p style={{ color: C.muted, fontSize: '14px', margin: 0 }}>This organizer has no events yet.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: '16px', border: `1px solid ${C.border}`, background: C.panel }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Space Grotesk, sans-serif', minWidth: '720px' }}>
        <thead>
          <tr style={{ background: 'rgba(255,215,0,0.06)', borderBottom: `1px solid ${C.borderGold}` }}>
            {['Event Title', 'Date', 'Venue / Location', 'Capacity', 'Status'].map((h) => (
              <th key={h} style={{ padding: '12px 16px', color: C.gold, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', textAlign: 'left' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {events.map((ev, idx) => {
            const sc = STATUS_COLORS[ev.status] || { color: C.muted, bg: C.panel, border: C.border };
            const start = ev.startDate || ev.date || ev.schedules?.[0]?.startDate;
            const eventDate = start
              ? new Date(start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—';

            return (
              <tr
                key={ev.id || idx}
                style={{
                  borderBottom: idx === events.length - 1 ? 'none' : `1px solid ${C.border}`,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
              >
                {/* Title */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ color: C.text, fontWeight: 600, fontSize: '13px' }}>{ev.title || '—'}</div>
                  {ev.category?.name && (
                    <div style={{ color: C.faint, fontSize: '11px', marginTop: '2px' }}>{ev.category.name}</div>
                  )}
                </td>
                {/* Date */}
                <td style={{ padding: '12px 16px', color: C.muted, fontSize: '12px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CalendarDays size={12} color={C.faint} />
                    {eventDate}
                  </div>
                </td>
                {/* Venue */}
                <td style={{ padding: '12px 16px', color: C.muted, fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={12} color={C.faint} />
                    {ev.venue?.name || ev.venueName || ev.location || '—'}
                  </div>
                </td>
                {/* Capacity */}
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                    <Users size={12} color={C.faint} />
                    <span style={{ color: C.text, fontSize: '13px', fontWeight: 600 }}>
                      {ev.totalCapacity?.toLocaleString('en-IN') || ev.venue?.capacity?.toLocaleString('en-IN') || '—'}
                    </span>
                  </div>
                </td>
                {/* Status */}
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                    background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color,
                    whiteSpace: 'nowrap',
                  }}>
                    {ev.status || '—'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
