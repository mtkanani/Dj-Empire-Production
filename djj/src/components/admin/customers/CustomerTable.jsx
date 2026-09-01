import React from 'react';
import { UserCircle2 } from 'lucide-react';
import { CustomerStatusBadge } from './CustomerStatusBadge.jsx';
import { CustomerActions } from './CustomerActions.jsx';
import { getCustomerDisplayName, formatCustomerDate } from '../../../utils/customerUtils.js';
import { C } from '../../../constants/theme.js';

/**
 * Customer avatar — shows initials from name.
 */
function CustomerAvatar({ customer }) {
  const name = getCustomerDisplayName(customer);
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  return (
    <div
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: `linear-gradient(135deg, ${C.blueDim}, ${C.purpleDim})`,
        border: `1px solid ${C.borderBlue}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: 700,
        color: C.blue,
        fontFamily: 'Space Grotesk, sans-serif',
        flexShrink: 0,
      }}
    >
      {initials || <UserCircle2 size={16} />}
    </div>
  );
}

const cell = { padding: '13px 16px', fontSize: '13px', color: C.text };

const COLS = [
  'Customer',
  'Email',
  'Phone',
  'Status',
  'Bookings',
  'Joined',
  'Actions',
];

/**
 * CustomerTable
 * Props:
 *   customers      array of customer objects from GET /admin/customers
 *   loading        boolean
 *   actionLoading  string|null — id of customer being acted upon
 *   onView         (customer) => void
 *   onSuspend      (customer) => void
 *   onActivate     (customer) => void
 */
export function CustomerTable({
  customers = [],
  loading = false,
  actionLoading = null,
  onView,
  onSuspend,
  onActivate,
}) {
  return (
    <div
      style={{
        borderRadius: '16px',
        border: `1px solid ${C.border}`,
        background: C.panel,
        overflowX: 'auto',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'Space Grotesk, sans-serif',
          minWidth: '820px',
        }}
      >
        <thead>
          <tr
            style={{
              background: 'rgba(0, 229, 255, 0.05)',
              borderBottom: `1px solid ${C.borderBlue}`,
            }}
          >
            {COLS.map((col) => (
              <th
                key={col}
                style={{
                  padding: '14px 16px',
                  color: C.blue,
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={COLS.length} style={{ padding: '40px', textAlign: 'center', color: C.muted }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      border: `2px solid ${C.blue}`,
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>Loading customers...</span>
                </div>
              </td>
            </tr>
          ) : customers.length === 0 ? (
            <tr>
              <td colSpan={COLS.length} style={{ padding: '50px', textAlign: 'center', color: C.muted }}>
                <UserCircle2 size={40} color={C.faint} style={{ marginBottom: '10px', display: 'block', margin: '0 auto 12px' }} />
                No customers found matching the current filters.
              </td>
            </tr>
          ) : (
            customers.map((customer, idx) => {
              const name = getCustomerDisplayName(customer);
              const bookingCount = customer._count?.bookings ?? '—';
              const joinedDate = formatCustomerDate(customer.createdAt);
              const isProcessing = actionLoading === customer.id;

              return (
                <tr
                  key={customer.id || idx}
                  style={{
                    borderBottom: idx === customers.length - 1 ? 'none' : `1px solid ${C.border}`,
                    background: isProcessing ? 'rgba(0,229,255,0.03)' : undefined,
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isProcessing ? 'rgba(0,229,255,0.03)' : ''; }}
                  onClick={() => onView?.(customer)}
                >
                  {/* Customer name + avatar */}
                  <td style={cell} onClick={(e) => e.stopPropagation()}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                      onClick={() => onView?.(customer)}
                    >
                      <CustomerAvatar customer={customer} />
                      <div>
                        <div style={{ color: C.text, fontWeight: 600, fontSize: '13px' }}>{name}</div>
                        <div style={{ color: C.faint, fontSize: '11px' }}>ID: {customer.id?.slice(-8) || '—'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ ...cell, maxWidth: '200px' }} onClick={(e) => e.stopPropagation()}>
                    <span style={{ color: C.muted, fontSize: '12px', wordBreak: 'break-all' }}>
                      {customer.email || '—'}
                    </span>
                  </td>

                  {/* Phone */}
                  <td style={{ ...cell }} onClick={(e) => e.stopPropagation()}>
                    <span style={{ color: C.muted, fontSize: '12px' }}>
                      {customer.phone || '—'}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={cell} onClick={(e) => e.stopPropagation()}>
                    <CustomerStatusBadge status={customer.status} />
                  </td>

                  {/* Booking count */}
                  <td style={{ ...cell, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <span style={{ color: C.blue, fontWeight: 700 }}>{bookingCount}</span>
                  </td>

                  {/* Joined date */}
                  <td style={{ ...cell, whiteSpace: 'nowrap', color: C.faint, fontSize: '12px' }} onClick={(e) => e.stopPropagation()}>
                    {joinedDate}
                  </td>

                  {/* Actions */}
                  <td style={cell} onClick={(e) => e.stopPropagation()}>
                    <CustomerActions
                      customer={customer}
                      loading={isProcessing}
                      onView={onView}
                      onSuspend={onSuspend}
                      onActivate={onActivate}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
