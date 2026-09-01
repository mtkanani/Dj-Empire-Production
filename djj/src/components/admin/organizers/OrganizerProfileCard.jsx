import React from 'react';
import {
  Building2, Mail, Phone, Globe, MapPin, Calendar, Hash, User2,
} from 'lucide-react';
import { OrganizerStatusBadge } from './OrganizerStatusBadge.jsx';
import { C } from '../../../constants/theme.js';

function InfoRow({ icon: Icon, label, value, href }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '10px 0',
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px',
        background: C.goldDim, border: `1px solid ${C.borderGold}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={14} color={C.gold} />
      </div>
      <div>
        <div style={{ color: C.faint, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
          {label}
        </div>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" style={{ color: C.blue, fontSize: '13px', textDecoration: 'none' }}>
            {value || '—'}
          </a>
        ) : (
          <div style={{ color: C.text, fontSize: '13px', wordBreak: 'break-all' }}>{value || '—'}</div>
        )}
      </div>
    </div>
  );
}

/**
 * OrganizerProfileCard
 * Props:
 *   organizer — full organizer user object from GET /admin/organizers/:id
 */
export function OrganizerProfileCard({ organizer }) {
  const profile = organizer?.organizerProfile || {};
  const companyName = profile.companyName || `${organizer?.firstName || ''} ${organizer?.lastName || ''}`.trim() || 'Unnamed Organizer';
  const contactPerson = `${organizer?.firstName || ''} ${organizer?.lastName || ''}`.trim();
  const joinedDate = organizer?.createdAt
    ? new Date(organizer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const approvalStatus = profile.approvalStatus;
  const approvalBadgeColors = {
    APPROVED: { bg: C.greenDim, border: C.green, color: C.green },
    PENDING: { bg: C.amberDim, border: C.amber, color: C.amber },
    REJECTED: { bg: C.redDim, border: C.red, color: C.red },
  };
  const approvalStyle = approvalBadgeColors[approvalStatus] || { bg: C.panel, border: C.border, color: C.muted };

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.borderGold}`,
        borderRadius: '20px',
        padding: '24px',
        boxShadow: `0 4px 20px ${C.goldDim}`,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '20px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '16px',
          background: `linear-gradient(135deg, ${C.goldDim}, ${C.blueDim})`,
          border: `2px solid ${C.borderGold}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', fontWeight: 700, color: C.gold, fontFamily: 'Space Grotesk, sans-serif',
          flexShrink: 0,
        }}>
          {companyName[0]?.toUpperCase() || <Building2 size={24} />}
        </div>
        <div style={{ flexGrow: 1 }}>
          <div style={{ color: C.gold, fontSize: '18px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            {companyName}
          </div>
          {contactPerson && (
            <div style={{ color: C.muted, fontSize: '13px', marginTop: '2px' }}>Contact: {contactPerson}</div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
          <OrganizerStatusBadge status={organizer?.status} size="lg" />
          {approvalStatus && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
              background: approvalStyle.bg, border: `1px solid ${approvalStyle.border}`, color: approvalStyle.color,
            }}>
              Application: {approvalStatus}
            </span>
          )}
        </div>
      </div>

      {/* Info rows */}
      <div>
        <InfoRow icon={Mail} label="Email Address" value={organizer?.email} />
        <InfoRow icon={Phone} label="Phone Number" value={organizer?.phone || profile.phone} />
        <InfoRow icon={Hash} label="Registration Number" value={profile.registrationNumber} />
        <InfoRow icon={User2} label="Contact Person" value={contactPerson || '—'} />
        <InfoRow icon={MapPin} label="Business Address" value={profile.address} />
        <InfoRow icon={Globe} label="Website" value={profile.website} href={profile.website} />
        <InfoRow icon={Calendar} label="Registered On" value={joinedDate} />

        {/* Rejection Reason */}
        {profile.rejectionReason && (
          <div style={{
            marginTop: '16px', padding: '14px 16px', borderRadius: '12px',
            background: C.redDim, border: `1px solid ${C.red}`,
          }}>
            <div style={{ color: C.red, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Rejection Reason
            </div>
            <div style={{ color: C.text, fontSize: '13px', lineHeight: '1.6' }}>
              {profile.rejectionReason}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
