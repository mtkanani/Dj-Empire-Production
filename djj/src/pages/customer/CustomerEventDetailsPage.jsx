import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Ticket, ShieldCheck, HelpCircle, Tag, Clock, Share2, CheckCircle2 } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { customerEventService } from '../../services/customer/customerEventService.js';
import { eventService } from '../../services/organizer/eventService.js';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar.jsx';
import { CustomerFooter } from '../../components/customer/CustomerFooter.jsx';
import { EventFAQAccordion } from '../../components/customer/EventFAQAccordion.jsx';
import { EventPoliciesCard } from '../../components/customer/EventPoliciesCard.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { getEventBannerUrl } from '../../utils/eventImage.js';
import { getPrimarySchedule, formatEventDate, formatEventTimeRange } from '../../utils/eventSchedule.js';
import { useToast } from '../../hooks/useToast.js';

export default function CustomerEventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await customerEventService.getEventDetails(id);
        const data = res.data || res;
        if (!data) throw new Error('Event not found or unavailable');

        // Parallel fallback fetch for Policy and FAQs if missing on primary object
        const promises = [];
        if (!data.policy && !data.policies && !data.eventPolicies) {
          promises.push(eventService.getPolicy(id).catch(() => null));
        } else {
          promises.push(Promise.resolve({ data: data.policy || data.policies || data.eventPolicies }));
        }

        if ((!data.faqs || data.faqs.length === 0) && (!data.eventFaqs || data.eventFaqs.length === 0)) {
          promises.push(eventService.getFAQs(id).catch(() => null));
        } else {
          promises.push(Promise.resolve({ data: data.faqs || data.eventFaqs }));
        }

        const [policyRes, faqsRes] = await Promise.all(promises);

        const policyData = policyRes?.data || policyRes || data.policy || data.policies || null;
        const faqsData = faqsRes?.data || faqsRes || data.faqs || data.eventFaqs || [];

        setEvent({
          ...data,
          policy: policyData,
          faqs: Array.isArray(faqsData) ? faqsData : [],
        });
      } catch (err) {
        setError(err.message || 'Unable to load event details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Event link copied to clipboard!', 'success');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
        <CustomerNavbar />
        <div style={{ flexGrow: 1, padding: '80px 24px', textAlign: 'center', color: C.muted }}>Loading event details...</div>
        <CustomerFooter />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
        <CustomerNavbar />
        <div style={{ flexGrow: 1, maxWidth: '600px', margin: '80px auto', padding: '40px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '20px', color: C.red, textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontFamily: 'Space Grotesk, sans-serif' }}>Event Not Found</h3>
          <p style={{ margin: '0 0 20px', color: C.text, fontSize: '14px' }}>{error || 'This event is unavailable or does not exist.'}</p>
          <button onClick={() => navigate('/events')} style={{ padding: '10px 20px', background: C.red, color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
            Back to Explore Events
          </button>
        </div>
        <CustomerFooter />
      </div>
    );
  }

  const bannerUrl = getEventBannerUrl(event);
  const categoryName = event.category?.name || 'General';
  const cityName = event.city?.name || event.venue?.city || event.eventVenue?.city || '';
  const venueName = event.venue?.name || event.eventVenue?.venueName || 'Venue TBA';
  const venueAddress = event.venue?.address || event.eventVenue?.address || '';
  const ticketTypes = event.ticketTypes || [];
  const primarySchedule = getPrimarySchedule(event);

  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
      <CustomerNavbar />

      <main style={{ flexGrow: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Back Link & Share Action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('/events')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              color: C.text,
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} /> All Events
          </button>

          <button
            onClick={handleShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              color: C.muted,
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Share2 size={15} /> Share Event
          </button>
        </div>

        {/* Hero Banner Box */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', width: '100%', height: '320px', background: '#090B10' }}>
            {bannerUrl ? (
              <img src={bannerUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.goldDim }}>
                <Calendar size={64} color={C.gold} />
              </div>
            )}

            <span style={{ position: 'absolute', top: '16px', left: '16px', padding: '6px 14px', background: 'rgba(11,15,25,0.9)', backdropFilter: 'blur(8px)', border: `1px solid ${C.border}`, borderRadius: '999px', color: C.gold, fontSize: '12px', fontWeight: 700 }}>
              {categoryName}
            </span>
          </div>

          <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '32px', fontWeight: 800, margin: 0, color: C.text, lineHeight: 1.2 }}>
              {event.title}
            </h1>

            {/* Quick Metadata Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={22} color={C.gold} />
                <div>
                  <span style={{ color: C.muted, fontSize: '11px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date & Schedule</span>
                  <strong style={{ fontSize: '14px', color: C.text, display: 'block' }}>
                    {formatEventDate(primarySchedule)}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={22} color={C.gold} />
                <div>
                  <span style={{ color: C.muted, fontSize: '11px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timing & Gates</span>
                  <strong style={{ fontSize: '14px', color: C.text, display: 'block' }}>
                    {formatEventTimeRange(primarySchedule)}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={22} color={C.blue} />
                <div>
                  <span style={{ color: C.muted, fontSize: '11px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Venue Location</span>
                  <strong style={{ fontSize: '14px', color: C.text, display: 'block' }}>{venueName}{cityName ? `, ${cityName}` : ''}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Content Layout: Left (Description, Schedules, FAQs & Policies), Right (Tickets Overview) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'start' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Event Description */}
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px' }}>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', margin: '0 0 12px', color: C.text }}>
                About This Event
              </h3>
              <p style={{ color: C.muted, fontSize: '14px', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                {event.description || event.shortDescription || 'No detailed description provided for this event.'}
              </p>
            </div>

            {/* Detailed Schedules List if Multiple Dates exist */}
            {event.schedules && event.schedules.length > 0 && (
              <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px' }}>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', margin: '0 0 16px', color: C.gold, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={20} /> Event Schedule & Timings
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {event.schedules.map((sch, i) => (
                    <div key={sch.id || i} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <strong style={{ color: C.text, fontSize: '14px', display: 'block' }}>
                          {formatEventDate(sch)}
                        </strong>
                        <span style={{ fontSize: '13px', color: C.muted }}>
                          Timings: {formatEventTimeRange(sch)}
                        </span>
                      </div>
                      {sch.gateOpenTime && (
                        <span style={{ fontSize: '12px', color: C.gold, background: C.goldDim, padding: '4px 10px', borderRadius: '20px', border: `1px solid ${C.borderGold}` }}>
                          Gates Open: {sch.gateOpenTime}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Policies & Guidelines */}
            <EventPoliciesCard policies={event.policy || event.policies || event.eventPolicies} />

            {/* Event FAQs */}
            <EventFAQAccordion faqs={event.faqs || event.eventFaqs} />
          </div>

          {/* Right Column — Ticket Tiers & Booking CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '100px' }}>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', margin: 0, color: C.gold }}>
                Ticket Tiers & Pricing
              </h3>

              {ticketTypes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {ticketTypes.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: '14px',
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${C.border}`,
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
                          {t.name}
                        </span>
                        {t.description && <span style={{ fontSize: '12px', color: C.muted }}>{t.description}</span>}
                      </div>

                      <strong style={{ fontSize: '16px', color: C.gold, fontFamily: 'Space Grotesk, sans-serif' }}>
                        {t.price === 0 ? 'Free Entry' : formatCurrency(t.price)}
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: C.muted, fontSize: '13px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center' }}>
                  General Admission Ticket Pricing
                </div>
              )}

              {/* Booking Action Button */}
              <button
                onClick={() => navigate(`/events/${id}/book`)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: C.gold,
                  color: '#000000',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: 800,
                  fontFamily: 'Space Grotesk, sans-serif',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: '0 4px 16px rgba(234, 179, 8, 0.3)',
                }}
              >
                Book Tickets Now
              </button>
            </div>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
