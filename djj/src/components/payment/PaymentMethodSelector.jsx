import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { PAYMENT_PROVIDERS } from '../../services/payment/paymentProviderRegistry.js';

export const PaymentMethodSelector = ({
  selectedMethod = 'RAZORPAY',
  onSelectMethod,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {PAYMENT_PROVIDERS.map((provider) => {
        const Icon = provider.icon;
        const isSelected = selectedMethod === provider.id;

        return (
          <div
            key={provider.id}
            onClick={() => onSelectMethod(provider.id)}
            style={{
              padding: '16px 20px',
              borderRadius: '16px',
              border: `1px solid ${isSelected ? C.borderGold : C.border}`,
              background: isSelected ? C.goldDim : 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              transition: 'all 0.2s ease',
              boxShadow: isSelected ? '0 4px 16px rgba(234, 179, 8, 0.1)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: provider.color,
                }}
              >
                <Icon size={20} />
              </div>

              <div>
                <strong
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    color: isSelected ? C.gold : C.text,
                    fontFamily: 'Space Grotesk, sans-serif',
                  }}
                >
                  {provider.name}
                </strong>
                <span style={{ fontSize: '12px', color: C.muted }}>
                  {provider.description}
                </span>
              </div>
            </div>

            {isSelected && <CheckCircle2 size={20} color={C.gold} />}
          </div>
        );
      })}
    </div>
  );
};
