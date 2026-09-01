import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, MapPin, QrCode, Clock, ShieldCheck, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { customerBookingService } from '../../services/customer/customerBookingService.js';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar.jsx';
import { CustomerFooter } from '../../components/customer/CustomerFooter.jsx';
import { DigitalTicketCard } from '../../components/ticket/DigitalTicketCard.jsx';
import { TicketActions } from '../../components/ticket/TicketActions.jsx';
import { getBookingTickets } from '../../utils/ticketUtils.js';
import { getEventBannerUrl } from '../../utils/eventImage.js';
import { getPrimarySchedule, formatEventDate, formatEventTimeRange } from '../../utils/eventSchedule.js';

export default function MyTicketsPage() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedTicketIndex, setSelectedTicketIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await customerBookingService.getMyBookings({ limit: 100 });
        const resData = res.data || res;
        const list = Array.isArray(resData) ? resData : resData.bookings || [];
        setBookings(list);
      } catch (err) {
        setError(err.message || 'Unable to load your digital tickets.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
      <CustomerNavbar />

      <main style={{ flexGrow: 1, maxWidth: '1140px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Header Title Bar */}
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 800, margin: 0, color: C.text, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Ticket size={28} color={C.gold} /> My Digital Entry Passes
          </h1>
          <p style={{ margin: '6px 0 0', color: C.muted, fontSize: '14px' }}>
            Access your active event entry passes, gate check-in status, and cryptographic entrance QR codes
          </p>
        </div>

        {/* Modal / Preview of Selected Digital Ticket Pass */}
        {selectedBooking && (() => {
          const tickets = getBookingTickets(selectedBooking);
          const currentTicket = tickets[selectedTicketIndex] || tickets[0];
          const canPrev = selectedTicketIndex > 0;
          const canNext = selectedTicketIndex < tickets.length - 1;

          return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '108px 20px 40px',
              overflowY: 'auto',
            }}
            onClick={() => setSelectedBooking(null)}
          >
            <div
              style={{ maxWidth: '520px', width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '12px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Modal Close Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: C.gold, fontSize: '13px', fontWeight: 800, fontFamily: 'Space Grotesk, monospace', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} /> QR Entrance Pass {tickets.length > 1 ? `${selectedTicketIndex + 1} of ${tickets.length}` : 'Details'}
                </span>
                <button
                  onClick={() => setSelectedBooking(null)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: `1px solid ${C.border}`,
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: C.text,
                    cursor: 'pointer',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {tickets.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <button
                    type="button"
                    disabled={!canPrev}
                    onClick={() => setSelectedTicketIndex((i) => Math.max(0, i - 1))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 12px',
                      background: canPrev ? C.bgCard : 'transparent',
                      border: `1px solid ${C.border}`,
                      borderRadius: '10px',
                      color: canPrev ? C.text : C.muted,
                      cursor: canPrev ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>
                  <span style={{ fontSize: '12px', color: C.gold, fontWeight: 700 }}>
                    Each QR admits 1 person
                  </span>
                  <button
                    type="button"
                    disabled={!canNext}
                    onClick={() => setSelectedTicketIndex((i) => Math.min(tickets.length - 1, i + 1))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 12px',
                      background: canNext ? C.bgCard : 'transparent',
                      border: `1px solid ${C.border}`,
                      borderRadius: '10px',
                      color: canNext ? C.text : C.muted,
                      cursor: canNext ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* Digital Pass Card */}
              <DigitalTicketCard
                event={selectedBooking.event}
                booking={selectedBooking}
                ticket={currentTicket}
                customer={selectedBooking.customer}
                ticketIndex={selectedTicketIndex + 1}
                ticketTotal={tickets.length}
              />

              <TicketActions bookingId={selectedBooking.id} />

              <button
                onClick={() => setSelectedBooking(null)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: C.bgCard,
                  border: `1px solid ${C.borderGold}`,
                  borderRadius: '14px',
                  color: C.gold,
                  fontWeight: 800,
                  fontSize: '14px',
                  fontFamily: 'Space Grotesk, sans-serif',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                Close Ticket View
              </button>
            </div>
          </div>
          );
        })()}

        {/* Content Container */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: C.muted, fontSize: '15px' }}>
            Loading your digital tickets...
          </div>
        ) : error ? (
          <div style={{ padding: '20px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '16px', color: C.red, textAlign: 'center' }}>
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Ticket size={48} color={C.muted} />
            <h3 style={{ margin: 0, fontSize: '18px', color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
              No Active Digital Tickets Found
            </h3>
            <p style={{ margin: 0, color: C.muted, fontSize: '14px', maxWidth: '400px' }}>
              You don't have any confirmed ticket passes yet. Discover live concerts and book your tickets!
            </p>
            <button
              onClick={() => navigate('/events')}
              style={{ padding: '12px 24px', background: C.gold, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Browse Upcoming Events
            </button>
          </div>
        ) : (
          /* Smooth Scroll Container for Ticket Cards */
          <div
            style={{
              maxHeight: 'calc(100vh - 220px)',
              overflowY: 'auto',
              paddingRight: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              scrollbarWidth: 'thin',
              scrollbarColor: `${C.gold} rgba(255,255,255,0.05)`,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '22px' }}>
              {bookings.map((booking) => {
                const event = booking.event || {};
                const bookingRef = booking.bookingNumber || booking.id;
                const banner = getEventBannerUrl(
                  event,
                  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80'
                );

                const isArchivedOrDeleted =
                  event.isDeleted ||
                  event.status === 'Archived' ||
                  event.status === 'ARCHIVED' ||
                  event.status === 'Cancelled' ||
                  event.status === 'CANCELLED';

                const primarySchedule = getPrimarySchedule(event);
                const venueName = event.venue?.name || event.eventVenue?.venueName || event.venueName || 'Venue TBA';
                const venueAddress = event.venue?.address || event.eventVenue?.address || '';
                const cityName = event.city?.name || event.eventVenue?.city || '';

                const firstItem = booking.items?.[0] || null;
                const sectionName = firstItem?.section?.name || booking.section?.name || 'General Admission';
                const ticketTypeName = firstItem?.ticketType?.name || booking.ticketType?.name || 'Standard Tier';
                const tickets = getBookingTickets(booking);
                const totalQty = tickets.length || booking.quantity || 1;

                return (
                  <div
                    key={booking.id}
                    style={{
                      background: isArchivedOrDeleted ? 'rgba(20, 20, 20, 0.85)' : C.bgCard,
                      border: `1px solid ${isArchivedOrDeleted ? 'rgba(255, 255, 255, 0.12)' : C.borderGold}`,
                      borderRadius: '22px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      filter: isArchivedOrDeleted ? 'grayscale(90%)' : 'none',
                      opacity: isArchivedOrDeleted ? 0.65 : 1,
                      boxShadow: '0 12px 28px rgba(0,0,0,0.4)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                  >
                    {/* Card Banner */}
                    <div style={{ height: '145px', position: 'relative', overflow: 'hidden' }}>
                      <img src={banner} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,13,24,0.9), transparent)' }} />
                      
                      {/* Top Right Status Badge */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: isArchivedOrDeleted ? 'rgba(239, 68, 68, 0.2)' : C.greenDim,
                          color: isArchivedOrDeleted ? '#EF4444' : C.green,
                          border: `1px solid ${isArchivedOrDeleted ? '#EF4444' : C.green}`,
                          fontSize: '11px',
                          fontWeight: 800,
                          fontFamily: 'Space Grotesk, sans-serif',
                        }}
                      >
                        {isArchivedOrDeleted ? 'ARCHIVED' : 'Ticket Valid'}
                      </div>
                    </div>

                    {/* Card Body Details */}
                    <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: C.gold, fontWeight: 800, fontFamily: 'Space Grotesk, monospace' }}>
                          Ref: #{bookingRef}
                        </span>
                        <span style={{ fontSize: '11px', color: C.muted, fontWeight: 600 }}>
                          Qty: <strong style={{ color: C.green }}>{totalQty} QR {totalQty === 1 ? 'Pass' : 'Passes'}</strong>
                        </span>
                      </div>

                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: C.text, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.3 }}>
                        {event.title || 'Event Entry Pass'}
                      </h3>

                      {/* Chips Row: Section & Ticket Tier */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(234,179,8,0.1)', border: `1px solid ${C.borderGold}`, color: C.gold, fontSize: '11px', fontWeight: 700 }}>
                          Section: {sectionName}
                        </span>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.text, fontSize: '11px', fontWeight: 600 }}>
                          Tier: {ticketTypeName}
                        </span>
                      </div>

                      {/* Fetched Date, Time, and Full Venue Details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: C.muted, background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '14px', border: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={14} color={C.gold} />
                          <span>
                            <strong style={{ color: C.text }}>Date:</strong> {formatEventDate(primarySchedule)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={14} color={C.gold} />
                          <span>
                            <strong style={{ color: C.text }}>Time:</strong> {formatEventTimeRange(primarySchedule)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <MapPin size={14} color={C.blue} style={{ marginTop: '2px', flexShrink: 0 }} />
                          <div>
                            <strong style={{ color: C.text }}>Venue:</strong> {venueName}{cityName ? `, ${cityName}` : ''}
                            {venueAddress && (
                              <span style={{ display: 'block', color: C.muted, fontSize: '11px', marginTop: '1px' }}>
                                {venueAddress}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedTicketIndex(0);
                            setSelectedBooking(booking);
                          }}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: isArchivedOrDeleted ? 'rgba(255, 255, 255, 0.05)' : C.gold,
                            color: isArchivedOrDeleted ? C.muted : '#000000',
                            border: isArchivedOrDeleted ? `1px solid ${C.border}` : 'none',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: 800,
                            fontFamily: 'Space Grotesk, sans-serif',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: isArchivedOrDeleted ? 'none' : '0 4px 14px rgba(234, 179, 8, 0.25)',
                          }}
                        >
                          <QrCode size={18} /> {isArchivedOrDeleted ? 'View Archived Pass' : totalQty > 1 ? `View ${totalQty} QR Passes` : 'View QR Entry Pass'}
                        </button>
                        {!isArchivedOrDeleted && <TicketActions bookingId={booking.id} compact />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <CustomerFooter />
    </div>
  );
}
