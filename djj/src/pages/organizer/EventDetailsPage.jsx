import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Shield,
  HelpCircle,
  Eye,
  Edit,
  Rocket,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Ticket,
} from 'lucide-react';
import { C } from '../../constants/theme.js';
import { eventService } from '../../services/organizer/eventService.js';
import { EventStatusBadge } from '../../components/organizer/events/EventStatusBadge.jsx';
import { formatDate, formatCurrency } from '../../utils/formatters.js';
import { getAvailableEventActions } from '../../utils/eventStateUtils.js';
import { getEventBannerUrl } from '../../utils/eventImage.js';
import { formatEventDateTimeLine } from '../../utils/eventSchedule.js';
import { useToast } from '../../hooks/useToast.js';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEventDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventService.getEventById(id);
      const eventData = res.data || res;

      // Fallback fetch for policy and faqs if omitted from main event object
      const promises = [];
      if (!eventData.policy) promises.push(eventService.getPolicy(id).catch(() => null));
      else promises.push(Promise.resolve({ data: eventData.policy }));

      if (!eventData.faqs || eventData.faqs.length === 0) promises.push(eventService.getFAQs(id).catch(() => null));
      else promises.push(Promise.resolve({ data: eventData.faqs }));

      const [policyRes, faqsRes] = await Promise.all(promises);

      const policy = policyRes?.data || policyRes || eventData.policy || null;
      const faqs = faqsRes?.data || faqsRes || eventData.faqs || [];

      setEvent({
        ...eventData,
        policy,
        faqs: Array.isArray(faqs) ? faqs : eventData.faqs || [],
      });
    } catch (err) {
      setError(err.message || 'Event details could not be retrieved.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchEventDetails();
  }, [id]);

  const handleAction = async (action) => {
    try {
      if (action === 'publish') {
        await eventService.publishEvent(id);
        showToast('Event published live successfully!', 'success');
      } else if (action === 'submit-approval') {
        await eventService.submitForApproval(id);
        showToast('Submitted for Super Admin approval', 'info');
      } else if (action === 'unpublish') {
        await eventService.unpublishEvent(id);
        showToast('Event unpublished', 'info');
      } else if (action === 'cancel') {
        await eventService.cancelEvent(id);
        showToast('Event cancelled', 'warning');
      } else if (action === 'archive') {
        await eventService.archiveEvent(id);
        showToast('Event archived and hidden from active dashboard', 'info');
      } else if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
          await eventService.deleteEvent(id);
          showToast('Event deleted successfully!', 'success');
          navigate('/organizer/events');
          return;
        }
      }
      fetchEventDetails();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading event details...</div>;
  }

  if (error || !event) {
    return (
      <div style={{ padding: '40px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '20px', color: C.red }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <AlertTriangle size={22} />
          <h3 style={{ margin: 0 }}>Event Not Found</h3>
        </div>
        <p style={{ margin: '0 0 20px', color: C.text }}>{error || 'Access denied or event does not exist.'}</p>
        <button
          onClick={() => navigate('/organizer/events')}
          style={{ padding: '8px 16px', background: C.red, color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Back to My Events
        </button>
      </div>
    );
  }

  const availableActions = getAvailableEventActions(event);
  const banner = getEventBannerUrl(event);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
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
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: C.text, margin: 0 }}>
                {event.title}
              </h1>
              <EventStatusBadge status={event.status} />
            </div>
            <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0' }}>
              Created: {formatDate(event.createdAt)} • Slug: {event.slug}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/organizer/events/${id}/tickets`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: C.gold,
              color: '#000000',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            <Ticket size={15} /> Manage Tickets
          </button>

          <button
            onClick={() => navigate(`/organizer/events/${id}/seat-map`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: C.goldDim,
              border: `1px solid ${C.borderGold}`,
              borderRadius: '10px',
              color: C.gold,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Seating & Seat Map
          </button>

          <button
            onClick={() => navigate(`/organizer/events/${id}/preview`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              color: C.text,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Eye size={15} /> Preview
          </button>

          <button
            onClick={() => navigate(`/organizer/events/${id}/edit`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: C.goldDim,
              border: `1px solid ${C.borderGold}`,
              borderRadius: '10px',
              color: C.gold,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Edit size={15} /> Edit Event
          </button>

          {availableActions.filter((a) => a.action !== 'edit' && a.action !== 'view' && a.action !== 'preview').map((act) => (
            <button
              key={act.action}
              onClick={() => handleAction(act.action)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: act.danger ? C.redDim : act.primary ? C.greenDim : C.blueDim,
                border: `1px solid ${act.danger ? C.red : act.primary ? C.green : C.blue}`,
                borderRadius: '10px',
                color: act.danger ? C.red : act.primary ? C.green : C.blue,
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {act.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Banner */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden' }}>
        {banner ? (
          <img src={banner} alt={event.title} style={{ width: '100%', height: '260px', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '160px', background: C.goldDim, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold }}>
            <Calendar size={48} />
          </div>
        )}

        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '12px', color: C.muted, display: 'block', marginBottom: '4px' }}>Category</span>
            <strong style={{ color: C.gold, fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif' }}>
              {event.category?.name || 'Uncategorized'}
            </strong>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: C.muted, display: 'block', marginBottom: '4px' }}>Venue / Location</span>
            <strong style={{ color: C.blue, fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif' }}>
              {event.venue?.name || event.eventVenue?.venueName || 'Venue TBD'}
              {event.city?.name ? `, ${event.city.name}` : ''}
            </strong>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: C.muted, display: 'block', marginBottom: '4px' }}>Event Type & Visibility</span>
            <strong style={{ color: C.text, fontSize: '14px' }}>
              {event.eventType || 'IN_PERSON'} ({event.visibility || 'PUBLIC'})
            </strong>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: C.muted, display: 'block', marginBottom: '4px' }}>Base / Starting Ticket Price</span>
            <strong style={{ color: C.green, fontSize: '15px' }}>
              {(() => {
                if (event.ticketTypes && Array.isArray(event.ticketTypes) && event.ticketTypes.length > 0) {
                  const validPrices = event.ticketTypes
                    .map((t) => Number(t.price))
                    .filter((p) => !isNaN(p) && p >= 0);
                  if (validPrices.length > 0) {
                    const minP = Math.min(...validPrices);
                    return minP > 0 ? formatCurrency(minP) : 'Free';
                  }
                }
                if (event.minPrice !== undefined && event.minPrice !== null && !isNaN(event.minPrice)) {
                  return Number(event.minPrice) > 0 ? formatCurrency(event.minPrice) : 'Free';
                }
                return event.price > 0 ? formatCurrency(event.price) : 'Free';
              })()}
            </strong>
          </div>
        </div>
      </div>

      {/* Description & Schedules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px' }}>
          <h4 style={{ margin: '0 0 12px', color: C.gold, fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>
            Event Description
          </h4>
          <p style={{ color: C.text, fontSize: '14px', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
            {event.description || event.shortDescription || 'No description available.'}
          </p>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px' }}>
          <h4 style={{ margin: '0 0 16px', color: C.gold, fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>
            Schedule & Timings
          </h4>
          {event.schedules && event.schedules.length > 0 ? (
            event.schedules.map((sch) => (
              <div key={sch.id} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', color: C.text, fontWeight: 600 }}>
                  {formatDate(sch.startDate)} to {formatDate(sch.endDate)}
                </div>
                <div style={{ fontSize: '13px', color: C.muted, marginTop: '4px' }}>
                  Timings: {sch.startTime} - {sch.endTime} {sch.gateOpenTime ? `(Gates open: ${sch.gateOpenTime})` : ''}
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: C.muted, fontSize: '13px' }}>
              {formatEventDateTimeLine(event)}
            </div>
          )}
        </div>
      </div>

      {/* Sub-resource Tabs: FAQs & Policies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Policies */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px' }}>
          <h4 style={{ margin: '0 0 14px', color: C.gold, fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>
            Policies & Guidelines
          </h4>
          {event.policy && (event.policy.refundPolicy || event.policy.entryPolicy || event.policy.cancellationPolicy || event.policy.cameraPolicy || event.policy.ageRestriction || event.policy.termsAndConditions) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              {event.policy.refundPolicy && (
                <div>
                  <strong style={{ color: C.gold }}>Refund Policy:</strong>{' '}
                  <span style={{ color: C.text }}>{event.policy.refundPolicy}</span>
                </div>
              )}
              {event.policy.entryPolicy && (
                <div>
                  <strong style={{ color: C.gold }}>Entry Guidelines:</strong>{' '}
                  <span style={{ color: C.text }}>{event.policy.entryPolicy}</span>
                </div>
              )}
              {event.policy.cancellationPolicy && (
                <div>
                  <strong style={{ color: C.gold }}>Cancellation Policy:</strong>{' '}
                  <span style={{ color: C.text }}>{event.policy.cancellationPolicy}</span>
                </div>
              )}
              {event.policy.cameraPolicy && (
                <div>
                  <strong style={{ color: C.gold }}>Camera & Photography:</strong>{' '}
                  <span style={{ color: C.text }}>{event.policy.cameraPolicy}</span>
                </div>
              )}
              {event.policy.ageRestriction && (
                <div>
                  <strong style={{ color: C.gold }}>Age Restrictions:</strong>{' '}
                  <span style={{ color: C.text }}>{event.policy.ageRestriction}</span>
                </div>
              )}
              {event.policy.termsAndConditions && (
                <div>
                  <strong style={{ color: C.gold }}>Terms & Conditions:</strong>{' '}
                  <span style={{ color: C.text }}>{event.policy.termsAndConditions}</span>
                </div>
              )}
            </div>
          ) : (
            <span style={{ color: C.muted, fontSize: '13px' }}>No policy guidelines defined for this event.</span>
          )}
        </div>

        {/* FAQs */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px' }}>
          <h4 style={{ margin: '0 0 14px', color: C.gold, fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>
            Frequently Asked Questions ({event.faqs?.length || 0})
          </h4>
          {event.faqs && event.faqs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {event.faqs.map((f, idx) => (
                <div
                  key={f.id || idx}
                  style={{
                    fontSize: '13px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <strong style={{ color: C.gold, display: 'block', marginBottom: '4px' }}>
                    Q: {f.question}
                  </strong>
                  <span style={{ color: C.text, lineHeight: 1.5 }}>A: {f.answer}</span>
                </div>
              ))}
            </div>
          ) : (
            <span style={{ color: C.muted, fontSize: '13px' }}>No FAQ items configured for this event.</span>
          )}
        </div>
      </div>
    </div>
  );
}
