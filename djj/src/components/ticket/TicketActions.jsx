import React, { useState } from 'react';
import { Download, Mail, Eye } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { customerBookingService } from '../../services/customer/customerBookingService.js';
import { useToast } from '../../hooks/useToast.js';

const toPdfBlob = (payload) => {
  if (payload instanceof Blob) {
    return payload.type ? payload : new Blob([payload], { type: 'application/pdf' });
  }
  return new Blob([payload], { type: 'application/pdf' });
};

const triggerPdfDownload = (payload, filename) => {
  const blob = toPdfBlob(payload);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const TicketActions = ({ bookingId, onView, compact = false }) => {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const file = await customerBookingService.downloadTicketPdf(bookingId);
      const blob = file?.blob || file;
      const filename = file?.filename || `tickets-${bookingId}.pdf`;
      triggerPdfDownload(blob, filename);
      showToast('Ticket PDF downloaded.', 'success');
    } catch (err) {
      showToast(err.message || 'Unable to download ticket PDF.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await customerBookingService.resendTicketEmail(bookingId);
      const data = res.data || res;
      showToast(res.message || `Ticket email resent with ${data.qrCodesAttached || ''} QR code(s).`, 'success');
    } catch (err) {
      showToast(err.message || 'Unable to resend ticket email. Booking remains valid.', 'error');
    } finally {
      setResending(false);
    }
  };

  const btnStyle = {
    padding: compact ? '8px 12px' : '12px 16px',
    borderRadius: '12px',
    fontWeight: 800,
    fontSize: compact ? '12px' : '13px',
    fontFamily: 'Space Grotesk, sans-serif',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    flex: 1,
  };

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {onView && (
        <button type="button" onClick={onView} style={{ ...btnStyle, background: C.gold, color: '#000', border: 'none' }}>
          <Eye size={16} /> View Ticket
        </button>
      )}
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        style={{ ...btnStyle, background: C.bgCard, color: C.text, border: `1px solid ${C.border}` }}
      >
        <Download size={16} /> {downloading ? 'Downloading…' : 'Download PDF'}
      </button>
      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        style={{ ...btnStyle, background: C.bgCard, color: C.gold, border: `1px solid ${C.borderGold}` }}
      >
        <Mail size={16} /> {resending ? 'Sending…' : 'Resend Email'}
      </button>
    </div>
  );
};
