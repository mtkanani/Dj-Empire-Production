import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Banknote, AlertCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { QRScanner } from '../../components/checkin/QRScanner.jsx';
import { organizerBookingService } from '../../services/organizer/organizerBookingService.js';
import { PaymentStatusBadge } from '../../components/payment/PaymentStatusBadge.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { tokenManager } from '../../utils/tokenManager.js';

export default function CashVerifyPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [bookingNumber, setBookingNumber] = useState(() => (searchParams.get('bookingNumber') || '').toUpperCase());
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState(null);

  const applyResult = (data) => {
    setBooking(data);
    setError(null);
  };

  const handleSearch = async (e) => {
    e?.preventDefault?.();
    if (!bookingNumber.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await organizerBookingService.lookupCashBooking(bookingNumber.trim());
      applyResult(res.data || res);
    } catch (err) {
      setBooking(null);
      setError(err.message || 'Booking not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingNumber.trim()) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScan = async (qrToken) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await organizerBookingService.lookupCashBookingQr(qrToken);
      applyResult(res.data || res);
    } catch (err) {
      setError(err.message || 'QR lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!booking) return;
    setVerifying(true);
    try {
      const res = await organizerBookingService.verifyCash(booking.bookingNumber);
      applyResult(res.data || res);
      setConfirmOpen(false);
      setMessage(res.message || 'Cash payment has been verified.');
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const isCashPending =
    booking &&
    booking.paymentGateway === 'CASH' &&
    booking.paymentStatus !== 'CASH_RECEIVED' &&
    booking.paymentStatus !== 'Paid';

  const openIdentity = async (documentId) => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
    const access = token || tokenManager.getAccessToken();
    const resp = await fetch(`${base}/identity-documents/${documentId}`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    if (!resp.ok) return;
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, margin: 0 }}>
          Cash Payment Verification
        </h1>
        <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '13px' }}>
          Search by Booking ID or scan the customer QR. Cash is never marked received until you confirm. Pending cash holds do not expire.
        </p>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          value={bookingNumber}
          onChange={(e) => setBookingNumber(e.target.value.toUpperCase())}
          placeholder="DJE-20260909-8F4K2M"
          style={{ flex: 1, minWidth: '240px', padding: '12px 14px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px', color: C.text, outline: 'none' }}
        />
        <button type="submit" style={{ padding: '12px 18px', background: C.gold, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Search size={16} /> Search
        </button>
      </form>

      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '16px' }}>
        <QRScanner onScan={handleScan} isScanning={!loading} />
      </div>

      {error && (
        <div style={{ padding: '14px', background: C.redDim, color: C.red, borderRadius: '12px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {message && (
        <div style={{ padding: '14px', background: C.greenDim, color: C.green, borderRadius: '12px' }}>{message}</div>
      )}

      {booking && (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase' }}>Booking ID</span>
              <h2 style={{ margin: 0, color: C.gold, fontFamily: 'Space Grotesk, sans-serif' }}>{booking.bookingNumber}</h2>
            </div>
            <PaymentStatusBadge status={booking.displayPaymentStatus || booking.paymentStatus} gateway={booking.paymentGateway} />
          </div>
          <div>Event: <strong>{booking.event?.title}</strong></div>
          <div>Customer: {booking.customer?.firstName} {booking.customer?.lastName}</div>
          <div>Tickets: {booking.quantity} · Method: {booking.paymentGateway || '—'}</div>
          <div style={{ fontSize: 22, color: C.gold, fontWeight: 800 }}>
            Expected Amount: {formatCurrency(booking.totalAmount || 0, booking.currency || 'INR')}
          </div>
          <div>
            <h4 style={{ margin: '8px 0' }}>Attendees</h4>
            <ol>
              {(booking.attendees || []).map((a) => (
                <li key={a.id} style={{ marginBottom: 8 }}>
                  {a.fullName} · {a.mobileNumber}
                  {a.identityDocumentId && (
                    <button type="button" onClick={() => openIdentity(a.identityDocumentId)} style={{ marginLeft: 8, background: 'transparent', color: C.gold, border: 'none', cursor: 'pointer' }}>
                      View ID
                    </button>
                  )}
                </li>
              ))}
            </ol>
          </div>
          {isCashPending ? (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              style={{ padding: '14px', background: C.gold, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Banknote size={18} /> Mark Cash as Received
            </button>
          ) : booking.paymentGateway !== 'CASH' ? (
            <p style={{ color: C.muted, margin: 0 }}>This booking is not a cash payment.</p>
          ) : ['Cancelled', 'Expired'].includes(booking.bookingStatus) || ['Cancelled', 'Expired', 'Failed'].includes(booking.paymentStatus) ? (
            <p style={{ color: C.red, margin: 0 }}>This booking is no longer eligible for cash verification.</p>
          ) : (
            <p style={{ color: C.green, margin: 0 }}>Cash payment has already been verified.</p>
          )}
        </div>
      )}

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Cash Payment">
        <p style={{ color: C.text, lineHeight: 1.5 }}>
          Have you physically received the full cash amount of {formatCurrency(booking?.totalAmount || 0, booking?.currency || 'INR')} for booking {booking?.bookingNumber}? Partial payments are not supported.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button loading={verifying} onClick={handleVerify}>Confirm Cash Received</Button>
        </div>
      </Modal>
    </div>
  );
}
