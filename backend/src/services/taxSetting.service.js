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
   * Calculate Ticket Taxes & Platform Fees
   * @param {number} ticketQuantity Number of tickets
   * @param {number} unitPrice Price per ticket
   */
  static async calculateOrderTax(ticketQuantity, unitPrice) {
    const taxSetting = await TaxSettingRepository.getActiveTaxSetting();

    const subtotal = parseFloat((ticketQuantity * unitPrice).toFixed(2));
    const platformFee = parseFloat((ticketQuantity * (taxSetting.platformFee || 0)).toFixed(2));
    const serviceFee = parseFloat((taxSetting.serviceFee || 0).toFixed(2));
    
    const taxableAmount = subtotal + platformFee + serviceFee;
    const gstRate = taxSetting.gstRate || 18.0;
    const gstAmount = parseFloat((taxableAmount * (gstRate / 100)).toFixed(2));
    const totalAmount = parseFloat((taxableAmount + gstAmount).toFixed(2));

    return {
      subtotal,
      platformFee,
      serviceFee,
      taxableAmount,
      gstRate,
      gstAmount,
      cgstAmount: parseFloat((gstAmount / 2).toFixed(2)),
      sgstAmount: parseFloat((gstAmount / 2).toFixed(2)),
      totalAmount,
    };
  }
}
