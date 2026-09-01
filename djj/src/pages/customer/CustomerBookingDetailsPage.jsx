import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle, XCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { customerBookingService } from '../../services/customer/customerBookingService.js';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar.jsx';
import { CustomerFooter } from '../../components/customer/CustomerFooter.jsx';
import { PaymentStatusBadge } from '../../components/payment/PaymentStatusBadge.jsx';
import { TicketQrGrid } from '../../components/ticket/TicketQrGrid.jsx';
import { TicketActions } from '../../components/ticket/TicketActions.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { getPrimarySchedule, formatEventDate, formatEventTimeRange } from '../../utils/eventSchedule.js';
import { useToast } from '../../hooks/useToast.js';

export default function CustomerBookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await customerBookingService.getMyBookingById(id);
        const data = res.data || res;
        setBooking(data);
      } catch (err) {
        setError(err.message || 'Unable to load booking details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBookingDetails();
  }, [id]);

  // Cancel Booking Action Handler
  const handleCancelBookingSubmit = async (e) => {
    e.preventDefault();
    setCancelling(true);
    try {
      const res = await customerBookingService.cancelBooking(id, {
        cancellationReason: cancellationReason.trim() || undefined,
      });
      const updated = res.data || res;
      setBooking((prev) => ({ ...prev, bookingStatus: 'Cancelled', paymentStatus: 'Cancelled' }));
      setShowCancelModal(false);
      showToast('Booking cancelled successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Cancellation failed. Event may have already started.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
        <CustomerNavbar />
        <div style={{ flexGrow: 1, padding: '80px 24px', textAlign: 'center', color: C.muted }}>Loading your ticket pass details...</div>
        <CustomerFooter />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
        <CustomerNavbar />
        <div style={{ flexGrow: 1, maxWidth: '600px', margin: '80px auto', padding: '40px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '20px', color: C.red, textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px', fontFamily: 'Space Grotesk, sans-serif' }}>Booking Access Denied</h3>
          <p style={{ margin: '0 0 20px', color: C.text, fontSize: '14px' }}>{error || 'You do not have permission to access this booking.'}</p>
          <button onClick={() => navigate('/my-bookings')} style={{ padding: '10px 20px', background: C.red, color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
            Return to My Bookings
          </button>
        </div>
        <CustomerFooter />
      </div>
    );
  }

  const event = booking.event || {};
  const bookingRef = booking.bookingNumber || booking.id;
  const isCancellable = booking.bookingStatus === 'Confirmed' || booking.bookingStatus === 'Pending';
  const primarySchedule = getPrimarySchedule(event);

  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
      <CustomerNavbar />

      <main style={{ flexGrow: 1, maxWidth: '900px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Navigation Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={() => navigate('/my-bookings')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            <ArrowLeft size={16} /> Back to My Bookings
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate(`/invoices/${booking.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.goldDim, border: `1px solid ${C.borderGold}`, borderRadius: '10px', color: C.gold, padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              <FileText size={16} /> Tax Invoice
            </button>

            {isCancellable && (
              <button
                onClick={() => setShowCancelModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '10px', color: C.red, padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                <XCircle size={16} /> Cancel Booking
              </button>
            )}
          </div>
        </div>

        {/* Booking Card Details */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase' }}>Booking Ref Number</span>
              <h2 style={{ margin: '2px 0 0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', color: C.gold }}>
                #{bookingRef}
              </h2>
            </div>
            <PaymentStatusBadge status={booking.bookingStatus} />
          </div>

          {/* Event Brief */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', fontSize: '13px' }}>
            <div>
              <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>Event Title</span>
              <strong style={{ fontSize: '16px', color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>{event.title}</strong>
            </div>

            <div>
              <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>Date</span>
              <strong style={{ color: C.text }}>{formatEventDate(primarySchedule)}</strong>
            </div>

            <div>
              <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>Time</span>
              <strong style={{ color: C.text }}>{formatEventTimeRange(primarySchedule)}</strong>
            </div>

            <div>
              <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>Venue Location</span>
              <strong style={{ color: C.text }}>{event.venue?.name || 'Venue TBA'}</strong>
            </div>
          </div>

          {['Confirmed', 'CheckedIn'].includes(booking.bookingStatus) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#090B10', border: `1px solid ${C.borderGold}`, borderRadius: '20px', padding: '24px' }}>
              <span style={{ fontSize: '12px', color: C.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>
                {(booking.tickets?.length || booking.quantity || 1) > 1
                  ? `Official Check-In QR Passes (${booking.tickets?.length || booking.quantity})`
                  : 'Official Check-In QR Entry Pass'}
              </span>
              <TicketQrGrid booking={booking} event={event} size={160} />
              <TicketActions bookingId={booking.id} onView={() => navigate('/my-tickets')} />
              <span style={{ fontSize: '12px', color: C.muted, textAlign: 'center' }}>
                Each QR is unique and admits one person. Unused passes can be scanned later.
              </span>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', textAlign: 'center', color: C.muted, fontSize: '13px' }}>
              QR entry passes will activate upon payment confirmation.
            </div>
          )}

          {/* Purchased Ticket Tier Breakdown */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: C.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Purchased Ticket Tiers
            </span>
            {booking.items && booking.items.length > 0 ? (
              booking.items.map((item, idx) => (
                <div key={item.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
                  <div>
                    <strong style={{ color: C.text, fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif' }}>
                      {item.ticketType?.name || 'Standard Admission'}
                    </strong>
                    {item.section?.name && (
                      <span style={{ fontSize: '11px', color: C.muted, display: 'block' }}>Section: {item.section.name}</span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: C.gold, fontWeight: 700, fontSize: '14px' }}>Qty: {item.quantity}</span>
                    <span style={{ fontSize: '11px', color: C.muted, display: 'block' }}>@ {formatCurrency(item.unitPrice, booking.currency)} each</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
                <strong style={{ color: C.text, fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {booking.tickets?.[0]?.ticketType?.name || 'Standard Admission'}
                </strong>
                <span style={{ color: C.gold, fontWeight: 700, fontSize: '14px' }}>Qty: {booking.quantity || 1}</span>
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: C.muted }}>
              <span>Ticket Subtotal ({booking.quantity || 1} tickets)</span>
              <span style={{ color: C.text }}>{formatCurrency(booking.subtotal || 0, booking.currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: C.muted }}>
              <span>GST Tax (18%)</span>
              <span style={{ color: C.text }}>{formatCurrency(booking.gstAmount || 0, booking.currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: C.gold, fontSize: '16px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', borderTop: `1px solid ${C.borderGold}`, paddingTop: '12px', marginTop: '4px' }}>
              <span>Total Paid Amount</span>
              <span>{formatCurrency(booking.totalAmount || 0, booking.currency)}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <form onSubmit={handleCancelBookingSubmit} style={{ background: C.bgCard, border: `1px solid ${C.red}`, borderRadius: '24px', padding: '24px', maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: C.red }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px' }}>
                Cancel Ticket Booking?
              </h3>
            </div>

            <p style={{ margin: 0, color: C.text, fontSize: '13px', lineHeight: 1.5 }}>
              Are you sure you want to cancel booking <strong>#{bookingRef}</strong>? This will release reserved ticket inventory.
            </p>

            <div>
              <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>Reason for cancellation (optional)</label>
              <textarea
                rows={3}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g. Personal schedule conflict..."
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                style={{ padding: '10px 16px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.muted, fontSize: '13px', cursor: 'pointer' }}
              >
                Keep Booking
              </button>
              <button
                type="submit"
                disabled={cancelling}
                style={{ padding: '10px 20px', background: C.red, color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: cancelling ? 'not-allowed' : 'pointer' }}
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </form>
        </div>
      )}

      <CustomerFooter />
    </div>
  );
}
