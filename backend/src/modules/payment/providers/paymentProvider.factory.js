import { RazorpayProvider } from './razorpay.provider.js';
import { PayPalProvider } from './paypal.provider.js';
import { StripeProvider } from './stripe.provider.js';
import { CashProvider } from './cash.provider.js';
import { BankTransferProvider } from './bankTransfer.provider.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Payment Provider Factory (Strategy Pattern Exporter)
 */
export class PaymentProviderFactory {
  /**
   * Get payment gateway provider instance based on explicit gateway name or requested currency
   * @param {string|null} gateway - RAZORPAY, PAYPAL, STRIPE, CASH, BANK_TRANSFER
   * @param {string} currency - ISO-4217 Currency Code (INR, USD, EUR, GBP, etc.)
   * @returns {IPaymentProvider}
   */
  static getProvider(gateway = null, currency = 'INR') {
    const selectedGateway = (gateway || this.selectDefaultGatewayForCurrency(currency)).toUpperCase();

    switch (selectedGateway) {
      case 'RAZORPAY':
        return new RazorpayProvider();
      case 'PAYPAL':
        return new PayPalProvider();
      case 'STRIPE':
        return new StripeProvider();
      case 'CASH':
        return new CashProvider();
      case 'BANK_TRANSFER':
        return new BankTransferProvider();
      default:
        throw new AppError(`Unsupported payment gateway provider [${selectedGateway}]`, HTTP_STATUS.BAD_REQUEST);
    }
  }

  /**
   * Selects recommended payment gateway based on ISO-4217 currency code
   */
  static selectDefaultGatewayForCurrency(currency = 'INR') {
    const curr = currency.toUpperCase();
    if (curr === 'INR') return 'RAZORPAY';
    if (['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD'].includes(curr)) return 'PAYPAL';
    return 'STRIPE';
  }
}
