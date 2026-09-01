import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Download, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { paymentService } from '../../services/payment/paymentService.js';
import { formatDate, formatCurrency } from '../../utils/formatters.js';

export default function InvoicePage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await paymentService.getInvoice(bookingId);
        setInvoice(data);
      } catch (err) {
        setError(err.message || 'Unable to retrieve tax invoice for this booking.');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) fetchInvoice();
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#090B10', color: C.muted, padding: '80px 24px', textAlign: 'center' }}>
        Generating tax invoice document...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div style={{ minHeight: '100vh', background: '#090B10', color: '#FFF', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '20px', padding: '30px', color: C.red }}>
          <h3 style={{ margin: '0 0 8px' }}>Invoice Not Available</h3>
          <p style={{ margin: '0 0 20px', color: C.text, fontSize: '14px' }}>{error || 'Tax invoice details could not be retrieved.'}</p>
          <button onClick={() => navigate('/my-payments')} style={{ padding: '8px 16px', background: C.red, color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Return to Payments
          </button>
        </div>
      </div>
    );
  }

  const invoiceNumber = invoice.invoiceNumber || `INV-${bookingId?.slice(-8)}`;
  const bookingNumber = invoice.booking?.bookingNumber || bookingId;
  const event = invoice.booking?.event || {};
  const customer = invoice.customer || invoice.booking?.customer || {};
  const subtotal = invoice.subtotal || invoice.booking?.subtotal || 0;
  const gstAmount = invoice.gstAmount || invoice.taxAmount || invoice.booking?.gstAmount || 0;
  const totalAmount = invoice.totalAmount || invoice.booking?.totalAmount || 0;
  const currency = invoice.currency || invoice.booking?.currency || 'INR';

  return (
    <div style={{ minHeight: '100vh', background: '#090B10', color: '#E2E8F0', padding: '40px 20px' }}>
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print" style={{ maxWidth: '800px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate('/my-payments')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Back to Payments
        </button>

        <button
          onClick={handlePrint}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: C.gold, color: '#000', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}
        >
          <Printer size={16} /> Print / Save PDF Invoice
        </button>
      </div>

      {/* Printable Invoice Container */}
      <div
        id="printable-invoice"
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: '#FFFFFF',
          color: '#1E293B',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Header Branding */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #E2E8F0', paddingBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#0F172A', fontFamily: 'Space Grotesk, sans-serif' }}>
              TAX INVOICE
            </h1>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Original for Recipient</span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#EAB308', fontFamily: 'Space Grotesk, sans-serif' }}>
              EventPass SaaS
            </h2>
            <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>GSTIN: 27AAAAA0000A1Z5</span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>support@eventpass.com</span>
          </div>
        </div>

        {/* Invoice & Customer Meta */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', margin: '24px 0', fontSize: '13px' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Invoice Details</span>
            <div style={{ margin: '6px 0 2px', fontWeight: 700, color: '#0F172A' }}>Invoice #: {invoiceNumber}</div>
            <div style={{ color: '#475569' }}>Booking Ref: #{bookingNumber}</div>
            <div style={{ color: '#475569' }}>Invoice Date: {formatDate(invoice.createdAt || new Date())}</div>
            <div style={{ color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>Status: PAID & CONFIRMED</div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Billed To</span>
            <div style={{ margin: '6px 0 2px', fontWeight: 700, color: '#0F172A' }}>
              {customer.firstName ? `${customer.firstName} ${customer.lastName}` : customer.email || 'Customer'}
            </div>
            <div style={{ color: '#475569' }}>{customer.email}</div>
            {customer.phone && <div style={{ color: '#475569' }}>Phone: {customer.phone}</div>}
          </div>
        </div>

        {/* Line Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '24px 0', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textTransform: 'uppercase', fontSize: '11px', color: '#475569', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Description</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
              <td style={{ padding: '14px 12px' }}>
                <strong style={{ display: 'block', color: '#0F172A' }}>{event.title || 'Event Admission Tickets'}</strong>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Venue: {event.venue?.name || 'Venue TBA'}</span>
              </td>
              <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>
                {formatCurrency(subtotal, currency)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals & Tax Calculation */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid #E2E8F0', paddingTop: '16px', fontSize: '13px' }}>
          <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
              <span>GST Tax (18%)</span>
              <span>{formatCurrency(gstAmount, currency)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0F172A', paddingTop: '10px', marginTop: '4px', fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>
              <span>Total Paid</span>
              <span>{formatCurrency(totalAmount, currency)}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #E2E8F0', textAlign: 'center', fontSize: '11px', color: '#94A3B8' }}>
          This is a computer-generated tax invoice. No signature is required. Thank you for your business!
        </div>
      </div>
    </div>
  );
}
