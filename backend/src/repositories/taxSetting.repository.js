import { prisma } from '../config/prisma.js';

export class TaxSettingRepository {
  /**
   * Get current active Tax & GST setting
   */
  static async getActiveTaxSetting() {
    let setting = await prisma.taxSetting.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!setting) {
      // Create default 18% GST setting if none exists
      setting = await prisma.taxSetting.create({
        data: {
          gstRate: 18.0,
          cgstRate: 9.0,
          sgstRate: 9.0,
          igstRate: 18.0,
          platformFee: 20.0,
          serviceFee: 0.0,
          isActive: true,
        },
      });
    }

    return setting;
  }

  /**
   * Update or Upsert Admin Tax & GST Setting
   */
  static async updateTaxSetting(data) {
    const current = await this.getActiveTaxSetting();

    return prisma.taxSetting.update({
      where: { id: current.id },
      data: {
        gstRate: data.gstRate !== undefined ? data.gstRate : current.gstRate,
        cgstRate: data.cgstRate !== undefined ? data.cgstRate : current.cgstRate,
        sgstRate: data.sgstRate !== undefined ? data.sgstRate : current.sgstRate,
        igstRate: data.igstRate !== undefined ? data.igstRate : current.igstRate,
        platformFee: data.platformFee !== undefined ? data.platformFee : current.platformFee,
        serviceFee: data.serviceFee !== undefined ? data.serviceFee : current.serviceFee,
        gstNumber: data.gstNumber !== undefined ? data.gstNumber : current.gstNumber,
        isActive: data.isActive !== undefined ? data.isActive : current.isActive,
      },
    });
  }
}
