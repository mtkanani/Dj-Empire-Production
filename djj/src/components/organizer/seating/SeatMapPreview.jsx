import React, { useState } from 'react';
import { Eye, Ticket, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { C } from '../../../constants/theme.js';
import { generateSeatGridForSection, getSeatStatusBadgeProps, groupPersistedSeatsByRow } from '../../../utils/seatMapUtils.js';
import { formatCurrency } from '../../../utils/formatters.js';

export const SeatMapPreview = ({ event = null, sections = [], seatsBySection = {} }) => {
  const [activeSecId, setActiveSecId] = useState(sections[0]?.id || null);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const currentSection = sections.find((s) => s.id === activeSecId) || sections[0] || null;
  const persistedSeats = currentSection ? seatsBySection[currentSection.id] || [] : [];
  const gridRows = currentSection
    ? persistedSeats.length > 0
      ? groupPersistedSeatsByRow(persistedSeats)
      : generateSeatGridForSection(currentSection)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Preview Header Banner */}
      <div
        style={{
          background: C.goldDim,
          border: `1px solid ${C.borderGold}`,
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: C.gold,
        }}
      >
        <Eye size={20} />
        <div>
          <strong style={{ display: 'block', fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif' }}>
            Customer Seat Selection Map Preview
          </strong>
          <span style={{ fontSize: '12px', color: C.text }}>
            This is how attendees will view and select their seats during ticket checkout.
          </span>
        </div>
      </div>

      {/* Main Grid + Ticket Tier Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Left: Interactive Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Section Selection Bar */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {sections.map((sec) => {
              const isSelected = (currentSection?.id || activeSecId) === sec.id;

              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSecId(sec.id);
                    setSelectedSeat(null);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? sec.color || C.blue : C.bgCard,
                    color: isSelected ? '#000000' : C.text,
                    border: `1px solid ${isSelected ? sec.color || C.blue : C.border}`,
                    cursor: 'pointer',
                  }}
                >
                  {sec.name}
                </button>
              );
            })}
          </div>

          {/* Map Frame */}
          <div
            style={{
              background: '#090B10',
              border: `1px solid ${C.border}`,
              borderRadius: '20px',
              padding: '24px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              overflowX: 'auto',
            }}
          >
            {/* STAGE */}
            <div
              style={{
                width: '80%',
                padding: '8px 0',
                background: 'linear-gradient(180deg, rgba(234,179,8,0.2) 0%, rgba(234,179,8,0.02) 100%)',
                border: `1px solid ${C.borderGold}`,
                borderRadius: '10px',
                textAlign: 'center',
                color: C.gold,
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '2px',
              }}
            >
              STAGE
            </div>

            {/* Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {gridRows.map((r) => (
                <div key={r.rowName} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: C.muted, width: '20px', textAlign: 'right' }}>{r.rowName}</span>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {r.seats.map((seat) => {
                      const isSel = selectedSeat?.id === seat.id;
                      const statusProps = getSeatStatusBadgeProps(seat.status);

                      return (
                        <button
                          key={seat.id}
                          onClick={() => setSelectedSeat(seat)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: isSel ? C.gold : statusProps.bg,
                            color: isSel ? '#000' : statusProps.color,
                            border: `1px solid ${isSel ? C.gold : statusProps.border}`,
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {seat.column}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Selected Seat & Pricing Summary */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h4 style={{ margin: 0, color: C.gold, fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>
            Seat Selection Summary
          </h4>

          {selectedSeat ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '11px', color: C.muted, display: 'block' }}>Selected Seat</span>
                <strong style={{ fontSize: '18px', color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
                  {selectedSeat.seatLabel}
                </strong>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '12px', color: C.muted }}>
                  <span>Row: {selectedSeat.row}</span>
                  <span>Number: {selectedSeat.column}</span>
                </div>
              </div>

              {currentSection?.ticketTypes && currentSection.ticketTypes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: C.muted }}>Available Ticket Tiers</span>
                  {currentSection.ticketTypes.map((t) => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: C.goldDim, border: `1px solid ${C.borderGold}`, borderRadius: '10px', color: C.gold, fontWeight: 700, fontSize: '13px' }}>
                      <span>{t.name}</span>
                      <span>{formatCurrency(t.price)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: C.muted }}>
                  General Ticket Pricing applies.
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
              Select a seat from the map to inspect ticket tier pricing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
