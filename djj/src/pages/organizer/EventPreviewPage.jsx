import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket, Edit, AlertCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { eventService } from '../../services/organizer/eventService.js';
import { EventPreviewStep } from '../../components/organizer/events/steps/EventPreviewStep.jsx';
import { useToast } from '../../hooks/useToast.js';
import { getEventBannerUrl } from '../../utils/eventImage.js';

export default function EventPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await eventService.getEventById(id);
        setEvent(res.data || res);
      } catch (err) {
        setError(err.message || 'Event preview could not be loaded');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await eventService.publishEvent(id);
      showToast('Event published live successfully!', 'success');
      navigate(`/organizer/events/${id}`);
    } catch (err) {
      showToast(err.message || 'Failed to publish event', 'error');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading event preview...</div>;
  }

  if (error || !event) {
    return (
      <div style={{ padding: '40px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '20px', color: C.red }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <AlertCircle size={22} />
          <h3 style={{ margin: 0 }}>Preview Unavailable</h3>
        </div>
        <p style={{ margin: '0 0 20px', color: C.text }}>{error || 'Event not found or access denied.'}</p>
        <button onClick={() => navigate('/organizer/events')} style={{ padding: '8px 16px', background: C.red, color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Back to Events
        </button>
      </div>
    );
  }

  const basicInfo = {
    title: event.title,
    shortDescription: event.shortDescription,
    description: event.description,
    eventType: event.eventType,
    visibility: event.visibility,
    price: event.price,
    bannerUrl: getEventBannerUrl(event) || '',
  };

  const venueData = {
    venueName: event.venue?.name || event.eventVenue?.venueName,
    city: event.city?.name || event.eventVenue?.city,
    address: event.venue?.address || event.eventVenue?.address,
  };

  const scheduleData = {
    startDate: event.schedules?.[0]?.startDate || event.startDate,
    startTime: event.schedules?.[0]?.startTime,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <button
          onClick={() => navigate(`/organizer/events/${id}`)}
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
          <ArrowLeft size={16} /> Back to Details
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate(`/organizer/events/${id}/edit`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              background: C.goldDim,
              border: `1px solid ${C.borderGold}`,
              borderRadius: '12px',
              color: C.gold,
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Edit size={16} /> Edit Event
          </button>

          {event.status !== 'Published' && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: C.gold,
                color: '#000000',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer',
              }}
            >
              <Rocket size={16} /> {publishing ? 'Publishing...' : 'Publish Live'}
            </button>
          )}
        </div>
      </div>

      {/* Event Preview Content */}
      <EventPreviewStep
        basicInfo={basicInfo}
        venue={venueData}
        schedule={scheduleData}
        policy={event.policy || {}}
        faqs={event.faqs || []}
        seo={event.seo || {}}
      />
    </div>
  );
}
