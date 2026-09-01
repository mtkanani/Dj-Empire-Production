import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar.jsx';
import { CustomerFooter } from '../../components/customer/CustomerFooter.jsx';

export default function PaymentFailedPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
      <CustomerNavbar />

      <main style={{ flexGrow: 1, maxWidth: '600px', width: '100%', margin: '60px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'center' }}>
        <div style={{ background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '24px', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={32} color="#FFFFFF" />
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '26px', fontWeight: 800, color: C.text, margin: 0 }}>
            Payment Failed or Declined
          </h1>
          <p style={{ color: C.text, fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
            Your payment request could not be completed by the gateway. No funds were debited, or the gateway signature verification failed.
          </p>
          {bookingId && (
            <span style={{ fontSize: '12px', color: C.muted, fontFamily: 'Space Grotesk, monospace' }}>
              Booking Reference: #{bookingId}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ padding: '12px 20px', background: C.gold, color: '#000000', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '13px', fontFamily: 'Space Grotesk, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={16} /> Retry Payment Now
          </button>
          <button
            onClick={() => navigate('/events')}
            style={{ padding: '12px 20px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '12px', color: C.muted, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} /> Return to Explore Events
          </button>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
