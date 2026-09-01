import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Ticket, Calendar, DollarSign } from 'lucide-react';
import { C } from '../../../constants/theme.js';
import { getTicketStatusBadgeProps, formatTicketPrice, getTicketStatus } from '../../../utils/ticketUtils.js';
import { formatDate } from '../../../utils/formatters.js';

export const TicketTable = ({
  tickets = [],
  eventId,
  loading = false,
  onDelete,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: C.muted }}>Loading event ticket types...</div>;
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '50px 20px', textAlign: 'center', color: C.muted }}>
        <Ticket size={40} color={C.gold} style={{ marginBottom: '12px' }} />
        <h3 style={{ color: C.text, margin: '0 0 8px', fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>
          No Ticket Types Configured
        </h3>
        <p style={{ margin: 0, fontSize: '13px' }}>
          Create ticket tiers (e.g. VIP, General Admission, Early Bird) to start selling event tickets.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted }}>
            <th style={{ padding: '12px', fontWeight: 600 }}>Ticket Tier</th>
            <th style={{ padding: '12px', fontWeight: 600 }}>Price</th>
            <th style={{ padding: '12px', fontWeight: 600 }}>Total Qty</th>
            <th style={{ padding: '12px', fontWeight: 600 }}>Sold</th>
            <th style={{ padding: '12px', fontWeight: 600 }}>Available</th>
            <th style={{ padding: '12px', fontWeight: 600 }}>Sale Window</th>
            <th style={{ padding: '12px', fontWeight: 600 }}>Status</th>
            <th style={{ padding: '12px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => {
            const statusProps = getTicketStatusBadgeProps(t);
            const sold = t.quantityTotal - (t.quantityAvailable ?? t.quantityTotal);
            const available = t.quantityAvailable ?? t.quantityTotal;

            return (
              <tr key={t.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                {/* Ticket Name & Description */}
                <td style={{ padding: '12px', color: C.text }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: C.goldDim,
                        color: C.gold,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ticket size={18} />
                    </div>
                    <div>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: C.text,
                          fontFamily: 'Space Grotesk, sans-serif',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/organizer/events/${eventId}/tickets/${t.id}`)}
                      >
                        {t.name}
                      </span>
                      {t.description && (
                        <span style={{ fontSize: '11px', color: C.muted, display: 'block', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.description}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td style={{ padding: '12px', color: C.green, fontWeight: 600 }}>
                  {formatTicketPrice(t.price, t.currency || 'INR')}
                </td>

                {/* Total Quantity */}
                <td style={{ padding: '12px', color: C.text, fontWeight: 600 }}>
                  {t.quantityTotal}
                </td>

                {/* Sold */}
                <td style={{ padding: '12px', color: C.green, fontWeight: 600 }}>
                  {sold}
                </td>

                {/* Available */}
                <td style={{ padding: '12px', color: available > 0 ? C.blue : C.red, fontWeight: 600 }}>
                  {available}
                </td>

                {/* Sale Window */}
                <td style={{ padding: '12px', color: C.muted, fontSize: '12px' }}>
                  {t.saleStartDate ? formatDate(t.saleStartDate) : 'Immediate'}
                  {t.saleEndDate ? ` to ${formatDate(t.saleEndDate)}` : ''}
                </td>

                {/* Status Badge */}
                <td style={{ padding: '12px' }}>
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
                </td>

                {/* Actions */}
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      onClick={() => navigate(`/organizer/events/${eventId}/tickets/${t.id}`)}
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
                      title="View Details"
                    >
                      <Eye size={14} /> View
                    </button>

                    <button
                      onClick={() => navigate(`/organizer/events/${eventId}/tickets/${t.id}/edit`)}
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
                      title="Edit Ticket"
                    >
                      <Edit size={14} /> Edit
                    </button>

                    {onDelete && (
                      <button
                        onClick={() => onDelete(t.id)}
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
                        title="Delete Ticket"
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
