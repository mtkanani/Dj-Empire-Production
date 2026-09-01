import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Layers, Tag } from 'lucide-react';
import { C } from '../../../constants/theme.js';
import { calculateOccupancyPercentage } from '../../../utils/seatMapUtils.js';
import { formatCurrency } from '../../../utils/formatters.js';

export const SectionTable = ({
  sections = [],
  eventId,
  loading = false,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: C.muted }}>Loading event sections...</div>;
  }

  if (!sections || sections.length === 0) {
    return (
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '50px 20px', textAlign: 'center', color: C.muted }}>
        <Layers size={40} color={C.gold} style={{ marginBottom: '12px' }} />
        <h3 style={{ color: C.text, margin: '0 0 8px', fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>
          No Event Sections Configured
        </h3>
        <p style={{ margin: 0, fontSize: '13px' }}>
          Create seating sections (e.g. VIP Lounge, Platinum, Gold, General Admission) to allocate seating capacity.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted }}>
            <th style={{ padding: '12px', fontWeight: 600 }}>Section</th>
            <th style={{ padding: '12px', fontWeight: 600 }}>Capacity</th>
            <th style={{ padding: '12px', fontWeight: 600 }}>Sold</th>
            <th style={{ padding: '12px', fontWeight: 600 }}>Available</th>
            <th style={{ padding: '12px', fontWeight: 600 }}>Occupancy</th>
            <th style={{ padding: '12px', fontWeight: 600 }}>Assigned Ticket Tiers</th>
            <th style={{ padding: '12px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((sec) => {
            const occupancy = calculateOccupancyPercentage(sec.soldCapacity || 0, sec.capacity || 100);
            const ticketTiers = sec.ticketTypes || [];

            return (
              <tr key={sec.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                {/* Color Tag & Section Name */}
                <td style={{ padding: '12px', color: C.text }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '4px',
                        background: sec.color || '#3B82F6',
                        display: 'inline-block',
                      }}
                    />
                    <div>
                      <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
                        {sec.name}
                      </span>
                      {sec.description && (
                        <span style={{ fontSize: '11px', color: C.muted, display: 'block', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sec.description}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Capacity */}
                <td style={{ padding: '12px', color: C.text, fontWeight: 600 }}>
                  {sec.capacity}
                </td>

                {/* Sold */}
                <td style={{ padding: '12px', color: C.green, fontWeight: 600 }}>
                  {sec.soldCapacity || 0}
                </td>

                {/* Available */}
                <td style={{ padding: '12px', color: (sec.availableCapacity ?? sec.capacity) > 0 ? C.blue : C.red, fontWeight: 600 }}>
                  {sec.availableCapacity ?? sec.capacity}
                </td>

                {/* Occupancy % */}
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flexGrow: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', width: '60px', overflow: 'hidden' }}>
                      <div style={{ width: `${occupancy}%`, background: sec.color || C.blue, height: '100%' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: C.muted, fontWeight: 600 }}>{occupancy}%</span>
                  </div>
                </td>

                {/* Assigned Ticket Tiers */}
                <td style={{ padding: '12px', color: C.muted }}>
                  {ticketTiers.length > 0 ? (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {ticketTiers.map((t) => (
                        <span key={t.id} style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: C.gold, fontSize: '11px', fontWeight: 600 }}>
                          {t.name} ({formatCurrency(t.price)})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '11px', color: C.muted }}>No ticket tier assigned</span>
                  )}
                </td>

                {/* Actions */}
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      onClick={() => navigate(`/organizer/events/${eventId}/seat-map`)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${C.border}`,
                        borderRadius: '8px',
                        color: C.muted,
                        padding: '6px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                      }}
                      title="View Seat Map"
                    >
                      <Eye size={14} /> Map
                    </button>

                    {onEdit && (
                      <button
                        onClick={() => onEdit(sec)}
                        style={{
                          background: C.goldDim,
                          border: `1px solid ${C.borderGold}`,
                          borderRadius: '8px',
                          color: C.gold,
                          padding: '6px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                        title="Edit Section"
                      >
                        <Edit size={14} /> Edit
                      </button>
                    )}

                    {onDelete && (
                      <button
                        onClick={() => onDelete(sec.id)}
                        style={{
                          background: C.redDim,
                          border: `1px solid ${C.red}`,
                          borderRadius: '8px',
                          color: C.red,
                          padding: '6px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                        }}
                        title="Delete Section"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
