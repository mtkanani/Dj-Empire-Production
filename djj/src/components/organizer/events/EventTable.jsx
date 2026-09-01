import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Calendar, MapPin, Tag, Trash2 } from 'lucide-react';
import { C } from '../../../constants/theme.js';
import { EventStatusBadge } from './EventStatusBadge.jsx';
import { formatCurrency } from '../../../utils/formatters.js';
import { getAvailableEventActions } from '../../../utils/eventStateUtils.js';
import { getEventBannerUrl } from '../../../utils/eventImage.js';
import { formatEventDateTimeLine } from '../../../utils/eventSchedule.js';

export const EventTable = ({ events = [], loading = false, onStateAction }) => {
  const navigate = useNavigate();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: C.muted }}>Loading event records...</div>;
  }

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted }}>
            <th style={{ padding: '12px', fontWeight: 600 }}>Event</th>
            <th style={{ padding: '12px', fontWeight: 600 }}>Category</th>
            <th style={{ padding: '12px', fontWeight: 600 }}>Venue & City</th>
            <th style={{ padding: '12px', fontWeight: 600 }}>Type / Price</th>
            <th style={{ padding: '12px', fontWeight: 600 }}>Status</th>
            <th style={{ padding: '12px', fontWeight: 600 }}>Start Date</th>
            <th style={{ padding: '12px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev) => {
            const availableActions = getAvailableEventActions(ev);
            const banner = getEventBannerUrl(ev);

            return (
              <tr key={ev.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                {/* Title & Banner */}
                <td style={{ padding: '12px', color: C.text }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {banner ? (
                      <img
                        src={banner}
                        alt={ev.title}
                        style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '8px',
                          background: C.goldDim,
                          color: C.gold,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        <Calendar size={20} />
                      </div>
                    )}

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
                        onClick={() => navigate(`/organizer/events/${ev.id}`)}
                      >
                        {ev.title}
                      </span>
                      {ev.shortDescription && (
                        <span style={{ fontSize: '11px', color: C.muted, display: 'block', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev.shortDescription}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td style={{ padding: '12px', color: C.muted }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={13} color={C.gold} />
                    {ev.category?.name || 'Uncategorized'}
                  </div>
                </td>

                {/* Venue & City */}
                <td style={{ padding: '12px', color: C.muted }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color={C.blue} />
                    {ev.venue?.name || ev.eventVenue?.venueName || 'Venue TBD'}
                    {ev.city?.name ? `, ${ev.city.name}` : ''}
                  </div>
                </td>

                {/* Type / Price */}
                <td style={{ padding: '12px', color: C.text }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '12px', fontWeight: 600 }}>{ev.eventType || 'IN_PERSON'}</span>
                    <span style={{ fontSize: '11px', color: C.green }}>
                      {(() => {
                        if (ev.ticketTypes && Array.isArray(ev.ticketTypes) && ev.ticketTypes.length > 0) {
                          const validPrices = ev.ticketTypes
                            .map((t) => Number(t.price))
                            .filter((p) => !isNaN(p) && p >= 0);
                          if (validPrices.length > 0) {
                            const minP = Math.min(...validPrices);
                            return minP > 0 ? formatCurrency(minP) : 'Free';
                          }
                        }
                        if (ev.minPrice !== undefined && ev.minPrice !== null && !isNaN(ev.minPrice)) {
                          return Number(ev.minPrice) > 0 ? formatCurrency(ev.minPrice) : 'Free';
                        }
                        return ev.price > 0 ? formatCurrency(ev.price) : 'Free';
                      })()}
                    </span>
                  </div>
                </td>

                {/* Status Badge */}
                <td style={{ padding: '12px' }}>
                  <EventStatusBadge status={ev.status} />
                </td>

                {/* Start Date */}
                <td style={{ padding: '12px', color: C.muted }}>
                  {formatEventDateTimeLine(ev)}
                </td>

                {/* Actions */}
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      onClick={() => navigate(`/organizer/events/${ev.id}`)}
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
                      onClick={() => navigate(`/organizer/events/${ev.id}/edit`)}
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
                      title="Edit Event"
                    >
                      <Edit size={14} /> Edit
                    </button>

                    {/* FSM Primary Action */}
                    {availableActions.filter((a) => a.action !== 'edit' && a.action !== 'view').map((act) => (
                      <button
                        key={act.action}
                        onClick={() => onStateAction && onStateAction(ev.id, act.action)}
                        style={{
                          background: act.danger ? C.redDim : act.primary ? C.greenDim : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${act.danger ? C.red : act.primary ? C.green : C.border}`,
                          borderRadius: '8px',
                          color: act.danger ? C.red : act.primary ? C.green : C.text,
                          padding: '6px 10px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {act.label}
                      </button>
                    ))}
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
