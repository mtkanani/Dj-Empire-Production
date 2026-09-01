import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShieldCheck, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { customerPaymentService } from '../../services/customer/customerPaymentService.js';
import { customerBookingService } from '../../services/customer/customerBookingService.js';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar.jsx';
import { CustomerFooter } from '../../components/customer/CustomerFooter.jsx';
import { BookingStepper } from '../../components/customer/booking/BookingStepper.jsx';
import { RazorpayButton } from '../../components/customer/booking/RazorpayButton.jsx';
import { PayPalButton } from '../../components/customer/booking/PayPalButton.jsx';
import { OrderSummaryCard } from '../../components/customer/booking/OrderSummaryCard.jsx';
import { useBooking } from '../../context/BookingContext.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function PaymentMethodPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { event, booking, selectedTickets, customerDetails, setPayment } = useBooking();

  const [selectedGateway, setSelectedGateway] = useState('RAZORPAY'); // 'RAZORPAY' or 'PAYPAL'
  const [createdPaymentOrder, setCreatedPaymentOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);

  const selectedItemsArray = Object.values(selectedTickets || {}).map((it) => ({
    name: it.ticketType?.name || 'Standard Admission',
    price: it.ticketType?.price || 0,
    quantity: it.quantity || 1,
  }));

  // Create Gateway Order Call
  const handleInitiateGatewayOrder = async (gateway) => {
    if (!booking?.id && !booking?._id) {
      setError('Booking order not found. Please return to order summary.');
      return;
    }

    setLoadingOrder(true);
    setError(null);
    try {
      const bookingId = booking.id || booking._id;
      const res = await customerPaymentService.createPaymentOrder({
        bookingId,
        gateway,
        currency: booking.currency || 'INR',
      });
      const orderData = res.data || res;

      setCreatedPaymentOrder(orderData);
      setPayment(orderData);
    } catch (err) {
      setError(err.message || 'Failed to create payment order with gateway.');
      showToast(err.message || 'Payment order creation failed', 'error');
    } finally {
      setLoadingOrder(false);
    }
  };

  // Payment Verification Handler
  const handlePaymentSuccess = async (verifyPayload) => {
    setVerifying(true);
    setError(null);
    try {
      const res = await customerPaymentService.verifyPayment(verifyPayload);
      const verifyResult = res.data || res;

      showToast('Payment verified successfully! Booking confirmed.', 'success');
      const bookingId = booking?.id || booking?._id || verifyPayload.paymentId;
      navigate(`/booking/${bookingId}/success`);
    } catch (err) {
      setError(err.message || 'Payment verification failed server-side.');
      showToast(err.message || 'Verification failed', 'error');
      const bookingId = booking?.id || booking?._id || 'unknown';
      navigate(`/booking/${bookingId}/failed`);
    } finally {
      setVerifying(false);
    }
  };

  const handlePaymentFailure = (msg) => {
    setError(msg || 'Payment failed or cancelled.');
    showToast(msg || 'Payment cancelled', 'error');
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
      <CustomerNavbar />

      <main style={{ flexGrow: 1, maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <BookingStepper currentStep={4} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate(`/events/${eventId}/booking/summary`)}
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
            <ArrowLeft size={16} /> Back to Summary
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div style={{ padding: '14px 18px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '14px', color: C.red, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* 2-Column Payment Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          {/* Gateway Selector */}
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', color: C.text }}>
              Select Payment Method
            </h3>

            {/* Gateway Radio Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                onClick={() => {
                  setSelectedGateway('RAZORPAY');
                  handleInitiateGatewayOrder('RAZORPAY');
                }}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: `1px solid ${selectedGateway === 'RAZORPAY' ? C.borderGold : C.border}`,
                  background: selectedGateway === 'RAZORPAY' ? C.goldDim : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CreditCard size={20} color={C.gold} />
                  <div>
                    <strong style={{ color: C.text, display: 'block', fontSize: '14px' }}>Razorpay Payment Gateway</strong>
                    <span style={{ color: C.muted, fontSize: '12px' }}>UPI, Cards, NetBanking, Wallets (INR)</span>
                  </div>
                </div>
                {selectedGateway === 'RAZORPAY' && <CheckCircle2 size={18} color={C.gold} />}
              </div>

              <div
                onClick={() => {
                  setSelectedGateway('PAYPAL');
                  handleInitiateGatewayOrder('PAYPAL');
                }}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: `1px solid ${selectedGateway === 'PAYPAL' ? C.borderGold : C.border}`,
                  background: selectedGateway === 'PAYPAL' ? C.goldDim : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CreditCard size={20} color={C.blue} />
                  <div>
                    <strong style={{ color: C.text, display: 'block', fontSize: '14px' }}>PayPal Express Checkout</strong>
                    <span style={{ color: C.muted, fontSize: '12px' }}>International Credit Cards & PayPal Balance</span>
                  </div>
                </div>
                {selectedGateway === 'PAYPAL' && <CheckCircle2 size={18} color={C.gold} />}
              </div>
            </div>

            {/* Execute Payment Button */}
            <div style={{ marginTop: '10px' }}>
              {verifying ? (
                <div style={{ padding: '16px', textAlign: 'center', background: C.goldDim, borderRadius: '14px', color: C.gold, fontWeight: 700 }}>
                  Verifying Gateway Signature Server-Side...
                </div>
              ) : selectedGateway === 'RAZORPAY' ? (
                <RazorpayButton
                  paymentOrder={createdPaymentOrder}
                  customer={customerDetails}
                  onSuccess={handlePaymentSuccess}
                  onFailure={handlePaymentFailure}
                />
              ) : (
                <PayPalButton
                  paymentOrder={createdPaymentOrder}
                  onSuccess={handlePaymentSuccess}
                  onFailure={handlePaymentFailure}
                />
              )}
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div>
            <OrderSummaryCard event={event} items={selectedItemsArray} booking={booking} />
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
