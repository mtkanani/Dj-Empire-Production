import React from 'react';
import { Ticket, CheckCircle2, Clock, Percent, Scan } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const AttendanceOverviewCards = ({ stats = {} }) => {
  const total = stats.totalSeats || stats.totalTickets || 0;
  const checkedIn = stats.checkedInCount || stats.checkedIn || 0;
  const remaining = stats.remaining || Math.max(0, total - checkedIn);
  const occupancy = stats.occupancyPercentage ?? stats.attendanceRate ?? (total > 0 ? parseFloat(((checkedIn / total) * 100).toFixed(1)) : 0);
  const attempts = stats.totalScansAttempted || checkedIn;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      {/* Total Sold */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: C.goldDim, color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ticket size={22} />
        </div>
        <div>
          <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Tickets Sold</span>
          <h2 style={{ margin: '2px 0 0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', color: C.text }}>
            {total.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* Checked In */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: C.greenDim, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={22} />
        </div>
        <div>
          <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Checked-In</span>
          <h2 style={{ margin: '2px 0 0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', color: C.green }}>
            {checkedIn.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* Remaining */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: C.blueDim, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Clock size={22} />
        </div>
        <div>
          <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remaining Unused</span>
          <h2 style={{ margin: '2px 0 0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', color: C.blue }}>
            {remaining.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* Occupancy Rate */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.borderGold}`, borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.15)', color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Percent size={22} />
        </div>
        <div>
          <span style={{ fontSize: '11px', color: C.gold, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Occupancy Rate</span>
          <h2 style={{ margin: '2px 0 0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', color: C.text }}>
            {occupancy}%
          </h2>
        </div>
      </div>

      {/* Total Scans Attempted */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.04)', color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Scan size={22} />
        </div>
        <div>
          <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scan Attempts</span>
          <h2 style={{ margin: '2px 0 0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', color: C.text }}>
            {attempts.toLocaleString()}
          </h2>
        </div>
      </div>
    </div>
  );
};
