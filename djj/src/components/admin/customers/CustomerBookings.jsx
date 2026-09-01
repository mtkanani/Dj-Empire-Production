import React from 'react';
import { Ticket, CalendarDays, MapPin } from 'lucide-react';
import { getBookingStatusConfig, formatCustomerDate, formatCustomerAmount } from '../../../utils/customerUtils.js';
import { C } from '../../../constants/theme.js';

/**
 * CustomerBookings
 *
 * Displays booking history from the bookings[] array included in GET /admin/customers/:id.
 * Backend includes for each booking:
 *   - id, totalAmount, status, createdAt
 *   - event: { id, title, startDate, venue: { name }, city: { name } }
 *   - tickets[]: { id, ticketCode, status, ticketType: { name, price } }
 *
 * Props:
 *   bookings — array of booking objects
 */
export function CustomerBookings({ bookings = [] }) {
  if (bookings.length === 0) {
    return (
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <Ticket size={40} color={C.faint} style={{ marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
        <p style={{ color: C.muted, fontSize: '14px', margin: 0 }}>No booking history found for this customer.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: '16px', border: `1px solid ${C.border}`, background: C.panel }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Space Grotesk, sans-serif', minWidth: '760px' }}>
        <thead>
          <tr style={{ background: 'rgba(255, 215, 0, 0.05)', borderBottom: `1px solid ${C.borderGold}` }}>
            {['Booking ID', 'Event', 'Event Date', 'Tickets', 'Amount', 'Status', 'Booked On'].map((h) => (
              <th
                key={h}
                style={{
                  padding: '12px 16px',
                  color: C.gold,
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.7px',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, idx) => {
            const sc = getBookingStatusConfig(booking.status);
            const event = booking.event || {};
            const eventDate = event.startDate ? formatCustomerDate(event.startDate) : '—';
            const venueName = event.venue?.name || event.city?.name || '—';
            const ticketCount = booking.tickets?.length ?? '—';
            const bookedOn = formatCustomerDate(booking.createdAt);

            return (
              <tr
                key={booking.id || idx}
                style={{
                  borderBottom: idx === bookings.length - 1 ? 'none' : `1px solid ${C.border}`,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
              >
                {/* Booking ID */}
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: C.blue, fontSize: '12px', fontFamily: 'monospace' }}>
                    #{booking.id?.slice(-8) || '—'}
                  </span>
                </td>

                {/* Event */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ color: C.text, fontWeight: 600, fontSize: '13px' }}>
                    {event.title || '—'}
                  </div>
                  <div style={{ color: C.faint, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                    <MapPin size={10} />
                    {venueName}
                  </div>
                </td>

                {/* Event Date */}
                <td style={{ padding: '12px 16px', color: C.muted, fontSize: '12px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CalendarDays size={12} color={C.faint} />
                    {eventDate}
                  </div>
                </td>

                {/* Ticket count */}
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{ color: C.text, fontWeight: 600 }}>{ticketCount}</span>
                </td>

                {/* Amount */}
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <span style={{ color: C.gold, fontWeight: 600 }}>
                    {formatCustomerAmount(booking.totalAmount)}
                  </span>
                </td>

                {/* Booking Status */}
                <td style={{ padding: '12px 16px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: sc.bg,
                      border: `1px solid ${sc.border}`,
                      color: sc.color,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {sc.label}
                  </span>
                </td>

                {/* Booked on */}
                <td style={{ padding: '12px 16px', color: C.faint, fontSize: '12px', whiteSpace: 'nowrap' }}>
                  {bookedOn}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
