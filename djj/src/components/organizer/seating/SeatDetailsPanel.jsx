import React from 'react';
import { Layers, Ticket, CheckCircle2, Lock, Tag, DollarSign } from 'lucide-react';
import { C } from '../../../constants/theme.js';
import { getSeatStatusBadgeProps } from '../../../utils/seatMapUtils.js';
import { formatCurrency } from '../../../utils/formatters.js';

export const SeatDetailsPanel = ({
  selectedSeat = null,
  selectedSection = null,
  tickets = [],
  onAssignTicket,
}) => {
  if (!selectedSeat && !selectedSection) {
    return (
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: '20px',
          padding: '24px',
          textAlign: 'center',
          color: C.muted,
        }}
      >
        <Layers size={32} color={C.gold} style={{ marginBottom: '10px' }} />
        <h4 style={{ color: C.text, margin: '0 0 4px', fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif' }}>
          No Seat or Section Selected
        </h4>
        <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.5 }}>
          Click on any seat or section block on the seat map canvas to inspect details and pricing rules.
        </p>
      </div>
    );
  }

  const isSeat = Boolean(selectedSeat);
  const statusProps = isSeat ? getSeatStatusBadgeProps(selectedSeat.status) : null;
  const sectionTickets = selectedSection?.ticketTypes || tickets;

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isSeat ? 'Seat Details Inspector' : 'Section Inspector'}
          </span>
          <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 700, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
            {isSeat ? selectedSeat.seatLabel : selectedSection.name}
          </h3>
        </div>

        {isSeat && statusProps && (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 600,
              background: statusProps.bg,
              color: statusProps.color,
              border: `1px solid ${statusProps.border}`,
            }}
          >
            {statusProps.label}
          </span>
        )}
      </div>

      {/* Seat Specific Grid */}
      {isSeat ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
          <div>
            <span style={{ color: C.muted, display: 'block', fontSize: '11px' }}>Row</span>
            <strong style={{ color: C.text }}>Row {selectedSeat.row}</strong>
          </div>
          <div>
            <span style={{ color: C.muted, display: 'block', fontSize: '11px' }}>Seat Number</span>
            <strong style={{ color: C.text }}>Seat {selectedSeat.column}</strong>
          </div>
          <div>
            <span style={{ color: C.muted, display: 'block', fontSize: '11px' }}>Section</span>
            <span style={{ color: selectedSeat.sectionColor || C.gold, fontWeight: 600 }}>{selectedSeat.sectionName}</span>
          </div>
          <div>
            <span style={{ color: C.muted, display: 'block', fontSize: '11px' }}>Availability</span>
            <span style={{ color: statusProps.color, fontWeight: 600 }}>{statusProps.label}</span>
          </div>
        </div>
      ) : (
        /* Section Specific Grid */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
          <div>
            <span style={{ color: C.muted, display: 'block', fontSize: '11px' }}>Total Capacity</span>
            <strong style={{ color: C.text }}>{selectedSection.capacity} Seats</strong>
          </div>
          <div>
            <span style={{ color: C.muted, display: 'block', fontSize: '11px' }}>Available Stock</span>
            <strong style={{ color: C.blue }}>{selectedSection.availableCapacity ?? selectedSection.capacity}</strong>
          </div>
          <div>
            <span style={{ color: C.muted, display: 'block', fontSize: '11px' }}>Sold</span>
            <strong style={{ color: C.green }}>{selectedSection.soldCapacity || 0}</strong>
          </div>
          <div>
            <span style={{ color: C.muted, display: 'block', fontSize: '11px' }}>Color Code</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: selectedSection.color || C.blue }} />
              <span style={{ color: C.text }}>{selectedSection.color}</span>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Tier Association */}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '16px' }}>
        <h4 style={{ margin: '0 0 10px', color: C.gold, fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif' }}>
          Assigned Ticket Pricing Tiers
        </h4>

        {sectionTickets && sectionTickets.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sectionTickets.map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${C.border}`,
                  borderRadius: '10px',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Ticket size={14} color={C.gold} />
                  <span style={{ color: C.text, fontWeight: 600 }}>{t.name}</span>
                </div>
                <span style={{ color: C.green, fontWeight: 700 }}>{formatCurrency(t.price)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: C.muted, fontSize: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
            No ticket tier assigned to this section yet. Use Phase 8 ticketing to attach prices.
          </div>
        )}
      </div>
    </div>
  );
};
