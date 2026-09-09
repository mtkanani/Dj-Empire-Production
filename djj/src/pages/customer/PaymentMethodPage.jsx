import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { customerBookingService } from '../../services/customer/customerBookingService.js';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar.jsx';
import { Footer } from '../../components/Layout.jsx';
import { BookingStepper } from '../../components/customer/booking/BookingStepper.jsx';
import { OrderSummaryCard } from '../../components/customer/booking/OrderSummaryCard.jsx';
import { CashPaymentInstructions } from '../../components/payment/CashPaymentInstructions.jsx';
import { useBooking } from '../../context/BookingContext.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function PaymentMethodPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { event, selectedTickets, reservation, attendees, setBooking } = useBooking();

  const [selectedGateway, setSelectedGateway] = useState('CASH');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const selectedItemsArray = Object.values(selectedTickets || {}).map((it) => ({
    ticketTypeId: it.ticketType?.id || it.ticketTypeId,
    sectionId: it.ticketType?.sectionId || it.sectionId,
    name: it.ticketType?.name || 'Standard Admission',
    price: it.ticketType?.price || 0,
    quantity: it.quantity || 1,
  }));

  const totalQty = selectedItemsArray.reduce((acc, i) => acc + (i.quantity || 0), 0) || attendees.length || 1;

  const handleCashConfirm = async () => {
    if (!attendees?.length || attendees.length !== totalQty) {
      setError('Attendee details are incomplete. Go back and fill every ticket.');
      return;
    }
    const identityOptional = import.meta.env.DEV;
    if (
      attendees.some(
        (a) => !a.fullName || !a.mobileNumber || (!identityOptional && !a.identityDocumentId)
      )
    ) {
      setError(
        identityOptional
          ? 'Every attendee needs a name and mobile number.'
          : 'Every attendee needs a name, mobile number, and identity document.'
      );
      return;
    }

    const isValidHex24 = (str) => typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str);
    const primaryTicketId = isValidHex24(selectedItemsArray[0]?.ticketTypeId) ? selectedItemsArray[0].ticketTypeId : undefined;
    const primarySectionId = isValidHex24(selectedItemsArray[0]?.sectionId) ? selectedItemsArray[0].sectionId : undefined;
    const validItems = selectedItemsArray
      .filter((it) => isValidHex24(it.ticketTypeId))
      .map((it) => ({
        ticketTypeId: it.ticketTypeId,
        sectionId: isValidHex24(it.sectionId) ? it.sectionId : undefined,
        quantity: it.quantity,
        unitPrice: it.price || 0,
      }));

    setSubmitting(true);
    setError(null);
    try {
      const res = await customerBookingService.createBooking({
        eventId,
        ticketTypeId: primaryTicketId,
        sectionId: primarySectionId,
        quantity: totalQty,
        items: validItems.length > 0 ? validItems : undefined,
        reservationNumber: reservation?.reservationNumber || reservation?.id || undefined,
        paymentGateway: 'CASH',
        attendees: attendees.map((a) => ({
          fullName: a.fullName,
          mobileNumber: a.mobileNumber,
          ...(a.identityDocumentId ? { identityDocumentId: a.identityDocumentId } : {}),
        })),
      });
      const bookingData = res.data || res;
      setBooking(bookingData);
      showToast('Booking created. Cash payment is pending verification.', 'success');
      navigate(`/booking/${bookingData.id || bookingData._id}/success`);
    } catch (err) {
      const errMsg = err.message || 'Failed to create cash booking.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
      <CustomerNavbar />
      <main style={{ flexGrow: 1, maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <BookingStepper currentStep={4} />
        <button
          onClick={() => navigate(`/events/${eventId}/booking/summary`)}
          style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '6px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Back to Summary
        </button>
        {error && (
          <div style={{ padding: '14px 18px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '14px', color: C.red, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px' }}>Payment Method</h3>

            <div
              onClick={() => setSelectedGateway('CASH')}
              style={{
                padding: '16px',
                borderRadius: '14px',
                border: `1px solid ${selectedGateway === 'CASH' ? C.borderGold : C.border}`,
                background: selectedGateway === 'CASH' ? C.goldDim : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Banknote size={20} color={C.gold} />
                <div>
                  <strong style={{ color: C.text, display: 'block', fontSize: '14px' }}>Cash Payment</strong>
                  <span style={{ color: C.muted, fontSize: '12px' }}>Pay cash to the authorised event organizer/admin</span>
                </div>
              </div>
              {selectedGateway === 'CASH' && <CheckCircle2 size={18} color={C.gold} />}
            </div>

            <div
              style={{
                padding: '16px',
                borderRadius: '14px',
                border: `1px solid ${C.border}`,
                background: 'rgba(255,255,255,0.02)',
                opacity: 0.55,
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <CreditCard size={20} color={C.muted} />
              <div>
                <strong style={{ color: C.text, display: 'block', fontSize: '14px' }}>Razorpay (UPI, Cards)</strong>
                <span style={{ color: C.muted, fontSize: '12px' }}>Online payment — coming soon</span>
              </div>
            </div>

            {selectedGateway === 'CASH' && (
              <>
                <CashPaymentInstructions bookingNumber="issued after confirm" />
                <p style={{ margin: 0, color: C.muted, fontSize: '13px', lineHeight: 1.5 }}>
                  Your booking will be created as pending until the cash payment is received and verified by an authorised administrator or organizer. It does not expire. Keep your Booking ID available for payment verification.
                </p>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCashConfirm}
                  style={{ padding: '14px', background: C.gold, color: '#000', border: 'none', borderRadius: '14px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Creating booking…' : 'Confirm Cash Booking'}
                </button>
              </>
            )}
          </div>
          <OrderSummaryCard event={event} items={selectedItemsArray} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
