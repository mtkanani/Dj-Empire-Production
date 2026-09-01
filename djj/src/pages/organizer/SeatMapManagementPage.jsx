import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, RefreshCw, Layers, Ticket, AlertTriangle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { eventService } from '../../services/organizer/eventService.js';
import { seatMapService } from '../../services/organizer/seatMapService.js';
import { ticketService } from '../../services/organizer/ticketService.js';
import { EventStatusBadge } from '../../components/organizer/events/EventStatusBadge.jsx';
import { SeatMapCanvas } from '../../components/organizer/seating/SeatMapCanvas.jsx';
import { SeatDetailsPanel } from '../../components/organizer/seating/SeatDetailsPanel.jsx';
import { formatDate } from '../../utils/formatters.js';
import { useToast } from '../../hooks/useToast.js';

export default function SeatMapManagementPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [sections, setSections] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [sectionSeats, setSectionSeats] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [evRes, secRes, ticketRes] = await Promise.allSettled([
        eventService.getEventById(eventId),
        seatMapService.getSections(eventId),
        ticketService.getEventTickets(eventId),
      ]);

      if (evRes.status === 'fulfilled') {
        setEvent(evRes.value.data || evRes.value);
      } else {
        throw new Error('Event not found or access denied');
      }

      if (secRes.status === 'fulfilled') {
        const rawSec = secRes.value.data || secRes.value || [];
        setSections(Array.isArray(rawSec) ? rawSec : []);
        if (rawSec.length > 0 && !activeSectionId) {
          setActiveSectionId(rawSec[0].id);
        }
      }

      if (ticketRes.status === 'fulfilled') {
        const rawT = ticketRes.value.data || ticketRes.value || [];
        setTickets(Array.isArray(rawT) ? rawT : []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load seat map configuration');
    } finally {
      setLoading(false);
    }
  }, [eventId, activeSectionId]);

  useEffect(() => {
    if (eventId) loadData();
  }, [eventId, loadData]);

  const loadSectionSeats = useCallback(async (secId) => {
    if (!eventId || !secId) {
      setSectionSeats([]);
      return;
    }
    try {
      const res = await seatMapService.getSectionSeats(eventId, secId);
      const data = res.data || res || {};
      setSectionSeats(Array.isArray(data.seats) ? data.seats : []);
    } catch {
      setSectionSeats([]);
    }
  }, [eventId]);

  useEffect(() => {
    if (activeSectionId) loadSectionSeats(activeSectionId);
  }, [activeSectionId, loadSectionSeats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const secRes = await seatMapService.getSections(eventId);
      const rawSec = secRes.data || secRes || [];
      setSections(Array.isArray(rawSec) ? rawSec : []);
      if (activeSectionId) {
        await loadSectionSeats(activeSectionId);
      }
      showToast('Seat map refreshed', 'info');
    } catch {
      showToast('Refresh failed', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading interactive seat map canvas...</div>;
  }

  if (error || !event) {
    return (
      <div style={{ padding: '40px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '20px', color: C.red }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <AlertTriangle size={22} />
          <h3 style={{ margin: 0 }}>Seat Map Loading Error</h3>
        </div>
        <p style={{ margin: '0 0 20px', color: C.text }}>{error || 'Event not found'}</p>
        <button onClick={() => navigate('/organizer/events')} style={{ padding: '8px 16px', background: C.red, color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Back to Events
        </button>
      </div>
    );
  }

  const currentSection = sections.find((s) => s.id === activeSectionId) || sections[0] || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate(`/organizer/events/${eventId}`)}
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              color: C.muted,
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Back to Event Details"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: C.text, margin: 0 }}>
                Seat Map — {event.title}
              </h1>
              <EventStatusBadge status={event.status} />
            </div>
            <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0' }}>
              Venue: {event.venue?.name || event.eventVenue?.venueName || 'Venue TBD'} • {sections.length} Active Sections
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate(`/organizer/events/${eventId}/seating`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Layers size={16} /> Manage Sections
          </button>

          <button
            onClick={() => navigate(`/organizer/events/${eventId}/seat-map/preview`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
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
            <Eye size={16} /> Customer Preview
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout: Left (Canvas & Grid), Right (Details Inspector) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Main Seat Map Interactive Canvas */}
        <div style={{ flexGrow: 1 }}>
          <SeatMapCanvas
            sections={sections}
            activeSectionId={activeSectionId}
            seats={sectionSeats}
            onSelectSection={(secId) => {
              setActiveSectionId(secId);
              setSelectedSeat(null);
            }}
            selectedSeatId={selectedSeat?.id}
            onSelectSeat={(seat, sec) => setSelectedSeat(seat)}
          />
        </div>

        {/* Right Details Inspector Panel */}
        <div style={{ minWidth: '300px' }}>
          <SeatDetailsPanel
            selectedSeat={selectedSeat}
            selectedSection={currentSection}
            tickets={tickets}
          />
        </div>
      </div>
    </div>
  );
}
