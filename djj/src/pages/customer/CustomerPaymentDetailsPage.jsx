import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, FileText, ShieldCheck, Calendar, CheckCircle2 } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { paymentService } from '../../services/payment/paymentService.js';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar.jsx';
import { CustomerFooter } from '../../components/customer/CustomerFooter.jsx';
import { PaymentStatusBadge } from '../../components/payment/PaymentStatusBadge.jsx';
import { formatDate, formatCurrency } from '../../utils/formatters.js';

export default function CustomerPaymentDetailsPage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayment = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await paymentService.getPaymentDetails(paymentId);
        setPayment(data);
      } catch (err) {
        setError(err.message || 'Unable to retrieve payment transaction details.');
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) fetchPayment();
  }, [paymentId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
        <CustomerNavbar />
        <div style={{ flexGrow: 1, padding: '80px 24px', textAlign: 'center', color: C.muted }}>Loading transaction details...</div>
        <CustomerFooter />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
        <CustomerNavbar />
        <div style={{ flexGrow: 1, maxWidth: '600px', margin: '80px auto', padding: '40px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '20px', color: C.red, textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontFamily: 'Space Grotesk, sans-serif' }}>Payment Record Not Found</h3>
          <p style={{ margin: '0 0 20px', color: C.text, fontSize: '14px' }}>{error || 'Transaction details could not be retrieved.'}</p>
          <button onClick={() => navigate('/my-payments')} style={{ padding: '10px 20px', background: C.red, color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
            Back to Payment History
          </button>
        </div>
        <CustomerFooter />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
      <CustomerNavbar />

      <main style={{ flexGrow: 1, maxWidth: '800px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('/my-payments')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            <ArrowLeft size={16} /> Back to Payment History
          </button>

          {payment.bookingId && (
            <button
              onClick={() => navigate(`/invoices/${payment.bookingId}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.gold, color: '#000', border: 'none', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
            >
              <FileText size={16} /> View Tax Invoice
            </button>
          )}
        </div>

        {/* Payment Transaction Details Card */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase' }}>Transaction Reference</span>
              <h2 style={{ margin: '2px 0 0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', color: C.gold }}>
                #{payment.paymentNumber || payment.id}
              </h2>
            </div>
            <PaymentStatusBadge status={payment.paymentStatus} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
            <div>
              <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>Payment Gateway</span>
              <strong style={{ color: C.text }}>{payment.gateway}</strong>
            </div>

            <div>
              <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>Gateway Order ID</span>
              <strong style={{ color: C.text, fontFamily: 'Space Grotesk, monospace' }}>{payment.gatewayOrderId || 'N/A'}</strong>
            </div>

            <div>
              <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>Gateway Transaction / Payment ID</span>
              <strong style={{ color: C.text, fontFamily: 'Space Grotesk, monospace' }}>{payment.gatewayPaymentId || payment.gatewayTransactionId || 'N/A'}</strong>
            </div>

            <div>
              <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>Transaction Timestamp</span>
              <strong style={{ color: C.text }}>{formatDate(payment.createdAt)}</strong>
            </div>
          </div>

          {/* Breakdown */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: C.muted }}>
              <span>Subtotal</span>
              <span style={{ color: C.text }}>{formatCurrency(payment.subtotal || 0, payment.currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: C.muted }}>
              <span>GST Tax (18%)</span>
              <span style={{ color: C.text }}>{formatCurrency(payment.taxAmount || 0, payment.currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: C.gold, fontSize: '16px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', borderTop: `1px solid ${C.borderGold}`, paddingTop: '12px', marginTop: '4px' }}>
              <span>Total Paid</span>
              <span>{formatCurrency(payment.totalAmount || 0, payment.currency)}</span>
            </div>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
