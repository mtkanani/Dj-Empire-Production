import React from 'react';
import { CalendarDays, Ticket, IndianRupee, Star } from 'lucide-react';
import { C } from '../../../constants/theme.js';

function StatTile({ icon: Icon, label, value, color, bg, border }) {
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${border || C.border}`,
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flex: '1 1 160px',
        minWidth: '150px',
      }}
    >
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px',
        background: bg, border: `1px solid ${border || C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ color, fontSize: '24px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
          {value ?? '—'}
        </div>
        <div style={{ color: C.muted, fontSize: '12px', marginTop: '4px' }}>{label}</div>
      </div>
    </div>
  );
}

/**
 * OrganizerStats
 * Props:
 *   organizer — organizer user object with events array
 */
export function OrganizerStats({ organizer }) {
  const events = organizer?.events || [];

  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === 'Published').length;
  const draftEvents = events.filter((e) => e.status === 'Draft').length;
  const totalCapacity = events.reduce((acc, e) => acc + (e.totalCapacity || e.venue?.capacity || 0), 0);

  return (
    <div>
      <h3 style={{
        color: C.gold, fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '16px', fontWeight: 700, margin: '0 0 16px',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <Star size={16} /> Organizer Statistics
      </h3>
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <StatTile
          icon={CalendarDays}
          label="Total Events"
          value={totalEvents}
          color={C.blue}
          bg={C.blueDim}
          border={C.borderBlue}
        />
        <StatTile
          icon={CalendarDays}
          label="Published Events"
          value={publishedEvents}
          color={C.green}
          bg={C.greenDim}
          border={C.green}
        />
        <StatTile
          icon={CalendarDays}
          label="Draft Events"
          value={draftEvents}
          color={C.amber}
          bg={C.amberDim}
          border={C.amber}
        />
        <StatTile
          icon={Ticket}
          label="Total Capacity"
          value={totalCapacity.toLocaleString('en-IN')}
          color={C.purple}
          bg={C.purpleDim}
          border={C.purple}
        />
      </div>
    </div>
  );
}
