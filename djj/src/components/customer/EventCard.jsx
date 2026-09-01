import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, ArrowRight, Tag } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { formatCurrency } from '../../utils/formatters.js';
import { getEventBannerUrl } from '../../utils/eventImage.js';
import { formatEventDateTimeLine } from '../../utils/eventSchedule.js';

export const EventCard = ({ event }) => {
  const navigate = useNavigate();

  if (!event) return null;

  const bannerUrl = getEventBannerUrl(event);
  const categoryName = event.category?.name || 'General';
  const cityName = event.city?.name || event.venue?.city || event.eventVenue?.city || '';
  const venueName = event.venue?.name || event.eventVenue?.venueName || 'Venue TBA';
  const dateTimeLine = formatEventDateTimeLine(event);

  // Extract starting price from ticket types
  let startingPrice = null;
  if (event.ticketTypes && event.ticketTypes.length > 0) {
    const prices = event.ticketTypes.map((t) => t.price).filter((p) => p !== undefined && p !== null);
    if (prices.length > 0) {
      startingPrice = Math.min(...prices);
    }
  }

  return (
    <div
      onClick={() => navigate(`/events/${event.id}`)}
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = C.borderGold;
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Event Banner Container */}
      <div style={{ position: 'relative', width: '100%', height: '180px', background: '#111622', overflow: 'hidden' }}>
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.goldDim }}>
            <Calendar size={48} color={C.gold} />
          </div>
        )}

        {/* Category Pill Tag */}
        <span
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            padding: '4px 10px',
            background: 'rgba(11, 15, 25, 0.85)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${C.border}`,
            borderRadius: '999px',
            color: C.gold,
            fontSize: '11px',
            fontWeight: 700,
          }}
        >
          {categoryName}
        </span>

        {/* Starting Price Tag */}
        {startingPrice !== null && (
          <span
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              padding: '4px 12px',
              background: C.gold,
              color: '#000000',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 800,
              fontFamily: 'Space Grotesk, sans-serif',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            {startingPrice === 0 ? 'Free Entry' : `From ${formatCurrency(startingPrice)}`}
          </span>
        )}
      </div>

      {/* Content Area */}
      <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: 700,
            color: C.text,
            fontFamily: 'Space Grotesk, sans-serif',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.title}
        </h3>

        {/* Date & Time */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: C.muted, fontSize: '13px' }}>
          <Calendar size={14} color={C.gold} style={{ marginTop: '2px', flexShrink: 0 }} />
          <span>{dateTimeLine}</span>
        </div>

        {/* Venue & Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.muted, fontSize: '13px' }}>
          <MapPin size={14} color={C.blue} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {venueName}{cityName ? `, ${cityName}` : ''}
          </span>
        </div>

        {/* CTA Footer */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '12px',
            borderTop: `1px solid rgba(255,255,255,0.05)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: C.gold,
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
          }}
        >
          <span>View Event</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
};
