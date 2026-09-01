import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { eventService } from '../../services/organizer/eventService.js';
import { EventWizard } from '../../components/organizer/events/EventWizard.jsx';

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await eventService.getEventById(id);
        setEvent(res.data || res);
      } catch (err) {
        setError(err.message || 'Event not found or access denied');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading event details for editing...</div>;
  }

  if (error || !event) {
    return (
      <div style={{ padding: '40px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '20px', color: C.red }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <AlertCircle size={22} />
          <h3 style={{ margin: 0 }}>Unable to Load Event</h3>
        </div>
        <p style={{ margin: '0 0 20px', color: C.text }}>{error || 'Event not found'}</p>
        <button
          onClick={() => navigate('/organizer/events')}
          style={{ padding: '8px 16px', background: C.red, color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => navigate('/organizer/events')}
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
          title="Back to Events"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: C.text, margin: 0 }}>
            Edit Event — {event.title}
          </h1>
          <p style={{ color: C.muted, fontSize: '14px', margin: '4px 0 0' }}>
            Modify event parameters, venue info, dates, policies, FAQs, or SEO metadata.
          </p>
        </div>
      </div>

      {/* Multi-Step Wizard pre-populated with existing event data */}
      <EventWizard existingEvent={event} isEditMode={true} />
    </div>
  );
}
