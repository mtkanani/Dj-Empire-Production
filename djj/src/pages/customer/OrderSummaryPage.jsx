import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, FileText, CreditCard } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar.jsx';
import { CustomerFooter } from '../../components/customer/CustomerFooter.jsx';
import { BookingStepper } from '../../components/customer/booking/BookingStepper.jsx';
import { OrderSummaryCard } from '../../components/customer/booking/OrderSummaryCard.jsx';
import { useBooking } from '../../context/BookingContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export default function OrderSummaryPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { event, booking, selectedTickets, customerDetails } = useBooking();

  const selectedItemsArray = Object.values(selectedTickets || {}).map((it) => ({
    name: it.ticketType?.name || 'Standard Admission',
    price: it.ticketType?.price || 0,
    quantity: it.quantity || 1,
  }));

  const handleProceedToPayment = () => {
    navigate(`/events/${eventId}/booking/payment`);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
      <CustomerNavbar />

      <main style={{ flexGrow: 1, maxWidth: '900px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <BookingStepper currentStep={3} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate(`/events/${eventId}/booking/customer`)}
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
            <ArrowLeft size={16} /> Back to Details
          </button>
        </div>

        {/* Server Booking Order Summary Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Customer Confirmation Banner */}
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase' }}>Booking Order Reference</span>
              <h3 style={{ margin: '2px 0 0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', color: C.gold }}>
                #{booking?.bookingNumber || booking?.id || 'ORD-PENDING'}
              </h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: C.muted, display: 'block' }}>Recipient Email</span>
              <strong style={{ fontSize: '13px', color: C.text }}>{customerDetails?.email || 'Customer'}</strong>
            </div>
          </div>

          <OrderSummaryCard event={event} items={selectedItemsArray} booking={booking} />

          {/* Action CTA */}
          <button
            onClick={handleProceedToPayment}
            style={{
              width: '100%',
              padding: '16px',
              background: C.gold,
              color: '#000000',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: 800,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(234, 179, 8, 0.3)',
            }}
          >
            <CreditCard size={18} /> Select Payment Method & Checkout <ArrowRight size={18} />
          </button>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
