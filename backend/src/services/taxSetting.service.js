import { TaxSettingRepository } from '../repositories/taxSetting.repository.js';

export class TaxSettingService {
  /**
   * Get Active Admin Tax Settings
   */
  static async getTaxSettings() {
    return TaxSettingRepository.getActiveTaxSetting();
  }

  /**
   * Update Admin Tax & GST Rules
   */
  static async updateTaxSettings(data) {
    if (data.gstRate !== undefined) {
      data.cgstRate = parseFloat((data.gstRate / 2).toFixed(2));
      data.sgstRate = parseFloat((data.gstRate / 2).toFixed(2));
      data.igstRate = data.gstRate;
    }
    return TaxSettingRepository.updateTaxSetting(data);
  }

  /**
   * Public checkout rates (no GSTIN / internal ids).
   */
  static async getPublicTaxSettings() {
    const settings = await TaxSettingRepository.getActiveTaxSetting();
    return {
      gstRate: settings.gstRate ?? 0,
      cgstRate: settings.cgstRate ?? 0,
      sgstRate: settings.sgstRate ?? 0,
      igstRate: settings.igstRate ?? 0,
      platformFee: settings.platformFee ?? 0,
      serviceFee: settings.serviceFee ?? 0,
    };
  }

  /**
   * Quote an order from original ticket-type line items (not client-supplied totals).
   * Ticket-type fees win when set; otherwise admin tax settings apply.
   */
  static quoteOrder(lineItems = [], taxSetting = {}) {
    const items = (lineItems || []).map((item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = parseFloat(Number(item.unitPrice) || 0);
      return {
        ...item,
        quantity,
        unitPrice,
        lineSubtotal: parseFloat((unitPrice * quantity).toFixed(2)),
      };
    });

    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = parseFloat(items.reduce((sum, item) => sum + item.lineSubtotal, 0).toFixed(2));
    const hasTicketPlatform = items.some((item) => Number(item.platformFee) > 0);
    const platformFee = parseFloat(
      (hasTicketPlatform
        ? items.reduce((sum, item) => sum + item.quantity * (Number(item.platformFee) || 0), 0)
        : totalQty * (Number(taxSetting.platformFee) || 0)
      ).toFixed(2)
    );
    const bookingFee = parseFloat(
      items.reduce((sum, item) => sum + item.quantity * (Number(item.bookingFee) || 0), 0).toFixed(2)
    );
    const hasTicketService = items.some((item) => Number(item.serviceCharge) > 0);
    const serviceCharge = parseFloat(
      (hasTicketService
        ? items.reduce((sum, item) => sum + item.quantity * (Number(item.serviceCharge) || 0), 0)
        : Number(taxSetting.serviceFee) || 0
      ).toFixed(2)
    );
    const gstRate = Number(taxSetting.gstRate) || 0;
    const taxableAmount = parseFloat((subtotal + platformFee + bookingFee + serviceCharge).toFixed(2));
    const gstAmount = parseFloat((taxableAmount * (gstRate / 100)).toFixed(2));
    const totalAmount = parseFloat((taxableAmount + gstAmount).toFixed(2));

    return {
      items,
      totalQty,
      subtotal,
      platformFee,
      bookingFee,
      serviceCharge,
      serviceFee: serviceCharge,
      taxableAmount,
      gstRate,
      gstAmount,
      cgstAmount: parseFloat((gstAmount / 2).toFixed(2)),
      sgstAmount: parseFloat((gstAmount / 2).toFixed(2)),
      totalAmount,
    };
  }

  /**
   * Calculate Ticket Taxes & Platform Fees
   * @param {number} ticketQuantity Number of tickets
   * @param {number} unitPrice Price per ticket
   */
  static async calculateOrderTax(ticketQuantity, unitPrice) {
    const taxSetting = await TaxSettingRepository.getActiveTaxSetting();
    return this.quoteOrder([{ quantity: ticketQuantity, unitPrice }], taxSetting);
  }

  static async quoteOrderWithSettings(lineItems = []) {
    const taxSetting = await this.getPublicTaxSettings();
    return this.quoteOrder(lineItems, taxSetting);
  }
}
