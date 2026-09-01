import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, MapPin, ChevronRight, Search, AlertCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { eventService } from '../../services/organizer/eventService.js';
import { EventStatusBadge } from '../../components/organizer/events/EventStatusBadge.jsx';
import { formatDate } from '../../utils/formatters.js';
import { getEventBannerUrl } from '../../utils/eventImage.js';

export default function TicketingEventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrganizerEvents = async () => {
      setLoading(true);
      try {
        const res = await eventService.getEvents({ limit: 100 });
        const dataArr = res?.data || res || [];
        setEvents(Array.isArray(dataArr) ? dataArr : []);
      } catch (err) {
        setError(err.message || 'Failed to load organizer events.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizerEvents();
  }, []);

  const filteredEvents = events.filter((ev) =>
    ev.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: C.text, margin: 0 }}>
          Ticketing & Inventory Management
        </h1>
        <p style={{ color: C.muted, fontSize: '14px', margin: '4px 0 0' }}>
          Select an event below to configure ticket types, pricing tiers, and monitor live inventory sales.
        </p>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
        <Search size={16} color={C.muted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Filter events by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px 10px 40px',
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            color: C.text,
            fontSize: '13px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Events Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading your events...</div>
      ) : error ? (
        <div style={{ padding: '20px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '14px', color: C.red }}>
          {error}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '60px 20px', textAlign: 'center', color: C.muted }}>
          <Calendar size={40} color={C.gold} style={{ marginBottom: '12px' }} />
          <h3 style={{ color: C.text, margin: '0 0 8px', fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>No events found</h3>
          <p style={{ margin: '0 0 20px', fontSize: '14px' }}>
            You need an existing event before configuring ticket types.
          </p>
          <button
            onClick={() => navigate('/organizer/events/create')}
            style={{ padding: '10px 20px', background: C.gold, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            Create Event
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredEvents.map((ev) => {
            const banner = getEventBannerUrl(ev);
            const ticketCount = ev.ticketTypes?.length || 0;

            return (
              <div
                key={ev.id}
                style={{
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderRadius: '20px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {banner ? (
                  <img src={banner} alt={ev.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100px', background: C.goldDim, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold }}>
                    <Calendar size={32} />
                  </div>
                )}

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <EventStatusBadge status={ev.status} />
                    <span style={{ fontSize: '12px', color: C.gold, fontWeight: 600 }}>
                      {ticketCount} Ticket {ticketCount === 1 ? 'Type' : 'Types'}
                    </span>
                  </div>

                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
                    {ev.title}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: C.muted }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color={C.gold} />
                      {formatDate(ev.startDate || ev.createdAt)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color={C.blue} />
                      {ev.venue?.name || ev.eventVenue?.venueName || 'Venue TBD'}
                      {ev.city?.name ? `, ${ev.city.name}` : ''}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}`, background: 'rgba(0, 0, 0, 0.1)' }}>
                  <button
                    onClick={() => navigate(`/organizer/events/${ev.id}/tickets`)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px',
                      background: C.goldDim,
                      border: `1px solid ${C.borderGold}`,
                      borderRadius: '12px',
                      color: C.gold,
                      fontWeight: 700,
                      fontSize: '13px',
                      fontFamily: 'Space Grotesk, sans-serif',
                      cursor: 'pointer',
                    }}
                  >
                    <Ticket size={16} /> Manage Tickets <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
