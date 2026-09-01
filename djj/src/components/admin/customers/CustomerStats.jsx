import React from 'react';
import { Ticket, CheckCircle2, XCircle, Clock, IndianRupee } from 'lucide-react';
import { computeCustomerStats, formatCustomerAmount } from '../../../utils/customerUtils.js';
import { C } from '../../../constants/theme.js';

/**
 * Stat tile
 */
function StatTile({ icon: Icon, label, value, color, bg, border }) {
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${border || C.border}`,
        borderRadius: '16px',
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        flex: '1 1 150px',
        minWidth: '140px',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: bg,
          border: `1px solid ${border || C.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ color, fontSize: '22px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
          {value ?? '—'}
        </div>
        <div style={{ color: C.muted, fontSize: '12px', marginTop: '3px' }}>{label}</div>
      </div>
    </div>
  );
}

/**
 * CustomerStats
 * Computes statistics from the bookings array returned by GET /admin/customers/:id.
 * The backend does not provide pre-aggregated stats; we compute them client-side.
 *
 * Props:
 *   bookings — array of booking objects included in customer detail response
 */
export function CustomerStats({ bookings = [] }) {
  const { total, confirmed, cancelled, pending, totalSpent } = computeCustomerStats(bookings);

  return (
    <div>
      <h3
        style={{
          color: C.blue,
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '15px',
          fontWeight: 700,
          margin: '0 0 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Ticket size={15} /> Booking Statistics
      </h3>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <StatTile
          icon={Ticket}
          label="Total Bookings"
          value={total}
          color={C.blue}
          bg={C.blueDim}
          border={C.borderBlue}
        />
        <StatTile
          icon={CheckCircle2}
          label="Confirmed"
          value={confirmed}
          color={C.green}
          bg={C.greenDim}
          border={C.green}
        />
        <StatTile
          icon={Clock}
          label="Pending"
          value={pending}
          color={C.amber}
          bg={C.amberDim}
          border={C.amber}
        />
        <StatTile
          icon={XCircle}
          label="Cancelled"
          value={cancelled}
          color={C.red}
          bg={C.redDim}
          border={C.red}
        />
        <StatTile
          icon={IndianRupee}
          label="Total Spent"
          value={formatCustomerAmount(totalSpent)}
          color={C.gold}
          bg={C.goldDim}
          border={C.borderGold}
        />
      </div>
    </div>
  );
}
