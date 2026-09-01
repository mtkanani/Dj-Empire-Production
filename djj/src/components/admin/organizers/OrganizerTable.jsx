import React from 'react';
import { Building2 } from 'lucide-react';
import { OrganizerStatusBadge } from './OrganizerStatusBadge.jsx';
import { OrganizerActions } from './OrganizerActions.jsx';
import { C } from '../../../constants/theme.js';

const cell = { padding: '14px 16px', fontSize: '13px', color: C.text };

function Avatar({ name }) {
  const initials = (name || '?')
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
        background: `linear-gradient(135deg, ${C.goldDim}, ${C.blueDim})`,
        border: `1px solid ${C.borderGold}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: 700,
        color: C.gold,
        fontFamily: 'Space Grotesk, sans-serif',
        flexShrink: 0,
      }}
    >
      {initials || <Building2 size={14} />}
    </div>
  );
}

/**
 * Props:
 *   organizers  array of organizer user objects
 *   loading     boolean
 *   actionLoading  id string of the organizer being processed
 *   onView      callback(org)
 *   onApprove   callback(org)
 *   onReject    callback(org)
 *   onSuspend   callback(org)
 *   onActivate  callback(org)
 */
export function OrganizerTable({
  organizers = [],
  loading = false,
  actionLoading = null,
  onView,
  onApprove,
  onReject,
  onSuspend,
  onActivate,
}) {
  const COLS = [
    'Organization',
    'Contact',
    'Email',
    'Phone',
    'Status',
    'Events',
    'Joined',
    'Actions',
  ];

  return (
    <div
      style={{
        borderRadius: '16px',
        border: `1px solid ${C.border}`,
        background: C.panel,
        overflowX: 'auto',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Space Grotesk, sans-serif', minWidth: '900px' }}>
        <thead>
          <tr style={{ background: 'rgba(255, 215, 0, 0.06)', borderBottom: `1px solid ${C.borderGold}` }}>
            {COLS.map((col) => (
              <th
                key={col}
                style={{
                  padding: '14px 16px',
                  color: C.gold,
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  whiteSpace: 'nowrap',
                  textAlign: 'left',
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      border: `2px solid ${C.gold}`,
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>Loading organizers...</span>
                </div>
              </td>
            </tr>
          ) : organizers.length === 0 ? (
            <tr>
              <td colSpan={COLS.length} style={{ padding: '50px', textAlign: 'center', color: C.muted }}>
                <Building2 size={40} color={C.faint} style={{ marginBottom: '12px' }} />
                <br />
                No organizers found matching the current filters.
              </td>
            </tr>
          ) : (
            organizers.map((org, idx) => {
              const profile = org.organizerProfile || {};
              const companyName = profile.companyName || `${org.firstName || ''} ${org.lastName || ''}`.trim() || 'Unknown Organizer';
              const contactPerson = `${org.firstName || ''} ${org.lastName || ''}`.trim() || '—';
              const eventsCount = org.events?.length ?? org._count?.events ?? 0;
              const joinedDate = org.createdAt ? new Date(org.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
              const isLoading = actionLoading === org.id;

              return (
                <tr
                  key={org.id || idx}
                  style={{
                    borderBottom: idx === organizers.length - 1 ? 'none' : `1px solid ${C.border}`,
                    background: isLoading ? 'rgba(255,215,0,0.03)' : undefined,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isLoading ? 'rgba(255,215,0,0.03)' : ''; }}
                >
                  {/* Organization */}
                  <td style={cell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar name={companyName} />
                      <div>
                        <div style={{ color: C.text, fontWeight: 600, fontSize: '13px' }}>{companyName}</div>
                        {profile.registrationNumber && (
                          <div style={{ color: C.faint, fontSize: '11px' }}>#{profile.registrationNumber}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Contact Person */}
                  <td style={cell}>
                    <span style={{ color: C.muted }}>{contactPerson}</span>
                  </td>
                  {/* Email */}
                  <td style={cell}>
                    <span style={{ color: C.muted, fontSize: '12px' }}>{org.email || '—'}</span>
                  </td>
                  {/* Phone */}
                  <td style={cell}>
                    <span style={{ color: C.muted, fontSize: '12px' }}>{org.phone || profile.phone || '—'}</span>
                  </td>
                  {/* Status */}
                  <td style={cell}>
                    <OrganizerStatusBadge status={org.status} />
                  </td>
                  {/* Events count */}
                  <td style={{ ...cell, textAlign: 'center' }}>
                    <span style={{ color: C.blue, fontWeight: 700 }}>{eventsCount}</span>
                  </td>
                  {/* Joined */}
                  <td style={{ ...cell, whiteSpace: 'nowrap', color: C.faint, fontSize: '12px' }}>{joinedDate}</td>
                  {/* Actions */}
                  <td style={cell}>
                    <OrganizerActions
                      organizer={org}
                      loading={isLoading}
                      onView={onView}
                      onApprove={onApprove}
                      onReject={onReject}
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
