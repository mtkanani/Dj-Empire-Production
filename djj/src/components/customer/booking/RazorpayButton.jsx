import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Lock } from 'lucide-react';
import { C } from '../../../constants/theme.js';
import { formatCurrency } from '../../../utils/formatters.js';

export const RazorpayButton = ({
  paymentOrder = null,
  customer = null,
  onSuccess,
  onFailure,
}) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Check your internet connection.');
      }

      if (!paymentOrder || !paymentOrder.gatewayOrderId) {
        throw new Error('Invalid payment order from server.');
      }

      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mockkey12345';

      const options = {
        key: keyId,
        amount: Math.round((paymentOrder.amount || paymentOrder.totalAmount || 100) * 100),
        currency: paymentOrder.currency || 'INR',
        name: 'EventPass SaaS',
        description: `Booking Checkout - Order #${paymentOrder.gatewayOrderId}`,
        order_id: paymentOrder.gatewayOrderId,
        prefill: {
          name: customer ? `${customer.firstName} ${customer.lastName}` : '',
          email: customer?.email || '',
          contact: customer?.phone || '',
        },
        theme: {
          color: '#EAB308',
        },
        handler: function (response) {
          // Send verification payload to parent handler
          onSuccess({
            paymentId: paymentOrder.paymentId || paymentOrder.id,
            gatewayOrderId: response.razorpay_order_id,
            gatewayPaymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            if (onFailure) onFailure('Payment checkout dismissed by user');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setLoading(false);
        if (onFailure) onFailure(resp.error?.description || 'Payment failed');
      });
      rzp.open();
    } catch (err) {
      setLoading(false);
      if (onFailure) onFailure(err.message || 'Unable to open Razorpay checkout');
    }
  };

  return (
    <button
      type="button"
      onClick={handleRazorpayPayment}
      disabled={loading || !paymentOrder}
      style={{
        width: '100%',
        padding: '14px 20px',
        background: C.gold,
        color: '#000000',
        border: 'none',
        borderRadius: '14px',
        fontSize: '15px',
        fontWeight: 800,
        fontFamily: 'Space Grotesk, sans-serif',
        cursor: loading || !paymentOrder ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxShadow: '0 4px 16px rgba(234, 179, 8, 0.3)',
      }}
    >
      <CreditCard size={18} />
      {loading ? 'Opening Checkout...' : `Pay ${formatCurrency(paymentOrder?.amount || paymentOrder?.totalAmount || 0, paymentOrder?.currency || 'INR')} via Razorpay`}
    </button>
  );
};
