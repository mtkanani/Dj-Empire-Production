import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, MapPin, ArrowRight, Clock, Mail, Banknote } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { customerBookingService } from '../../services/customer/customerBookingService.js';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar.jsx';
import { Footer } from '../../components/Layout.jsx';
import { TicketQrGrid } from '../../components/ticket/TicketQrGrid.jsx';
import { TicketActions } from '../../components/ticket/TicketActions.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { getPrimarySchedule, formatEventDate, formatEventTimeRange } from '../../utils/eventSchedule.js';
import { PaymentMethodChip } from '../../components/payment/PaymentMethodChip.jsx';

export default function BookingConfirmationPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cashQrUrl, setCashQrUrl] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await customerBookingService.getMyBookingById(bookingId);
        const data = res.data || res;
        setBooking(data);
        if (data.paymentGateway === 'CASH' && data.paymentStatus !== 'CASH_RECEIVED' && data.paymentStatus !== 'Paid') {
          try {
            const qr = await customerBookingService.getCashVerificationQr(data.id);
            const blob = qr.blob || qr;
            setCashQrUrl(URL.createObjectURL(blob));
          } catch {
            setCashQrUrl(null);
          }
        }
      } catch (err) {
        setError(err.message || 'Unable to load booking details.');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) fetchBooking();
    return () => {
      setCashQrUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [bookingId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
        <CustomerNavbar />
        <div style={{ flexGrow: 1, padding: '80px 24px', textAlign: 'center', color: C.muted }}>Verifying booking confirmation...</div>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
        <CustomerNavbar />
        <div style={{ flexGrow: 1, maxWidth: '600px', margin: '80px auto', padding: '40px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '20px', color: C.red, textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontFamily: 'Space Grotesk, sans-serif' }}>Booking Not Found</h3>
          <p style={{ margin: '0 0 20px', color: C.text, fontSize: '14px' }}>{error || 'Booking details could not be retrieved.'}</p>
          <button onClick={() => navigate('/events')} style={{ padding: '10px 20px', background: C.red, color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
            Back to Explore Events
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const event = booking.event || {};
  const bookingNumber = booking.bookingNumber || booking.id;
  const primarySchedule = getPrimarySchedule(event);
  const isCashPending =
    booking.paymentGateway === 'CASH' &&
    booking.paymentStatus !== 'CASH_RECEIVED' &&
    booking.paymentStatus !== 'Paid';

  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
      <CustomerNavbar />

      <main style={{ flexGrow: 1, maxWidth: '800px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Success Header Badge */}
        <div
          style={{
            background: isCashPending ? C.goldDim : C.greenDim,
            border: `1px solid ${isCashPending ? C.gold : C.green}`,
            borderRadius: '24px',
            padding: '30px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: isCashPending ? C.gold : C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isCashPending ? <Banknote size={32} color="#000000" /> : <CheckCircle2 size={32} color="#000000" />}
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 800, color: C.text, margin: 0 }}>
            {isCashPending ? 'Booking Created Successfully!' : 'Booking Confirmed!'}
          </h1>
          <p style={{ color: C.muted, fontSize: '14px', margin: 0, maxWidth: '480px' }}>
            {isCashPending
              ? 'Your booking is pending cash verification. Provide this Booking ID to the authorised administrator or organizer when paying in cash. This is not a payment confirmation.'
              : `Your booking is confirmed. Unique QR passes have been issued${booking.tickets?.length ? ` (${booking.tickets.length} ticket${booking.tickets.length > 1 ? 's' : ''})` : ''}.`}
          </p>
          <span style={{ padding: '6px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '999px', color: C.gold, fontSize: '14px', fontWeight: 700, fontFamily: 'Space Grotesk, monospace' }}>
            Booking ID: {bookingNumber}
          </span>
        </div>

        {/* Booking Card Details */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', color: C.text }}>
                {event.title || 'Event Details'}
              </h3>
              <span style={{ fontSize: '13px', color: C.muted }}>
                Status: {booking.bookingStatus || 'Confirmed'} · Tickets: {booking.tickets?.length || booking.quantity || 1} ·{' '}
                {formatCurrency(booking.totalAmount || 0, booking.currency || 'INR')}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <PaymentMethodChip booking={booking} />
              <span style={{ padding: '4px 10px', borderRadius: '8px', background: isCashPending ? C.goldDim : C.greenDim, color: isCashPending ? C.gold : C.green, fontSize: '12px', fontWeight: 700 }}>
                {isCashPending ? 'Pending Cash Verification' : `Payment: ${booking.displayPaymentStatus || booking.paymentStatus || 'Paid'}`}
              </span>
            </div>
          </div>

          {/* Schedule & Venue Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={20} color={C.gold} />
              <div>
                <span style={{ color: C.muted, fontSize: '11px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Event Date</span>
                <strong style={{ fontSize: '14px', color: C.text }}>
                  {formatEventDate(primarySchedule)}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={20} color={C.gold} />
              <div>
                <span style={{ color: C.muted, fontSize: '11px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timing & Gates</span>
                <strong style={{ fontSize: '14px', color: C.text }}>
                  {formatEventTimeRange(primarySchedule)}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MapPin size={20} color={C.blue} />
              <div>
                <span style={{ color: C.muted, fontSize: '11px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Venue Location</span>
                <strong style={{ fontSize: '14px', color: C.text }}>
                  {event.venue?.name || event.eventVenue?.venueName || 'Venue TBA'}
                  {event.city?.name ? `, ${event.city.name}` : ''}
                </strong>
              </div>
            </div>
          </div>

          {/* QR Code Ticket Section — one unique QR per purchased ticket */}
          {booking.attendees?.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 8px', fontFamily: 'Space Grotesk, sans-serif' }}>Attendees</h4>
              <ol style={{ margin: 0, paddingLeft: '18px', color: C.text }}>
                {booking.attendees.map((a) => (
                  <li key={a.id || a.attendeeIndex}>{a.fullName}</li>
                ))}
              </ol>
            </div>
          )}

          {isCashPending && cashQrUrl && (
            <div style={{ textAlign: 'center', padding: '16px', border: `1px solid ${C.borderGold}`, borderRadius: '16px' }}>
              <p style={{ color: C.gold, fontWeight: 700, marginTop: 0 }}>Show this QR when paying cash</p>
              <img src={cashQrUrl} alt="Cash verification QR" width={200} height={200} style={{ background: '#fff', borderRadius: 12 }} />
            </div>
          )}

          {['Confirmed', 'CheckedIn'].includes(booking.bookingStatus) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#090B10', border: `1px solid ${C.borderGold}`, borderRadius: '16px', padding: '20px' }}>
              <span style={{ fontSize: '12px', color: C.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>
                {(booking.tickets?.length || booking.quantity || 1) > 1
                  ? `${booking.tickets?.length || booking.quantity} Unique QR Entry Passes`
                  : 'QR Entry Pass'}
              </span>
              <TicketQrGrid booking={booking} event={event} size={148} />
              <span style={{ fontSize: '11px', color: C.muted, textAlign: 'center' }}>
                Each QR admits one person. Share extra passes with the rest of your group.
              </span>
            </div>
          )}

          {/* Financial Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border}`, paddingTop: '16px' }}>
            <span style={{ fontSize: '14px', color: C.muted }}>{isCashPending ? 'Amount Due' : 'Total Paid Amount'}</span>
            <strong style={{ fontSize: '20px', color: C.gold, fontFamily: 'Space Grotesk, sans-serif' }}>
              {formatCurrency(booking.totalAmount || 0, booking.currency || 'INR')}
            </strong>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!isCashPending && <TicketActions bookingId={booking.id} onView={() => navigate('/my-tickets')} />}
          <button
            onClick={() => navigate('/my-tickets')}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: C.muted,
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            Go to My Tickets <ArrowRight size={16} />
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
