import React, { useState } from 'react';
import { Layers, ZoomIn, ZoomOut, RotateCcw, CheckCircle2, Lock, ShoppingBag, Box, UserCheck } from 'lucide-react';
import { C } from '../../../constants/theme.js';
import { generateSeatGridForSection, getSeatStatusBadgeProps, groupPersistedSeatsByRow } from '../../../utils/seatMapUtils.js';

export const SeatMapCanvas = ({
  sections = [],
  activeSectionId = null,
  onSelectSection,
  selectedSeatId = null,
  onSelectSeat,
  seats = [],
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  const currentSection = sections.find((s) => s.id === activeSectionId) || sections[0] || null;
  const nameLower = currentSection?.name?.toLowerCase() || '';
  const isGroundBox =
    currentSection?.layoutType === 'GROUND_BOX' ||
    nameLower.includes('box') ||
    nameLower.includes('ground') ||
    nameLower.includes('pit') ||
    nameLower.includes('lawn') ||
    nameLower.includes('zone') ||
    nameLower.includes('standing');
  const gridRows =
    currentSection && !isGroundBox
      ? seats.length > 0
        ? groupPersistedSeatsByRow(seats)
        : generateSeatGridForSection(currentSection)
      : [];

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(1.5, prev + 0.15));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.7, prev - 0.15));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Section Tabs & Canvas Toolbar */}
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Section Selector Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: C.muted, fontWeight: 600, marginRight: '4px' }}>Sections:</span>
          {sections.map((sec) => {
            const isSelected = currentSection?.id === sec.id;
            const secIsGround = sec.layoutType === 'GROUND_BOX';

            return (
              <button
                key={sec.id}
                onClick={() => onSelectSection && onSelectSection(sec.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? sec.color || C.blue : 'rgba(255,255,255,0.04)',
                  color: isSelected ? '#000000' : C.text,
                  border: `1px solid ${isSelected ? sec.color || C.blue : C.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isSelected ? '#000' : sec.color }} />
                {secIsGround ? '🏟️ ' : '🪑 '}{sec.name} ({sec.capacity})
              </button>
            );
          })}
        </div>

        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleZoomOut}
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: '8px', color: C.muted, padding: '6px', cursor: 'pointer' }}
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span style={{ fontSize: '12px', color: C.muted, minWidth: '40px', textAlign: 'center' }}>{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={handleZoomIn}
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: '8px', color: C.muted, padding: '6px', cursor: 'pointer' }}
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={handleResetZoom}
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: '8px', color: C.muted, padding: '6px', cursor: 'pointer' }}
            title="Reset Zoom"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Main Seat Map Visual Canvas Container */}
      <div
        style={{
          background: '#090B10',
          border: `1px solid ${C.border}`,
          borderRadius: '20px',
          padding: '30px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          overflowX: 'auto',
          minHeight: '380px',
        }}
      >
        {/* STAGE Header Indicator */}
        <div
          style={{
            width: '80%',
            maxWidth: '600px',
            padding: '10px 0',
            background: 'linear-gradient(180deg, rgba(234,179,8,0.2) 0%, rgba(234,179,8,0.02) 100%)',
            border: `1px solid ${C.borderGold}`,
            borderRadius: '12px',
            textAlign: 'center',
            color: C.gold,
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            boxShadow: '0 4px 20px rgba(234, 179, 8, 0.1)',
          }}
        >
          ▲ STAGE / PERFORMANCE AREA ▲
        </div>

        {/* Dynamic Zoom Wrapper */}
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
            width: '100%',
            maxWidth: '700px',
          }}
        >
          {!currentSection ? (
            <div style={{ color: C.muted, padding: '40px', fontSize: '13px' }}>
              No sections created. Create a section to render seat map rows or ground boxes.
            </div>
          ) : isGroundBox ? (
            /* Standing Ground Enclosure Box Canvas Card */
            <div
              style={{
                width: '100%',
                padding: '24px',
                background: 'rgba(234, 179, 8, 0.04)',
                border: `2px dashed ${currentSection.color || C.gold}`,
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '12px',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(234,179,8,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentSection.color || C.gold }}>
                <Box size={24} />
              </div>

              <div>
                <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', color: C.text }}>
                  🏟️ {currentSection.name}
                </h3>
                <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '13px' }}>
                  {currentSection.description || 'Open Ground Standing Enclosure Zone'}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: C.bgCard, padding: '10px 20px', borderRadius: '12px', border: `1px solid ${C.border}`, marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.gold, fontSize: '14px', fontWeight: 700 }}>
                  <UserCheck size={18} /> {currentSection.capacity} Capacity Standing Room
                </div>
              </div>

              <span style={{ fontSize: '11px', color: C.muted, fontStyle: 'italic' }}>
                General Admission Ground Zone — Attendees receive entry QR codes for this enclosure box.
              </span>
            </div>
          ) : gridRows.length === 0 ? (
            <div style={{ color: C.muted, padding: '40px', fontSize: '13px' }}>
              Section "{currentSection.name}" has 0 capacity configured.
            </div>
          ) : (
            /* Numbered Chair Seating Grid */
            gridRows.map((row) => (
              <div key={row.rowName} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '24px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: C.muted,
                    textAlign: 'right',
                    fontFamily: 'Space Grotesk, sans-serif',
                  }}
                >
                  {row.rowName}
                </span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {row.seats.map((seat) => {
                    const isSelected = selectedSeatId === seat.id;
                    const statusProps = getSeatStatusBadgeProps(seat.status);

                    let bgColor = statusProps.bg;
                    let textColor = statusProps.color;
                    let borderColor = statusProps.border;

                    if (isSelected) {
                      bgColor = C.gold;
                      textColor = '#000000';
                      borderColor = C.gold;
                    }

                    return (
                      <button
                        key={seat.id}
                        onClick={() => onSelectSeat && onSelectSeat(seat, currentSection)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: bgColor,
                          color: textColor,
                          border: `1px solid ${borderColor}`,
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isSelected ? '0 0 12px rgba(234, 179, 8, 0.6)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                        title={`${seat.seatLabel || seat.seatNumber || seat.column} (${statusProps.label})`}
                      >
                        {seat.column}
                      </button>
                    );
                  })}
                </div>

                <span
                  style={{
                    width: '24px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: C.muted,
                    textAlign: 'left',
                    fontFamily: 'Space Grotesk, sans-serif',
                  }}
                >
                  {row.rowName}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
