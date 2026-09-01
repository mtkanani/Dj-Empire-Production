import { CreditCard, DollarSign, Building2, Banknote, ShieldCheck } from 'lucide-react';

export const PAYMENT_GATEWAYS = {
  RAZORPAY: 'RAZORPAY',
  PAYPAL: 'PAYPAL',
  STRIPE: 'STRIPE',
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
};

export const PAYMENT_PROVIDERS = [
  {
    id: PAYMENT_GATEWAYS.RAZORPAY,
    name: 'Razorpay Gateway',
    description: 'Pay securely using UPI, Credit/Debit Cards, NetBanking, or Wallets',
    icon: CreditCard,
    color: '#EAB308',
    supportedCurrencies: ['INR'],
    isOnline: true,
    enabled: true,
  },
  {
    id: PAYMENT_GATEWAYS.PAYPAL,
    name: 'PayPal Express Checkout',
    description: 'Pay using international cards or PayPal account balance',
    icon: DollarSign,
    color: '#0070BA',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD'],
    isOnline: true,
    enabled: true,
  },
  {
    id: PAYMENT_GATEWAYS.STRIPE,
    name: 'Stripe Credit Cards',
    description: 'Pay directly using Visa, Mastercard, American Express',
    icon: ShieldCheck,
    color: '#635BFF',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'INR', 'AED', 'CAD'],
    isOnline: true,
    enabled: true,
  },
  {
    id: PAYMENT_GATEWAYS.BANK_TRANSFER,
    name: 'Direct Bank Wire Transfer',
    description: 'Transfer funds directly to organizer bank account via NEFT / IMPS / SWIFT',
    icon: Building2,
    color: '#10B981',
    supportedCurrencies: ['INR', 'USD', 'EUR'],
    isOnline: false,
    enabled: true,
  },
  {
    id: PAYMENT_GATEWAYS.CASH,
    name: 'Pay with Cash at Venue',
    description: 'Pay cash in person at the event entrance or ticket counter',
    icon: Banknote,
    color: '#F97316',
    supportedCurrencies: ['INR', 'USD'],
    isOnline: false,
    enabled: true,
  },
];
