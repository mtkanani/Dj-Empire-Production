import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { QRCodeDisplay } from './QRCodeDisplay.jsx';
import { buildTicketQrValue, getBookingTickets, isTicketCheckedIn } from '../../utils/ticketUtils.js';

export const TicketQrGrid = ({ booking = null, event = null, size = 140 }) => {
  const tickets = getBookingTickets(booking);

  if (!booking) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: tickets.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
      }}
    >
      {tickets.map((ticket, index) => {
        const used = isTicketCheckedIn(ticket);
        return (
          <div
            key={ticket.id || ticket.ticketCode || index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              background: '#090B10',
              border: `1px solid ${used ? C.border : C.borderGold}`,
              borderRadius: '16px',
              padding: '16px',
              opacity: used ? 0.65 : 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color={used ? C.muted : C.gold} />
              <span
                style={{
                  fontSize: '11px',
                  color: used ? C.muted : C.gold,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}
              >
                Pass {index + 1} of {tickets.length}
                {used ? ' · Used' : ''}
              </span>
            </div>
            <QRCodeDisplay value={buildTicketQrValue(booking, ticket, event)} size={size} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span
                style={{
                  fontSize: '11px',
                  color: C.gold,
                  fontFamily: 'Space Grotesk, monospace',
                  fontWeight: 800,
                  letterSpacing: '0.4px',
                }}
              >
                {ticket.ticketCode || 'ENTRY PASS'}
              </span>
              <span style={{ fontSize: '10px', color: C.muted, textAlign: 'center' }}>
                {used ? 'This pass has already been checked in' : 'Scan this QR at the gate'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
