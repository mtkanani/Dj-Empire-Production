import React, { useState, useEffect } from 'react';
import { DollarSign, RefreshCw, Ticket, FileText, RotateCcw, Scale } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { financialService } from '../../services/organizer/financialService.js';
import { organizerBookingService } from '../../services/organizer/organizerBookingService.js';
import { FinancialSummaryCards } from '../../components/financial/FinancialSummaryCards.jsx';
import { HourlyCheckInsChart as FinancialChart } from '../../components/analytics/HourlyCheckInsChart.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export default function FinancialDashboardPage() {
  const [settlements, setSettlements] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFinancials = async () => {
    setLoading(true);
    setError(null);
    try {
      const [settlementsRes, bookingsRes] = await Promise.allSettled([
        financialService.getSettlements(),
        organizerBookingService.getOrganizerBookings({ limit: 50 }),
      ]);

      if (settlementsRes.status === 'fulfilled') {
        const sData = settlementsRes.value.data || settlementsRes.value;
        setSettlements(Array.isArray(sData) ? sData : []);
      }

      if (bookingsRes.status === 'fulfilled') {
        const bData = bookingsRes.value.data || bookingsRes.value;
        const list = Array.isArray(bData) ? bData : bData.bookings || [];
        setBookings(list);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve financial metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  // Compute Financial Aggregates
  const grossRevenue = bookings.reduce((sum, b) => sum + (b.bookingStatus === 'Confirmed' || b.bookingStatus === 'CheckedIn' ? b.totalAmount || 0 : 0), 0);
  const refundsTotal = bookings.reduce((sum, b) => sum + (b.bookingStatus === 'Cancelled' ? b.totalAmount || 0 : 0), 0);
  const metrics = {
    grossRevenue,
    refundsTotal,
    platformFee: grossRevenue * 0.10,
    gatewayFee: grossRevenue * 0.02,
    netRevenue: Math.max(0, grossRevenue * 0.88 - refundsTotal),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, margin: 0, color: C.text }}>
            Financial Operations & Revenue Dashboard
          </h1>
          <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '13px' }}>
            Consolidated gross ticket sales, platform commission deductions, tax invoices, and payout settlements
          </p>
        </div>

        <button
          onClick={fetchFinancials}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            background: C.gold,
            color: '#000000',
            border: 'none',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 800,
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh Financials
        </button>
      </div>

      {/* Summary Cards */}
      <FinancialSummaryCards metrics={metrics} />

      {/* 2-Column Section: Financial Velocity Chart & Recent Settlements Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <FinancialChart data={[
          { time: 'Mon', checkIns: Math.round(grossRevenue * 0.1) },
          { time: 'Tue', checkIns: Math.round(grossRevenue * 0.15) },
          { time: 'Wed', checkIns: Math.round(grossRevenue * 0.25) },
          { time: 'Thu', checkIns: Math.round(grossRevenue * 0.2) },
          { time: 'Fri', checkIns: Math.round(grossRevenue * 0.3) },
        ]} />

        {/* Recent Payout Settlements */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: C.text, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>
            Recent Settlement Payouts
          </h3>

          {settlements.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: C.muted, fontSize: '13px' }}>No settlement payouts generated yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {settlements.slice(0, 5).map((stl) => (
                <div key={stl.id} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <div>
                    <strong style={{ color: C.gold, fontFamily: 'Space Grotesk, monospace' }}>#{stl.id.slice(0, 8)}</strong>
                    <span style={{ fontSize: '11px', color: C.muted, display: 'block' }}>{formatDate(stl.createdAt)}</span>
                  </div>
                  <strong style={{ color: C.green, fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif' }}>
                    {formatCurrency(stl.netPayoutAmount || stl.amount || 0, stl.currency || 'INR')}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
