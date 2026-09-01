import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Ticket, FileText, CheckCircle2 } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { organizerBookingService } from '../../services/organizer/organizerBookingService.js';
import { PaymentStatusBadge } from '../../components/payment/PaymentStatusBadge.jsx';
import { formatDate, formatCurrency } from '../../utils/formatters.js';

export default function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await organizerBookingService.getOrganizerBookingById(id);
        const data = res.data || res;
        setBooking(data);
      } catch (err) {
        setError(err.message || 'Unable to retrieve booking details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading booking details...</div>;
  }

  if (error || !booking) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '20px', color: C.red, textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 8px' }}>Booking Not Found</h3>
        <p style={{ margin: '0 0 20px', color: C.text, fontSize: '14px' }}>{error || 'Booking record could not be loaded.'}</p>
        <button onClick={() => navigate('/organizer/bookings')} style={{ padding: '8px 16px', background: C.red, color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Back to Bookings
        </button>
      </div>
    );
  }

  const bookingRef = booking.bookingNumber || booking.id;
  const customer = booking.customer || {};
  const event = booking.event || {};
  const currency = booking.currency || 'INR';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate('/organizer/bookings')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Back to Bookings List
        </button>

        <button
          onClick={() => navigate(`/invoices/${booking.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.gold, color: '#000', border: 'none', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
        >
          <FileText size={16} /> View Tax Invoice
        </button>
      </div>

      {/* Booking Overview Card */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase' }}>Booking Reference Number</span>
            <h2 style={{ margin: '2px 0 0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', color: C.gold }}>
              #{bookingRef}
            </h2>
          </div>
          <PaymentStatusBadge status={booking.paymentStatus || booking.bookingStatus} />
        </div>

        {/* 2-Column Info: Left (Customer Profile), Right (Event Summary) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Customer Profile */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', color: C.gold, fontFamily: 'Space Grotesk, sans-serif' }}>
              Customer Details
            </h4>
            <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={14} color={C.muted} /> <strong style={{ color: C.text }}>{customer.firstName ? `${customer.firstName} ${customer.lastName}` : 'Customer'}</strong>
            </div>
            <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: C.muted }}>
              <Mail size={14} /> {customer.email}
            </div>
            {customer.phone && (
              <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: C.muted }}>
                <Phone size={14} /> {customer.phone}
              </div>
            )}
          </div>

          {/* Event Brief */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', color: C.gold, fontFamily: 'Space Grotesk, sans-serif' }}>
              Event Details
            </h4>
            <div style={{ fontSize: '14px', fontWeight: 700, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
              {event.title}
            </div>
            <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: C.muted }}>
              <Calendar size={14} color={C.gold} /> {formatDate(event.startDate)}
            </div>
            <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: C.muted }}>
              <MapPin size={14} color={C.blue} /> {event.venue?.name || 'Venue TBA'}
            </div>
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '16px' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
            Ticket Items & Inventory Breakdown
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '10px 12px' }}>Ticket Type / Tier</th>
                <th style={{ padding: '10px 12px' }}>Quantity</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {booking.items && booking.items.length > 0 ? (
                booking.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '12px', color: C.text, fontWeight: 600 }}>
                      {item.ticketType?.name || 'Ticket Item'}
                    </td>
                    <td style={{ padding: '12px', color: C.text }}>{item.quantity}</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: C.gold, fontWeight: 700 }}>
                      {formatCurrency(item.total || booking.totalAmount, currency)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={{ padding: '12px', color: C.text }}>Event Ticket Admission</td>
                  <td style={{ padding: '12px', color: C.text }}>{booking.quantity || 1}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: C.gold, fontWeight: 700 }}>
                    {formatCurrency(booking.totalAmount, currency)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: C.muted }}>
            <span>Ticket Subtotal</span>
            <span style={{ color: C.text }}>{formatCurrency(booking.subtotal || 0, currency)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: C.muted }}>
            <span>GST Tax (18%)</span>
            <span style={{ color: C.text }}>{formatCurrency(booking.gstAmount || 0, currency)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: C.gold, fontSize: '16px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', borderTop: `1px solid ${C.borderGold}`, paddingTop: '12px', marginTop: '4px' }}>
            <span>Total Booking Revenue</span>
            <span>{formatCurrency(booking.totalAmount || 0, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
