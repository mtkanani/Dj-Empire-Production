import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, User, Mail, Phone, Lock, AlertCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { customerBookingService } from '../../services/customer/customerBookingService.js';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar.jsx';
import { CustomerFooter } from '../../components/customer/CustomerFooter.jsx';
import { BookingStepper } from '../../components/customer/booking/BookingStepper.jsx';
import { ReservationTimer } from '../../components/customer/booking/ReservationTimer.jsx';
import { OrderSummaryCard } from '../../components/customer/booking/OrderSummaryCard.jsx';
import { useBooking } from '../../context/BookingContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../hooks/useToast.js';
import { validatePhone } from '../../utils/validation.js';

export default function CustomerDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { event, selectedTickets, reservation, setCustomerDetails, setBooking } = useBooking();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');

  const [creatingBooking, setCreatingBooking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      if (!firstName && user.firstName) setFirstName(user.firstName);
      if (!lastName && user.lastName) setLastName(user.lastName);
      if (!email && user.email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  const selectedItemsArray = Object.values(selectedTickets || {}).map((it) => ({
    ticketTypeId: it.ticketType?.id || it.ticketTypeId,
    sectionId: it.ticketType?.sectionId || it.sectionId,
    name: it.ticketType?.name || 'Ticket',
    price: it.ticketType?.price || 0,
    quantity: it.quantity || 1,
  }));

  const handleReservationExpired = () => {
    showToast('Your 15-minute ticket lock has expired. Please select tickets again.', 'error');
    navigate(`/events/${eventId}/book`);
  };

  const handleCreateBookingSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      setError('First name and email are required for booking confirmation.');
      return;
    }

    const phoneErr = validatePhone(phone);
    if (phoneErr) {
      setError(phoneErr);
      return;
    }

    if (reservation?.expiresAt && new Date(reservation.expiresAt) <= new Date()) {
      showToast('Your 15-minute ticket lock has expired. Please select your tickets again.', 'error');
      setError('Your 15-minute ticket lock has expired. Please select your tickets again.');
      navigate(`/events/${eventId}/book`);
      return;
    }

    setCreatingBooking(true);
    setError(null);
    try {
      const isValidHex24 = (str) => typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str);

      const primaryTicketId = isValidHex24(selectedItemsArray[0]?.ticketTypeId)
        ? selectedItemsArray[0].ticketTypeId
        : isValidHex24(reservation?.ticketTypeId)
        ? reservation.ticketTypeId
        : undefined;

      const primarySectionId = isValidHex24(selectedItemsArray[0]?.sectionId)
        ? selectedItemsArray[0].sectionId
        : isValidHex24(reservation?.sectionId)
        ? reservation.sectionId
        : undefined;

      const totalQty = selectedItemsArray.reduce((acc, i) => acc + (i.quantity || 0), 0) || reservation?.lockedQuantity || 1;

      const validItems = selectedItemsArray
        .filter((it) => isValidHex24(it.ticketTypeId))
        .map((it) => ({
          ticketTypeId: it.ticketTypeId,
          sectionId: isValidHex24(it.sectionId) ? it.sectionId : undefined,
          quantity: it.quantity,
          unitPrice: it.price || 0,
        }));

      const payload = {
        eventId,
        ticketTypeId: primaryTicketId,
        sectionId: primarySectionId,
        quantity: totalQty,
        items: validItems.length > 0 ? validItems : undefined,
        reservationNumber: reservation?.reservationNumber || reservation?.id || undefined,
        notes: notes.trim() || undefined,
      };

      const res = await customerBookingService.createBooking(payload);
      const bookingData = res.data || res;

      setCustomerDetails({ firstName, lastName, email, phone, notes });
      setBooking(bookingData);

      showToast('Booking order created successfully!', 'success');
      navigate(`/events/${eventId}/booking/summary`);
    } catch (err) {
      const errMsg = err.message || 'Failed to create booking order.';
      setError(errMsg);
      showToast(errMsg, 'error');

      if (errMsg.toLowerCase().includes('expired')) {
        setTimeout(() => {
          navigate(`/events/${eventId}/book`);
        }, 1500);
      }
    } finally {
      setCreatingBooking(false);
    }
  };


  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
      <CustomerNavbar />

      <main style={{ flexGrow: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <BookingStepper currentStep={2} />

        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate(`/events/${eventId}/book`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              color: C.text,
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} /> Back to Ticket Selection
          </button>
        </div>

        {/* 15-Minute Reservation Expiration Timer */}
        {reservation && (
          <ReservationTimer expiresAt={reservation.expiresAt} onExpire={handleReservationExpired} />
        )}

        {/* Global Error Banner */}
        {error && (
          <div style={{ padding: '14px 18px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '14px', color: C.red, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* 2-Column Layout: Left (Customer Form), Right (Order Summary) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          {/* Left Attendee Form */}
          <form onSubmit={handleCreateBookingSubmit} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', color: C.text }}>
              Attendee & Ticket Holder Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>First Name *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Doe"
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Email Address (for ticket receipt) *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Mobile Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={creatingBooking}
              style={{
                marginTop: '10px',
                padding: '14px',
                background: C.gold,
                color: '#000000',
                border: 'none',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: 800,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: creatingBooking ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {creatingBooking ? 'Creating Order...' : 'Proceed to Order Summary'} <ArrowRight size={16} />
            </button>
          </form>

          {/* Right Summary Sidebar */}
          <div>
            <OrderSummaryCard event={event} items={selectedItemsArray} />
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
