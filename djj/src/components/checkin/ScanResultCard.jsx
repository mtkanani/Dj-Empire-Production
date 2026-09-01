import React from 'react';
import { CheckCircle2, XCircle, UserCheck } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const ScanResultCard = ({ result = null, onScanNext }) => {
  if (!result) return null;

  const isAllowed = result.valid === true;
  const customerName = result.customerName || 'Ticket Holder';
  const bookingRef = result.bookingNumber || 'BK-REF';
  const sectionName = result.section?.name || 'General Admission';
  const ticketType = result.section?.ticketType || 'Standard';
  const ticketCode = result.ticketCode || null;
  const group = result.groupCheckinSummary || null;

  return (
    <div
      style={{
        background: isAllowed ? C.greenDim : C.redDim,
        border: `2px solid ${isAllowed ? C.green : C.red}`,
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        textAlign: 'center',
        boxShadow: isAllowed ? '0 12px 30px rgba(16, 185, 129, 0.2)' : '0 12px 30px rgba(239, 68, 68, 0.2)',
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: isAllowed ? C.green : C.red,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isAllowed ? <CheckCircle2 size={32} color="#000000" /> : <XCircle size={32} color="#FFFFFF" />}
      </div>

      {/* Main Decision Title */}
      <div>
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 900, color: isAllowed ? C.green : C.red }}>
          {isAllowed ? 'ENTRY ALLOWED' : 'ENTRY DENIED'}
        </h2>
        <span style={{ fontSize: '13px', color: C.text, display: 'block', marginTop: '4px' }}>
          {isAllowed ? 'Ticket verified successfully. Customer is clear to enter.' : result.reason || 'Invalid, tampered, or duplicate ticket scan.'}
        </span>
      </div>

      {/* Ticket & Customer Brief */}
      <div
        style={{
          width: '100%',
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          textAlign: 'left',
          fontSize: '13px',
        }}
      >
        <div>
          <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>Customer Name</span>
          <strong style={{ color: C.text }}>{customerName}</strong>
        </div>

        <div>
          <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>Booking Ref</span>
          <strong style={{ color: C.gold, fontFamily: 'Space Grotesk, monospace' }}>#{bookingRef}</strong>
        </div>

        {ticketCode && (
          <div>
            <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>Pass Code</span>
            <strong style={{ color: C.gold, fontFamily: 'Space Grotesk, monospace' }}>{ticketCode}</strong>
          </div>
        )}

        <div>
          <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>Ticket Tier</span>
          <strong style={{ color: C.text }}>{ticketType}</strong>
        </div>

        <div>
          <span style={{ color: C.muted, fontSize: '11px', display: 'block' }}>Section</span>
          <strong style={{ color: C.blue }}>{sectionName}</strong>
        </div>
      </div>

      {isAllowed && group && (
        <div
          style={{
            width: '100%',
            background: 'rgba(0, 229, 255, 0.08)',
            border: `1px solid ${C.blue}`,
            borderRadius: '16px',
            padding: '14px',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '12px', color: C.blue, fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCheck size={14} /> Group Admittance
          </div>
          <div style={{ fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif', color: C.text, fontWeight: 700 }}>
            {group.totalCheckedInNow || 1} / {group.totalTicketsPurchased || 1} Admitted
          </div>
          <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>
            Remaining unused passes: {group.remainingUnusedTickets ?? 0}
          </div>
        </div>
      )}

      {/* Resume Scan CTA */}
      <button
        onClick={onScanNext}
        style={{
          width: '100%',
          padding: '12px',
          background: isAllowed ? C.green : C.red,
          color: isAllowed ? '#000000' : '#FFFFFF',
          border: 'none',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 800,
          fontFamily: 'Space Grotesk, sans-serif',
          cursor: 'pointer',
        }}
      >
        Scan Next Ticket
      </button>
    </div>
  );
};
