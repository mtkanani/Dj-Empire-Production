import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { eventService } from '../../services/organizer/eventService.js';
import { seatMapService } from '../../services/organizer/seatMapService.js';
import { SeatMapPreview } from '../../components/organizer/seating/SeatMapPreview.jsx';

export default function SeatMapPreviewPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [sections, setSections] = useState([]);
  const [seatsBySection, setSeatsBySection] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, secRes] = await Promise.allSettled([
          eventService.getEventById(eventId),
          seatMapService.getSections(eventId),
        ]);
        if (evRes.status === 'fulfilled') setEvent(evRes.value.data || evRes.value);
        if (secRes.status === 'fulfilled') {
          const raw = secRes.value.data || secRes.value || [];
          const list = Array.isArray(raw) ? raw : [];
          setSections(list);
          const seatEntries = await Promise.all(
            list.map(async (sec) => {
              try {
                const seatRes = await seatMapService.getSectionSeats(eventId, sec.id);
                const data = seatRes.data || seatRes || {};
                return [sec.id, Array.isArray(data.seats) ? data.seats : []];
              } catch {
                return [sec.id, []];
              }
            })
          );
          setSeatsBySection(Object.fromEntries(seatEntries));
        }
      } catch (err) {
        setError(err.message || 'Seat map preview failed to load');
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchData();
  }, [eventId]);

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading customer seat map preview...</div>;
  }

  if (error || !event) {
    return (
      <div style={{ padding: '40px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '20px', color: C.red }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <AlertCircle size={22} />
          <h3 style={{ margin: 0 }}>Preview Error</h3>
        </div>
        <p style={{ margin: '0 0 20px', color: C.text }}>{error || 'Event not found'}</p>
        <button onClick={() => navigate(`/organizer/events/${eventId}/seat-map`)} style={{ padding: '8px 16px', background: C.red, color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Back to Seat Map
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate(`/organizer/events/${eventId}/seat-map`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            color: C.text,
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Back to Seat Map Editor
        </button>

        <span style={{ fontSize: '13px', color: C.muted }}>
          Event: <strong style={{ color: C.gold }}>{event.title}</strong>
        </span>
      </div>

      {/* Customer Seat Map Preview */}
      <SeatMapPreview event={event} sections={sections} seatsBySection={seatsBySection} />
    </div>
  );
}
