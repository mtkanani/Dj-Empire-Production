import { api } from '../api.js';

/**
 * Tax Settings Service
 * Verified against admin.route.js, taxSetting.controller.js, taxSetting.service.js, taxSetting.repository.js
 *
 * Routes:
 *   GET  /admin/tax-settings  → getTaxSettings
 *   POST /admin/tax-settings  → updateTaxSettings (upsert: always updates existing active record)
 *
 * TaxSetting schema fields (all floats):
 *   gstRate     (default 18.0)    — When set, backend auto-derives cgstRate & sgstRate
 *   cgstRate    (default 9.0)     — auto-derived from gstRate/2
 *   sgstRate    (default 9.0)     — auto-derived from gstRate/2
 *   igstRate    (default 18.0)
 *   platformFee (default 20.0)    — flat ₹ per ticket
 *   serviceFee  (default 0.0)
 *   gstNumber   (optional string) — Admin Business GSTIN
 *   isActive    (boolean)
 *
 * NOTE: taxSetting.controller.js uses a different ApiResponse.success() call signature.
 * Response shape: { success: true, message: ..., data: { id, gstRate, ... } }
 * (The tax controller calls: ApiResponse.success(settings, message, statusCode)
 *  which returns the data as the first positional arg — still wrapped in success:true from the ApiResponse class).
 * The api.js interceptor returns response.data, so the caller receives the full response body.
 */
export const taxService = {
  /**
   * Get current active tax configuration.
   * If no record exists, backend auto-creates a default 18% GST record.
   */
  getTaxSettings: () => api.get('/admin/tax-settings'),

  /**
   * Update tax settings (upsert on the active record).
   * Only sends fields the admin has edited; backend preserves others.
   * When gstRate changes, backend auto-recalculates cgstRate and sgstRate.
   */
  updateTaxSettings: (data) => api.post('/admin/tax-settings', data),
};
