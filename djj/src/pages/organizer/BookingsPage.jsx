import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Search, Filter, Calendar, User, FileText, ChevronLeft, ChevronRight, Eye, DollarSign } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { organizerBookingService } from '../../services/organizer/organizerBookingService.js';
import { eventService as organizerEventService } from '../../services/organizer/eventService.js';
import { PaymentStatusBadge } from '../../components/payment/PaymentStatusBadge.jsx';
import { formatDate, formatCurrency } from '../../utils/formatters.js';

export default function BookingsPage() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Fetch Organizer Events for Filter Dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await organizerEventService.getMyEvents({ limit: 100 });
        const eventData = res.data || res;
        setEvents(Array.isArray(eventData) ? eventData : eventData.events || []);
      } catch {
        // Safe silent fail for dropdown options
      }
    };
    fetchEvents();
  }, []);

  // Fetch Bookings with Query Parameters
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page,
          limit: 10,
          eventId: selectedEventId || undefined,
          bookingStatus: bookingStatus || undefined,
          paymentStatus: paymentStatus || undefined,
          bookingNumber: search.trim() || undefined,
        };

        const res = await organizerBookingService.getOrganizerBookings(params);
        const resData = res.data || res;
        setBookings(Array.isArray(resData) ? resData : resData.bookings || []);
        if (res.meta) {
          setMeta(res.meta);
        }
      } catch (err) {
        setError(err.message || 'Unable to retrieve event bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [page, selectedEventId, bookingStatus, paymentStatus, search]);

  // Derived Stat Aggregates
  const totalBookingsCount = meta.total || bookings.length;
  const confirmedCount = bookings.filter((b) => b.bookingStatus === 'Confirmed').length;
  const pendingCount = bookings.filter((b) => b.bookingStatus === 'Pending').length;
  const totalRevenue = bookings.reduce((acc, b) => acc + (b.paymentStatus === 'Paid' ? (b.totalAmount || 0) : 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, margin: 0, color: C.text }}>
          Booking Management
        </h1>
        <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '13px' }}>
          Monitor customer bookings, payment status, and ticket registrations across your events
        </p>
      </div>

      {/* Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.goldDim, color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ticket size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase' }}>Total Bookings</span>
            <strong style={{ display: 'block', fontSize: '18px', color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>{totalBookingsCount}</strong>
          </div>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.greenDim, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ticket size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase' }}>Confirmed</span>
            <strong style={{ display: 'block', fontSize: '18px', color: C.green, fontFamily: 'Space Grotesk, sans-serif' }}>{confirmedCount}</strong>
          </div>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.amberDim, color: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ticket size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase' }}>Pending</span>
            <strong style={{ display: 'block', fontSize: '18px', color: C.amber, fontFamily: 'Space Grotesk, sans-serif' }}>{pendingCount}</strong>
          </div>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.blueDim, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase' }}>Revenue (Page)</span>
            <strong style={{ display: 'block', fontSize: '18px', color: C.gold, fontFamily: 'Space Grotesk, sans-serif' }}>{formatCurrency(totalRevenue)}</strong>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '220px' }}>
          <Search size={16} color={C.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search Booking Ref..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ width: '100%', padding: '9px 12px 9px 36px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Event Filter */}
        <select
          value={selectedEventId}
          onChange={(e) => {
            setSelectedEventId(e.target.value);
            setPage(1);
          }}
          style={{ padding: '9px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none' }}
        >
          <option value="">All Events</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.title}</option>
          ))}
        </select>

        {/* Booking Status Filter */}
        <select
          value={bookingStatus}
          onChange={(e) => {
            setBookingStatus(e.target.value);
            setPage(1);
          }}
          style={{ padding: '9px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none' }}
        >
          <option value="">All Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
          <option value="CheckedIn">Checked In</option>
        </select>
      </div>

      {/* Data Table */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading event bookings...</div>
      ) : error ? (
        <div style={{ padding: '20px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '14px', color: C.red, textAlign: 'center' }}>
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '40px', textAlign: 'center', color: C.muted }}>
          No bookings found matching your search criteria.
        </div>
      ) : (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '16px 20px' }}>Booking Ref</th>
                <th style={{ padding: '16px 20px' }}>Customer</th>
                <th style={{ padding: '16px 20px' }}>Event</th>
                <th style={{ padding: '16px 20px' }}>Qty</th>
                <th style={{ padding: '16px 20px' }}>Amount</th>
                <th style={{ padding: '16px 20px' }}>Payment Status</th>
                <th style={{ padding: '16px 20px' }}>Date</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const bookingRef = b.bookingNumber || b.id;
                const custName = b.customer ? `${b.customer.firstName || ''} ${b.customer.lastName || ''}`.trim() || b.customer.email : 'Customer';
                const eventTitle = b.event?.title || 'Event';
                const qty = b.quantity || 1;
                const total = b.totalAmount || 0;
                const currency = b.currency || 'INR';

                return (
                  <tr key={b.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: C.gold, fontFamily: 'Space Grotesk, monospace' }}>
                      #{bookingRef}
                    </td>
                    <td style={{ padding: '16px 20px', color: C.text, fontWeight: 600 }}>
                      <div>{custName}</div>
                      {b.customer?.email && <span style={{ fontSize: '11px', color: C.muted, display: 'block' }}>{b.customer.email}</span>}
                    </td>
                    <td style={{ padding: '16px 20px', color: C.text }}>
                      {eventTitle}
                    </td>
                    <td style={{ padding: '16px 20px', color: C.text, fontWeight: 700 }}>
                      {qty}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 800, color: C.gold, fontFamily: 'Space Grotesk, sans-serif' }}>
                      {formatCurrency(total, currency)}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <PaymentStatusBadge status={b.paymentStatus || b.bookingStatus} />
                    </td>
                    <td style={{ padding: '16px 20px', color: C.muted }}>
                      {formatDate(b.createdAt)}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/organizer/bookings/${b.id}`)}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${C.border}`,
                          borderRadius: '8px',
                          color: C.text,
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div style={{ padding: '14px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: C.muted }}>
                Showing page {page} of {meta.totalPages}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{ padding: '6px 12px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '8px', color: page <= 1 ? C.muted : C.text, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  style={{ padding: '6px 12px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '8px', color: page >= meta.totalPages ? C.muted : C.text, cursor: page >= meta.totalPages ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
