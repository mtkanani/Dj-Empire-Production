import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, AlertCircle, Upload, User } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar.jsx';
import { Footer } from '../../components/Layout.jsx';
import { BookingStepper } from '../../components/customer/booking/BookingStepper.jsx';
import { ReservationTimer } from '../../components/customer/booking/ReservationTimer.jsx';
import { OrderSummaryCard } from '../../components/customer/booking/OrderSummaryCard.jsx';
import { useBooking } from '../../context/BookingContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../hooks/useToast.js';
import { validatePhone } from '../../utils/validation.js';
import { identityDocumentService } from '../../services/customer/identityDocumentService.js';

const emptyAttendee = (index, user) => ({
  fullName: index === 0 ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : '',
  mobileNumber: index === 0 ? user?.phone || '' : '',
  identityDocumentId: '',
  fileName: '',
});

export default function CustomerDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { event, selectedTickets, reservation, attendees, setAttendees, setCustomerDetails } = useBooking();

  const totalQty = useMemo(
    () => Object.values(selectedTickets || {}).reduce((acc, it) => acc + (it.quantity || 0), 0) || 1,
    [selectedTickets]
  );

  const [rows, setRows] = useState(() =>
    Array.from({ length: totalQty }, (_, i) => attendees[i] || emptyAttendee(i, user))
  );
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setRows((prev) =>
      Array.from({ length: totalQty }, (_, i) => prev[i] || attendees[i] || emptyAttendee(i, user))
    );
  }, [totalQty]);

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

  const updateRow = (index, patch) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const handleUpload = async (index, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Identity document must be a JPEG, PNG, or WebP image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Identity document must be 5 MB or smaller');
      return;
    }
    setUploadingIndex(index);
    setError(null);
    try {
      const res = await identityDocumentService.upload(file);
      const data = res.data || res;
      updateRow(index, { identityDocumentId: data.id, fileName: file.name });
    } catch (err) {
      setError(err.message || 'Failed to upload identity document');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reservation?.expiresAt && new Date(reservation.expiresAt) <= new Date()) {
      handleReservationExpired();
      return;
    }
    if (rows.length !== totalQty) {
      setError(`Enter details for all ${totalQty} attendees`);
      return;
    }
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (!row.fullName?.trim() || row.fullName.trim().length < 2) {
        setError(`Attendee ${i + 1}: full name is required`);
        return;
      }
      const phoneErr = validatePhone(row.mobileNumber);
      if (phoneErr) {
        setError(`Attendee ${i + 1}: ${phoneErr}`);
        return;
      }
    }

    setAttendees(rows);
    setCustomerDetails({
      firstName: rows[0]?.fullName?.split(' ')[0] || user?.firstName || '',
      lastName: rows[0]?.fullName?.split(' ').slice(1).join(' ') || user?.lastName || '',
      email: user?.email || '',
      phone: rows[0]?.mobileNumber || user?.phone || '',
      notes: '',
    });
    navigate(`/events/${eventId}/booking/summary`);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
      <CustomerNavbar />
      <main style={{ flexGrow: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <BookingStepper currentStep={2} />
        <button
          onClick={() => navigate(`/events/${eventId}/book`)}
          style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '6px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Back to Ticket Selection
        </button>
        {reservation && <ReservationTimer expiresAt={reservation.expiresAt} onExpire={handleReservationExpired} />}
        {error && (
          <div style={{ padding: '14px 18px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '14px', color: C.red, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px' }}>
              Attendee details ({totalQty} ticket{totalQty > 1 ? 's' : ''})
            </h3>
            <p style={{ margin: 0, color: C.muted, fontSize: '13px' }}>
              Enter information for every person attending. Name and mobile are required. Identity-document photo is optional.
            </p>
            {rows.map((row, index) => (
              <div key={index} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <strong style={{ color: C.gold, fontFamily: 'Space Grotesk, sans-serif' }}>
                  <User size={14} style={{ marginRight: 6 }} /> Attendee {index + 1}
                </strong>
                <label style={{ color: C.muted, fontSize: '12px', fontWeight: 600 }}>Full Name *</label>
                <input
                  required
                  value={row.fullName}
                  onChange={(e) => updateRow(index, { fullName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
                <label style={{ color: C.muted, fontSize: '12px', fontWeight: 600 }}>Mobile Number *</label>
                <input
                  required
                  type="tel"
                  value={row.mobileNumber}
                  onChange={(e) => updateRow(index, { mobileNumber: e.target.value })}
                  placeholder="e.g. 9876543210"
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
                <label style={{ color: C.muted, fontSize: '12px', fontWeight: 600 }}>
                  Identity Document (optional photo)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '12px', border: `1px dashed ${C.borderGold}`, cursor: 'pointer', color: C.gold }}>
                  <Upload size={16} />
                  {uploadingIndex === index ? 'Uploading…' : row.fileName || 'Upload ID Photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={(e) => handleUpload(index, e.target.files?.[0])}
                  />
                </label>
              </div>
            ))}
            <button
              type="submit"
              disabled={uploadingIndex !== null}
              style={{ padding: '14px', background: C.gold, color: '#000', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Proceed to Order Summary <ArrowRight size={16} />
            </button>
          </form>
          <OrderSummaryCard event={event} items={selectedItemsArray} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
