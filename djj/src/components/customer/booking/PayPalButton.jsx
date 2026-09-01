import React, { useState } from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { C } from '../../../constants/theme.js';
import { formatCurrency } from '../../../utils/formatters.js';

export const PayPalButton = ({
  paymentOrder = null,
  onSuccess,
  onFailure,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayPalPayment = async () => {
    setLoading(true);
    try {
      if (!paymentOrder || !paymentOrder.gatewayOrderId) {
        throw new Error('Invalid PayPal payment order from server.');
      }

      // Simulate PayPal Checkout flow returning capture signature to server
      setTimeout(() => {
        onSuccess({
          paymentId: paymentOrder.paymentId || paymentOrder.id,
          gatewayOrderId: paymentOrder.gatewayOrderId,
          gatewayPaymentId: `PAYPAL-PAY-${Date.now()}`,
          signature: `PAYPAL-SIG-${Date.now()}`,
        });
      }, 1000);
    } catch (err) {
      setLoading(false);
      if (onFailure) onFailure(err.message || 'PayPal checkout failed');
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayPalPayment}
      disabled={loading || !paymentOrder}
      style={{
        width: '100%',
        padding: '14px 20px',
        background: '#0070BA',
        color: '#FFFFFF',
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
      }}
    >
      <CreditCard size={18} />
      {loading ? 'Processing PayPal...' : `Pay ${formatCurrency(paymentOrder?.amount || paymentOrder?.totalAmount || 0, paymentOrder?.currency || 'USD')} with PayPal`}
    </button>
  );
};
