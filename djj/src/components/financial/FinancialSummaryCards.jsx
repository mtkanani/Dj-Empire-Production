import React from 'react';
import { DollarSign, CheckCircle2, RotateCcw, Percent, ShieldCheck, Scale } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { formatCurrency } from '../../utils/formatters.js';

export const FinancialSummaryCards = ({ metrics = {}, currency = 'INR' }) => {
  const gross = metrics.grossRevenue || 0;
  const platformFee = metrics.platformFee || gross * 0.10;
  const gatewayFee = metrics.gatewayFee || gross * 0.02;
  const taxAmount = metrics.taxAmount || gross * 0.18;
  const refundsTotal = metrics.refundsTotal || 0;
  const netRevenue = metrics.netRevenue || Math.max(0, gross - platformFee - gatewayFee - refundsTotal);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      {/* Gross Revenue */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.borderGold}`, borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: C.goldDim, color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DollarSign size={22} />
        </div>
        <div>
          <span style={{ fontSize: '11px', color: C.gold, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Gross Revenue</span>
          <h2 style={{ margin: '2px 0 0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', color: C.text }}>
            {formatCurrency(gross, currency)}
          </h2>
        </div>
      </div>

      {/* Net Payout */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: C.greenDim, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={22} />
        </div>
        <div>
          <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Settlement</span>
          <h2 style={{ margin: '2px 0 0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', color: C.green }}>
            {formatCurrency(netRevenue, currency)}
          </h2>
        </div>
      </div>

      {/* Refunds Total */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: C.redDim, color: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RotateCcw size={22} />
        </div>
        <div>
          <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Refunds Paid</span>
          <h2 style={{ margin: '2px 0 0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', color: C.red }}>
            {formatCurrency(refundsTotal, currency)}
          </h2>
        </div>
      </div>

      {/* Platform & Gateway Fees */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: C.blueDim, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Scale size={22} />
        </div>
        <div>
          <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Platform & Gateway Fees</span>
          <h2 style={{ margin: '2px 0 0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', color: C.blue }}>
            {formatCurrency(platformFee + gatewayFee, currency)}
          </h2>
        </div>
      </div>
    </div>
  );
};
