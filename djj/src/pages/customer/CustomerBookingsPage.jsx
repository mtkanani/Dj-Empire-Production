import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Search, Calendar, MapPin, ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { customerBookingService } from '../../services/customer/customerBookingService.js';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar.jsx';
import { CustomerFooter } from '../../components/customer/CustomerFooter.jsx';
import { PaymentStatusBadge } from '../../components/payment/PaymentStatusBadge.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { getEventBannerUrl } from '../../utils/eventImage.js';
import { formatEventDateTimeLine } from '../../utils/eventSchedule.js';

export default function CustomerBookingsPage() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'UPCOMING', 'PAST', 'CANCELLED'
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        if (activeTab === 'UPCOMING') {
          res = await customerBookingService.getMyBookings();
        } else if (activeTab === 'PAST') {
          res = await customerBookingService.getMyBookings();
        } else {
          res = await customerBookingService.getMyBookings();
        }

        const resData = res.data || res;
        setBookings(Array.isArray(resData) ? resData : resData.bookings || []);
      } catch (err) {
        setError(err.message || 'Unable to load your bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [activeTab]);

  // Filter Bookings locally by Search & Tab
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      !search ||
      (b.id && b.id.toLowerCase().includes(search.toLowerCase())) ||
      (b.bookingNumber && b.bookingNumber.toLowerCase().includes(search.toLowerCase())) ||
      (b.event?.title && b.event.title.toLowerCase().includes(search.toLowerCase()));

    const status = String(b.bookingStatus).toLowerCase();
    let matchesTab = true;

    if (activeTab === 'UPCOMING') {
      matchesTab = status === 'confirmed' || status === 'pending';
    } else if (activeTab === 'PAST') {
      matchesTab = status === 'checkedin' || status === 'completed';
    } else if (activeTab === 'CANCELLED') {
      matchesTab = status === 'cancelled';
    }

    return matchesSearch && matchesTab;
  });

  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
      <CustomerNavbar />

      <main style={{ flexGrow: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 800, margin: 0, color: C.text }}>
              My Ticket Bookings
            </h1>
            <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '14px' }}>
              Access your booked event passes, entry QR codes, and payment receipts
            </p>
          </div>
        </div>

        {/* Tabs & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '4px' }}>
            {[
              { id: 'ALL', label: 'All Bookings' },
              { id: 'UPCOMING', label: 'Upcoming' },
              { id: 'PAST', label: 'Past Attended' },
              { id: 'CANCELLED', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === tab.id ? C.gold : 'transparent',
                  color: activeTab === tab.id ? '#000000' : C.muted,
                  fontSize: '13px',
                  fontWeight: activeTab === tab.id ? 800 : 500,
                  fontFamily: 'Space Grotesk, sans-serif',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color={C.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by Event or Ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                color: C.text,
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Bookings Grid */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading your booked tickets...</div>
        ) : error ? (
          <div style={{ padding: '20px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '16px', color: C.red, textAlign: 'center' }}>
            {error}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Ticket size={48} color={C.muted} />
            <h3 style={{ margin: 0, fontSize: '18px', color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
              No Bookings Found
            </h3>
            <p style={{ margin: 0, color: C.muted, fontSize: '14px', maxWidth: '400px' }}>
              You don't have any bookings under this view. Explore upcoming events and book your tickets!
            </p>
            <button
              onClick={() => navigate('/events')}
              style={{ padding: '10px 20px', background: C.gold, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Explore Events
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredBookings.map((booking) => {
              const event = booking.event || {};
              const bookingRef = booking.bookingNumber || booking.id;
              const banner = getEventBannerUrl(
                event,
                'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80'
              );

              return (
                <div
                  key={booking.id}
                  style={{
                    background: C.bgCard,
                    border: `1px solid ${C.border}`,
                    borderRadius: '20px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
                    <img src={banner} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <PaymentStatusBadge status={booking.paymentStatus || booking.bookingStatus} />
                    </div>
                  </div>

                  <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: C.gold, fontWeight: 700, fontFamily: 'Space Grotesk, monospace' }}>
                        Ref: #{bookingRef}
                      </span>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(234, 179, 8, 0.15)',
                          border: `1px solid ${C.gold}`,
                          color: C.gold,
                          fontSize: '11px',
                          fontWeight: 700,
                          fontFamily: 'Space Grotesk, sans-serif',
                        }}
                      >
                        {booking.items?.[0]?.ticketType?.name || booking.tickets?.[0]?.ticketType?.name || 'General Admission'} x {booking.quantity || 1}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
                      {event.title || 'Booked Event'}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: C.muted }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} color={C.gold} /> {formatEventDateTimeLine(event)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={13} color={C.blue} /> {event.venue?.name || 'Venue TBA'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border}`, paddingTop: '12px', marginTop: '4px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: C.muted, display: 'block' }}>Qty: {booking.quantity || 1} tickets</span>
                        <strong style={{ fontSize: '16px', color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
                          {formatCurrency(booking.totalAmount, booking.currency)}
                        </strong>
                      </div>

                      <button
                        onClick={() => navigate(`/my-bookings/${booking.id}`)}
                        style={{
                          padding: '8px 14px',
                          background: C.gold,
                          color: '#000000',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: 800,
                          fontFamily: 'Space Grotesk, sans-serif',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        View Ticket <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CustomerFooter />
    </div>
  );
}
