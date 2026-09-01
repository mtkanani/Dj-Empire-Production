import React from 'react';
import { Mail, Phone, Calendar, Hash, UserCircle2 } from 'lucide-react';
import { CustomerStatusBadge } from './CustomerStatusBadge.jsx';
import { getCustomerDisplayName, formatCustomerDate } from '../../../utils/customerUtils.js';
import { C } from '../../../constants/theme.js';

/**
 * Info row helper
 */
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '10px 0',
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: C.blueDim,
          border: `1px solid ${C.borderBlue}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={14} color={C.blue} />
      </div>
      <div>
        <div style={{ color: C.faint, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
          {label}
        </div>
        <div style={{ color: C.text, fontSize: '13px', wordBreak: 'break-all' }}>
          {value || <span style={{ color: C.faint, fontStyle: 'italic' }}>Not provided</span>}
        </div>
      </div>
    </div>
  );
}

/**
 * CustomerProfileCard
 * Props:
 *   customer — full user object from GET /admin/customers/:id
 *
 * Renders only fields returned by the backend.
 * Backend returns: id, email, firstName, lastName, phone, status, createdAt
 * Fields NOT returned by backend (not displayed): address, city, country
 */
export function CustomerProfileCard({ customer }) {
  if (!customer) return null;

  const name = getCustomerDisplayName(customer);
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');
  const joinedDate = formatCustomerDate(customer.createdAt);

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.borderBlue}`,
        borderRadius: '20px',
        padding: '24px',
        boxShadow: `0 4px 20px ${C.blueDim}`,
      }}
    >
      {/* Profile header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px',
          paddingBottom: '20px',
          borderBottom: `1px solid ${C.border}`,
          flexWrap: 'wrap',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${C.blueDim}, ${C.purpleDim})`,
            border: `2px solid ${C.borderBlue}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 700,
            color: C.blue,
            fontFamily: 'Space Grotesk, sans-serif',
            flexShrink: 0,
          }}
        >
          {initials || <UserCircle2 size={28} color={C.blue} />}
        </div>

        {/* Name & status */}
        <div style={{ flexGrow: 1 }}>
          <div style={{ color: C.text, fontSize: '18px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            {name}
          </div>
          <div style={{ color: C.faint, fontSize: '12px', marginTop: '2px', fontFamily: 'monospace' }}>
            ID: {customer.id}
          </div>
        </div>

        <CustomerStatusBadge status={customer.status} size="lg" />
      </div>

      {/* Info rows */}
      <div>
        <InfoRow icon={Mail} label="Email Address" value={customer.email} />
        <InfoRow icon={Phone} label="Phone Number" value={customer.phone} />
        <InfoRow icon={Hash} label="Customer ID" value={customer.id} />
        <InfoRow icon={Calendar} label="Registered On" value={joinedDate} />
      </div>
    </div>
  );
}
