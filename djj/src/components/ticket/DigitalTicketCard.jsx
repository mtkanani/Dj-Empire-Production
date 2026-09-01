import React from 'react';
import { Calendar, MapPin, Ticket, Clock, ShieldCheck, Layers } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { QRCodeDisplay } from './QRCodeDisplay.jsx';
import { getPrimarySchedule, formatEventDate, formatEventTimeRange } from '../../utils/eventSchedule.js';
import { buildTicketQrValue, isTicketCheckedIn } from '../../utils/ticketUtils.js';
import { getEventBannerUrl } from '../../utils/eventImage.js';

export const DigitalTicketCard = ({
  event = null,
  booking = null,
  ticket = null,
  qrCodeUrl = null,
  customer = null,
  ticketIndex = 1,
  ticketTotal = 1,
}) => {
  const title = event?.title || 'Event Entry Pass';
  const banner = getEventBannerUrl(
    event,
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80'
  );

  const bookingRef = booking?.bookingNumber || booking?.id || 'BK-REF';
  const ticketCode = ticket?.ticketCode || ticket?.id || 'TCK-REF';
  const passTotal = Math.max(1, ticketTotal || booking?.tickets?.length || 1);
  const passIndex = Math.min(Math.max(1, ticketIndex), passTotal);
  const ticketUsed = isTicketCheckedIn(ticket);
  const qrValue = buildTicketQrValue(booking, ticket, event);
  const customerName = customer?.firstName
    ? `${customer.firstName} ${customer.lastName || ''}`.trim()
    : customer?.name || customer?.fullName || 'Ticket Holder';

  // Derived Section, Ticket Tier, & Quantity info
  const firstItem = booking?.items?.[0] || null;
  const sectionName =
    firstItem?.section?.name ||
    booking?.section?.name ||
    ticket?.section?.name ||
    ticket?.ticketType?.section?.name ||
    'General Admission';

  const ticketTypeName =
    ticket?.ticketType?.name ||
    firstItem?.ticketType?.name ||
    booking?.ticketType?.name ||
    'Standard Entry Tier';

  const bookingItems = booking?.items || [];

  const isArchivedOrDeleted =
    event?.isDeleted ||
    event?.status === 'Archived' ||
    event?.status === 'ARCHIVED' ||
    event?.status === 'Cancelled' ||
    event?.status === 'CANCELLED';

  const primarySchedule = getPrimarySchedule(event);
  const venueName = event?.venue?.name || event?.eventVenue?.venueName || event?.venueName || 'Venue TBA';
  const venueAddress = event?.venue?.address || event?.eventVenue?.address || event?.venueAddress || '';
  const cityName = event?.city?.name || event?.eventVenue?.city || '';

  const seatDisplay = ticket?.seat
    ? `Row ${ticket.seat.row}, Seat ${ticket.seat.seatNumber}`
    : ticket?.seats?.[0]
    ? `Row ${ticket.seats[0].row}, Seat ${ticket.seats[0].seatNumber}`
    : booking?.seats && booking.seats.length > 0
    ? booking.seats.map((s) => `Row ${s.row}, Seat ${s.seatNumber}`).join(', ')
    : 'General Admission / Standing';

  return (
    <div
      style={{
        background: isArchivedOrDeleted
          ? 'linear-gradient(145deg, #141414 0%, #0d0d0d 100%)'
          : 'linear-gradient(145deg, #121624 0%, #0a0d18 100%)',
        border: `1px solid ${isArchivedOrDeleted ? 'rgba(255, 255, 255, 0.15)' : C.borderGold}`,
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: isArchivedOrDeleted
          ? 'none'
          : '0 24px 48px rgba(0, 0, 0, 0.6), 0 0 20px rgba(234, 179, 8, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '85vh',
        filter: isArchivedOrDeleted ? 'grayscale(80%)' : 'none',
        opacity: isArchivedOrDeleted ? 0.75 : 1,
      }}
    >
      {/* Scrollable Body Container */}
      <div
        style={{
          overflowY: 'auto',
          padding: '0',
          scrollbarWidth: 'thin',
          scrollbarColor: `${C.gold} rgba(255,255,255,0.05)`,
        }}
      >
        {/* Banner Header with Ticket Stub Notch */}
        <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
          <img src={banner} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0d18 0%, rgba(10,13,24,0.4) 60%, transparent 100%)' }} />

          {/* Top Pill Badges */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${isArchivedOrDeleted ? '#EF4444' : C.gold}`,
                color: isArchivedOrDeleted ? '#EF4444' : C.gold,
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: 'Space Grotesk, monospace',
                letterSpacing: '0.8px',
              }}
            >
              {isArchivedOrDeleted ? 'INACTIVE PASS' : ticketUsed ? 'CHECKED IN' : 'CONFIRMED PASS'}
            </span>

            {/* Quantity Badge */}
            <span
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                background: C.greenDim,
                border: `1px solid ${C.green}`,
                color: C.green,
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: 'Space Grotesk, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Ticket size={12} /> Pass {passIndex} of {passTotal}
            </span>
          </div>

          {/* Event Title Header */}
          <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: C.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              OFFICIAL ENTRY TICKET
            </span>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: C.text, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.2 }}>
              {title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Key Ticket Info Chips Grid (Section, Tier, Quantity) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            {/* Section Chip */}
            <div style={{ background: 'rgba(234, 179, 8, 0.06)', border: `1px solid ${C.borderGold}`, borderRadius: '14px', padding: '10px 14px' }}>
              <span style={{ color: C.muted, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                Section Zone
              </span>
              <strong style={{ color: C.gold, fontSize: '13px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
                {sectionName}
              </strong>
            </div>

            {/* Ticket Tier Chip */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: `1px solid ${C.border}`, borderRadius: '14px', padding: '10px 14px' }}>
              <span style={{ color: C.muted, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                Ticket Tier
              </span>
              <strong style={{ color: C.text, fontSize: '13px', fontWeight: 700 }}>
                {ticketTypeName}
              </strong>
            </div>

            {/* This Pass Chip */}
            <div style={{ background: 'rgba(34, 197, 94, 0.06)', border: `1px solid rgba(34, 197, 94, 0.3)`, borderRadius: '14px', padding: '10px 14px' }}>
              <span style={{ color: C.muted, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                This Pass
              </span>
              <strong style={{ color: C.green, fontSize: '13px', fontWeight: 800 }}>
                {passIndex} of {passTotal}
              </strong>
            </div>
          </div>

          {/* Itemized Ticket Tiers Breakdown List (if multiple or detailed) */}
          {bookingItems.length > 0 && (
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: C.muted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={13} color={C.gold} /> Purchased Ticket Tiers
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {bookingItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: C.text, fontWeight: 700 }}>{item.ticketType?.name || item.name || ticketTypeName}</span>
                      {item.section?.name && (
                        <span style={{ color: C.gold, fontSize: '10px', padding: '1px 6px', background: 'rgba(234,179,8,0.1)', borderRadius: '6px' }}>
                          {item.section.name}
                        </span>
                      )}
                    </div>
                    <span style={{ color: C.muted, fontWeight: 600 }}>
                      Qty: <strong style={{ color: C.text }}>{item.quantity}</strong> {item.unitPrice ? `(@ ₹${item.unitPrice})` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule & Full Venue Details Box */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color={C.gold} />
                <div>
                  <span style={{ color: C.muted, fontSize: '10px', display: 'block' }}>Date</span>
                  <strong style={{ color: C.text }}>
                    {formatEventDate(primarySchedule)}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color={C.gold} />
                <div>
                  <span style={{ color: C.muted, fontSize: '10px', display: 'block' }}>Gates & Schedule</span>
                  <strong style={{ color: C.text }}>
                    {formatEventTimeRange(primarySchedule)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Venue Location Details */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', borderTop: `1px solid ${C.border}`, paddingTop: '10px', marginTop: '2px' }}>
              <MapPin size={18} color={C.blue} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <span style={{ color: C.muted, fontSize: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                  Venue & City Location
                </span>
                <strong style={{ color: C.text, fontSize: '13px', display: 'block' }}>
                  {venueName}{cityName ? `, ${cityName}` : ''}
                </strong>
                {venueAddress && (
                  <span style={{ color: C.muted, fontSize: '11px', display: 'block', marginTop: '2px' }}>
                    {venueAddress}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Holder & Seat Information */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            <div>
              <span style={{ color: C.muted, fontSize: '10px', display: 'block' }}>Ticket Holder</span>
              <strong style={{ color: C.text }}>{customerName}</strong>
            </div>

            <div>
              <span style={{ color: C.muted, fontSize: '10px', display: 'block' }}>Booking Reference</span>
              <strong style={{ color: C.gold, fontFamily: 'Space Grotesk, monospace' }}>#{bookingRef}</strong>
            </div>

            <div>
              <span style={{ color: C.muted, fontSize: '10px', display: 'block' }}>Email</span>
              <strong style={{ color: C.text }}>{customer?.email || booking?.customer?.email || '—'}</strong>
            </div>

            <div>
              <span style={{ color: C.muted, fontSize: '10px', display: 'block' }}>Mobile</span>
              <strong style={{ color: C.text }}>{customer?.phone || booking?.customer?.phone || '—'}</strong>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: C.muted, fontSize: '10px', display: 'block' }}>Assigned Seats / Space</span>
              <strong style={{ color: C.green, fontFamily: 'Space Grotesk, sans-serif' }}>
                {seatDisplay}
              </strong>
            </div>
          </div>

          {/* QR Code Entrance Display Box */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              background: '#07090e',
              border: `1px solid ${C.borderGold}`,
              borderRadius: '20px',
              padding: '20px',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color={isArchivedOrDeleted ? C.muted : C.gold} />
              <span style={{ fontSize: '11px', color: isArchivedOrDeleted || ticketUsed ? C.muted : C.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {isArchivedOrDeleted ? 'Gate Pass Inactive' : ticketUsed ? 'This Pass Already Checked In' : `Scan Pass ${passIndex} of ${passTotal} at Gate`}
              </span>
            </div>

            <div style={{ opacity: ticketUsed || isArchivedOrDeleted ? 0.45 : 1, filter: ticketUsed ? 'grayscale(80%)' : 'none' }}>
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt={`QR Entry Pass ${passIndex}`} style={{ width: '180px', height: '180px', borderRadius: '12px', background: '#FFF', padding: '10px' }} />
              ) : (
                <QRCodeDisplay value={qrValue} size={180} />
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span style={{ fontSize: '12px', color: C.gold, fontFamily: 'Space Grotesk, monospace', fontWeight: 800, letterSpacing: '0.5px' }}>
                Pass Code: {ticketCode}
              </span>
              <span style={{ fontSize: '10px', color: C.muted, textAlign: 'center' }}>
                {ticketUsed
                  ? 'This unique QR has already been used for entry'
                  : passTotal > 1
                    ? `Each of the ${passTotal} tickets has its own QR. Share this pass with one attendee.`
                    : 'Show this cryptographic QR code at the turnstile gate scanner'}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '11px', color: C.muted, textAlign: 'center', margin: 0 }}>
            Present this pass at the gate. Each QR is unique and can be used once. Organizer: {event?.organizer?.organizerProfile?.companyName || event?.organizer?.firstName || 'Event team'}.
            {event?.policy?.entryPolicy ? ` ${event.policy.entryPolicy}` : ''}
          </p>

        </div>
      </div>
    </div>
  );
};
