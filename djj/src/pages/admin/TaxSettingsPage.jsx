import React, { useState, useEffect, useCallback } from 'react';
import { Receipt, Save, Percent, IndianRupee, ShieldCheck, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { taxService } from '../../services/admin/taxService.js';
import { useToast } from '../../hooks/useToast.js';

/**
 * TaxSettingsPage
 *
 * Connects to:
 *   GET  /admin/tax-settings  → loads current active TaxSetting record
 *   POST /admin/tax-settings  → upserts the active TaxSetting record
 *
 * TaxSetting schema (verified from schema.prisma + taxSetting.repository.js):
 *   gstRate     Float  (default 18.0)  — overall GST; backend auto-derives cgst/sgst when this changes
 *   cgstRate    Float  (default 9.0)   — auto = gstRate/2 (display read-only)
 *   sgstRate    Float  (default 9.0)   — auto = gstRate/2 (display read-only)
 *   igstRate    Float  (default 18.0)  — inter-state GST (equals gstRate)
 *   platformFee Float  (default 20.0)  — flat ₹ per ticket (not a percentage)
 *   serviceFee  Float  (default 0.0)   — flat ₹ service fee
 *   gstNumber   String (optional)      — Admin Business GSTIN
 *   isActive    Boolean
 *
 * NOTE: No country, state, or currency fields exist in the TaxSetting model.
 *       Do NOT display fields that are not in the backend schema.
 */

function FieldBlock({ icon: Icon, label, help, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.muted, fontSize: '12px', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {Icon && <Icon size={13} color={C.gold} />} {label}
      </label>
      {children}
      {help && <p style={{ color: C.faint, fontSize: '11px', margin: '5px 0 0', lineHeight: '1.5' }}>{help}</p>}
    </div>
  );
}

function NumInput({ value, onChange, disabled, ...rest }) {
  return (
    <input
      type="number"
      step="0.01"
      min="0"
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        width: '100%', background: disabled ? C.panel2 : C.panel,
        border: `1px solid ${C.border}`, borderRadius: '10px',
        color: disabled ? C.muted : C.text, fontSize: '14px', padding: '10px 12px',
        fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box',
        cursor: disabled ? 'not-allowed' : 'auto',
      }}
      {...rest}
    />
  );
}

function Section({ title, color }) {
  return (
    <div style={{
      color: color || C.gold, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '1px', margin: '24px 0 14px', paddingBottom: '8px',
      borderBottom: `1px solid ${C.border}`,
    }}>
      {title}
    </div>
  );
}

