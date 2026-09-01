import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { ticketService } from '../../services/organizer/ticketService.js';
import { eventService } from '../../services/organizer/eventService.js';
import { seatMapService } from '../../services/organizer/seatMapService.js';
import { TicketForm } from '../../components/organizer/ticketing/TicketForm.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function CreateTicketPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, secRes] = await Promise.allSettled([
          eventService.getEventById(eventId),
          seatMapService.getSections(eventId),
        ]);

        if (evRes.status === 'fulfilled') {
          setEvent(evRes.value.data || evRes.value);
        }

        if (secRes.status === 'fulfilled') {
          const rawSec = secRes.value.data || secRes.value || [];
          setSections(Array.isArray(rawSec) ? rawSec : []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load event data');
      }
    };
    if (eventId) fetchData();
  }, [eventId]);

  const handleSubmit = async (payload) => {
    setSaving(true);
    setError(null);
    try {
      await ticketService.createTicket(eventId, payload);
      showToast('Ticket type created successfully!', 'success');
      navigate(`/organizer/events/${eventId}/tickets`);
    } catch (err) {
      setError(err.message || 'Failed to create ticket type');
      showToast(err.message || 'Creation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => navigate(`/organizer/events/${eventId}/tickets`)}
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
          title="Back to Tickets"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: C.text, margin: 0 }}>
            Create Ticket Type — {event?.title || 'Event'}
          </h1>
          <p style={{ color: C.muted, fontSize: '14px', margin: '4px 0 0' }}>
            Configure ticket tier name, pricing, assigned ground zone, and initial stock capacity.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '28px' }}>
        <TicketForm
          mode="create"
          sections={sections}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/organizer/events/${eventId}/tickets`)}
          saving={saving}
          error={error}
        />
      </div>
    </div>
  );
}
