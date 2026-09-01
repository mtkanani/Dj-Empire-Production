import React, { useState, useEffect } from 'react';
import { Scale, CheckCircle2, Clock, FileText, RefreshCw } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { financialService } from '../../services/organizer/financialService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettlements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await financialService.getSettlements();
      const data = res.data || res;
      setSettlements(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to retrieve settlement payouts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, margin: 0, color: C.text }}>
            Organizer Payout Settlements & Remittances
          </h1>
          <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '13px' }}>
            Inspect settlement cycles, platform commission deductions, gateway processing fees, and net payout balances
          </p>
        </div>

        <button
          onClick={fetchSettlements}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px', color: C.text, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh Payouts
        </button>
      </div>

      {/* Settlements Table */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading settlement payouts...</div>
      ) : settlements.length === 0 ? (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '60px 24px', textAlign: 'center', color: C.muted }}>
          <Scale size={42} color={C.muted} style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
            No Settlement Records
          </h3>
          <p style={{ margin: 0, fontSize: '13px' }}>Payout settlements generate on weekly/bi-weekly financial cycles after event completion.</p>
        </div>
      ) : (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '14px 16px' }}>Settlement Ref</th>
                <th style={{ padding: '14px 16px' }}>Gross Revenue</th>
                <th style={{ padding: '14px 16px' }}>Platform Fee (10%)</th>
                <th style={{ padding: '14px 16px' }}>Net Payout Amount</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Payout Date</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((stl) => {
                const gross = stl.grossAmount || stl.amount || 0;
                const platformFee = stl.platformFee || gross * 0.10;
                const net = stl.netPayoutAmount || gross - platformFee;

                return (
                  <tr key={stl.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '14px 16px', color: C.gold, fontFamily: 'Space Grotesk, monospace', fontWeight: 700 }}>
                      #STL-{stl.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: '14px 16px', color: C.text, fontWeight: 600 }}>
                      {formatCurrency(gross, stl.currency || 'INR')}
                    </td>
                    <td style={{ padding: '14px 16px', color: C.muted }}>
                      {formatCurrency(platformFee, stl.currency || 'INR')}
                    </td>
                    <td style={{ padding: '14px 16px', color: C.green, fontWeight: 800 }}>
                      {formatCurrency(net, stl.currency || 'INR')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '8px', background: C.greenDim, color: C.green, fontWeight: 700, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> {stl.status || 'PAID'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', color: C.muted }}>
                      {formatDate(stl.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