export default function TaxSettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    gstRate: 18,
    igstRate: 18,
    platformFee: 20,
    serviceFee: 0,
    gstNumber: '',
  });

  // Derived read-only rates (auto-calculated by backend when gstRate changes)
  const cgstRate = parseFloat((form.gstRate / 2).toFixed(2));
  const sgstRate = parseFloat((form.gstRate / 2).toFixed(2));

  // ── Fetch current settings ──
  const fetchSettings = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await taxService.getTaxSettings();
      // TaxSettingController uses a different ApiResponse.success call pattern.
      // The response body is: { success: true, message: ..., data: {...taxFields} }
      // or the raw object if controller uses: ApiResponse.success(settings, message, statusCode)
      // Either way our api.js interceptor returns the full body, so check both paths.
      const data = res?.data || res;
      if (data && typeof data === 'object') {
        setForm({
          gstRate: data.gstRate ?? 18,
          igstRate: data.igstRate ?? 18,
          platformFee: data.platformFee ?? 20,
          serviceFee: data.serviceFee ?? 0,
          gstNumber: data.gstNumber ?? '',
        });
      }
    } catch (err) {
      setError(err?.message || 'Unable to load tax settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // ── Validate ──
  const [valErrors, setValErrors] = useState({});
  const validate = () => {
    const e = {};
    if (form.gstRate < 0 || form.gstRate > 100) e.gstRate = 'GST Rate must be between 0 and 100.';
    if (form.igstRate < 0 || form.igstRate > 100) e.igstRate = 'IGST Rate must be between 0 and 100.';
    if (form.platformFee < 0) e.platformFee = 'Platform fee cannot be negative.';
    if (form.serviceFee < 0) e.serviceFee = 'Service fee cannot be negative.';
    return e;
  };

  // ── Save ──
  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    setValErrors(errs);
    if (Object.keys(errs).length) return;

    setSaveLoading(true); setSaved(false);
    try {
      await taxService.updateTaxSettings({
        gstRate: Number(form.gstRate),
        igstRate: Number(form.igstRate),
        platformFee: Number(form.platformFee),
        serviceFee: Number(form.serviceFee),
        gstNumber: form.gstNumber?.trim() || null,
      });
      showToast('Tax settings saved successfully.', 'success');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      showToast(err?.message || 'Unable to save tax settings.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' }}>
        <div style={{ width: '36px', height: '36px', border: `2px solid ${C.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: C.muted, fontFamily: 'Space Grotesk, sans-serif' }}>Loading tax settings...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px' }}>
        <AlertCircle size={40} color={C.red} style={{ marginBottom: '12px' }} />
        <p style={{ color: C.red, fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '16px' }}>{error}</p>
        <button onClick={fetchSettings} style={{ background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '12px', color: C.red, padding: '10px 24px', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Space Grotesk, sans-serif', maxWidth: '720px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: C.goldDim, border: `1px solid ${C.borderGold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Receipt size={18} color={C.gold} />
          </div>
          <h1 style={{ color: C.gold, fontSize: '22px', fontWeight: 700, margin: 0 }}>Tax & GST Settings</h1>
        </div>
        <p style={{ color: C.muted, fontSize: '13px', margin: '0 0 0 50px' }}>
          Configure GST rates and platform fees applied at checkout. Changes affect future bookings only.
        </p>
      </div>

      {/* Main card */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.borderGold}`, borderRadius: '24px', padding: '28px 32px', boxShadow: `0 8px 30px ${C.goldDim}` }}>
        <form onSubmit={handleSave}>

          <Section title="GST Rates" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FieldBlock icon={Percent} label="Overall GST Rate (%)" help="When changed, CGST and SGST are automatically set to gstRate/2 by the backend.">
              <NumInput value={form.gstRate} onChange={(e) => setForm({ ...form, gstRate: e.target.value })} max={100} />
              {valErrors.gstRate && <p style={{ color: C.red, fontSize: '11px', margin: '4px 0 0' }}>{valErrors.gstRate}</p>}
            </FieldBlock>

            <FieldBlock icon={Percent} label="IGST Rate (%)" help="Applied for inter-state transactions.">
              <NumInput value={form.igstRate} onChange={(e) => setForm({ ...form, igstRate: e.target.value })} max={100} />
              {valErrors.igstRate && <p style={{ color: C.red, fontSize: '11px', margin: '4px 0 0' }}>{valErrors.igstRate}</p>}
            </FieldBlock>
          </div>

          {/* Auto-derived rates (read-only) */}
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '14px 18px', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.blue, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              <Info size={13} /> Auto-Derived Rates (read-only)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[['CGST Rate', cgstRate], ['SGST Rate', sgstRate]].map(([label, val]) => (
                <div key={label} style={{ background: C.panel2, borderRadius: '8px', padding: '10px 14px' }}>
                  <div style={{ color: C.faint, fontSize: '11px', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                  <div style={{ color: C.muted, fontSize: '20px', fontWeight: 700 }}>{val}%</div>
                </div>
              ))}
            </div>
            <p style={{ color: C.faint, fontSize: '11px', margin: '8px 0 0' }}>
              Backend automatically recalculates CGST and SGST when the overall GST Rate is saved.
            </p>
          </div>

          <Section title="Platform Fees" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FieldBlock icon={IndianRupee} label="Platform Fee (₹ per ticket)" help="Flat amount charged per ticket, not a percentage.">
              <NumInput value={form.platformFee} onChange={(e) => setForm({ ...form, platformFee: e.target.value })} />
              {valErrors.platformFee && <p style={{ color: C.red, fontSize: '11px', margin: '4px 0 0' }}>{valErrors.platformFee}</p>}
            </FieldBlock>
            <FieldBlock icon={IndianRupee} label="Service Fee (₹)" help="Additional flat service charge per order.">
              <NumInput value={form.serviceFee} onChange={(e) => setForm({ ...form, serviceFee: e.target.value })} />
              {valErrors.serviceFee && <p style={{ color: C.red, fontSize: '11px', margin: '4px 0 0' }}>{valErrors.serviceFee}</p>}
            </FieldBlock>
          </div>

          <Section title="GST Registration" />

          <FieldBlock icon={ShieldCheck} label="Business GSTIN (optional)" help="Platform's GST Identification Number, printed on invoices.">
            <input
              type="text"
              value={form.gstNumber}
              onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
              placeholder="e.g. 27AAAAA0000A1Z5"
              maxLength={15}
              style={{ width: '100%', background: C.panel, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', padding: '10px 12px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', textTransform: 'uppercase' }}
            />
          </FieldBlock>

          {/* Preview */}
          <div style={{ background: 'rgba(255,215,0,0.06)', border: `1px solid ${C.borderGold}`, borderRadius: '14px', padding: '16px 18px', marginBottom: '24px' }}>
            <div style={{ color: C.gold, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              📊 Current Configuration Preview
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              {[
                { label: 'GST', value: `${form.gstRate}%` },
                { label: 'CGST', value: `${cgstRate}%` },
                { label: 'SGST', value: `${sgstRate}%` },
                { label: 'IGST', value: `${form.igstRate}%` },
                { label: 'Platform Fee', value: `₹${form.platformFee}` },
                { label: 'Service Fee', value: `₹${form.serviceFee}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: C.panel, borderRadius: '8px', padding: '8px 12px' }}>
                  <div style={{ color: C.faint, fontSize: '11px' }}>{label}</div>
                  <div style={{ color: C.gold, fontWeight: 700, fontSize: '15px' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={saveLoading}
            style={{
              width: '100%', padding: '13px', borderRadius: '14px',
              border: `1px solid ${C.borderGold}`, background: C.goldDim,
              color: C.gold, fontSize: '15px', fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif', cursor: saveLoading ? 'not-allowed' : 'pointer',
              opacity: saveLoading ? 0.6 : 1, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px', transition: 'all 0.2s',
            }}
          >
            {saveLoading ? (
              <><div style={{ width: '16px', height: '16px', border: `2px solid ${C.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Saving...</>
            ) : saved ? (
              <><CheckCircle2 size={16} /> Saved!</>
            ) : (
              <><Save size={16} /> Save Tax Configuration</>
            )}
          </button>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
