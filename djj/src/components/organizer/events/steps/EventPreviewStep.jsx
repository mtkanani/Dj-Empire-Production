import React from 'react';
import { Calendar, MapPin, Tag, Shield, HelpCircle, Eye, Ticket, Globe } from 'lucide-react';
import { C } from '../../../../constants/theme.js';
import { formatDate, formatCurrency } from '../../../../utils/formatters.js';

export const EventPreviewStep = ({ basicInfo = {}, venue = {}, schedule = {}, policy = {}, faqs = [], seo = {} }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Preview Mode Notice Header */}
      <div
        style={{
          background: C.goldDim,
          border: `1px solid ${C.borderGold}`,
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: C.gold,
        }}
      >
        <Eye size={20} />
        <div>
          <strong style={{ display: 'block', fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif' }}>
            Event Preview Mode
          </strong>
          <span style={{ fontSize: '12px', color: C.text }}>
            This is how your event page will appear to attendees when published live.
          </span>
        </div>
      </div>

      {/* Hero Banner & Core Event Overview */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden' }}>
        {basicInfo.bannerUrl ? (
          <img src={basicInfo.bannerUrl} alt={basicInfo.title} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '180px', background: C.goldDim, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold }}>
            <Calendar size={48} />
          </div>
        )}

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 12px', borderRadius: '999px', background: C.blueDim, color: C.blue, fontSize: '12px', fontWeight: 600 }}>
              {basicInfo.eventType || 'IN_PERSON'}
            </span>
            <span style={{ padding: '4px 12px', borderRadius: '999px', background: C.goldDim, color: C.gold, fontSize: '12px', fontWeight: 600 }}>
              {basicInfo.visibility || 'PUBLIC'}
            </span>
          </div>

          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '26px', fontWeight: 700, color: C.text, margin: '0 0 8px' }}>
            {basicInfo.title || 'Untitled Event'}
          </h2>

          {basicInfo.shortDescription && (
            <p style={{ color: C.muted, fontSize: '15px', margin: '0 0 16px', lineHeight: 1.5 }}>
              {basicInfo.shortDescription}
            </p>
          )}

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', paddingTop: '16px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.text, fontSize: '14px' }}>
              <Calendar size={18} color={C.gold} />
              <div>
                <strong style={{ display: 'block', fontSize: '12px', color: C.muted }}>Date & Time</strong>
                {formatDate(schedule.startDate) || 'TBA'} {schedule.startTime ? `@ ${schedule.startTime}` : ''}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.text, fontSize: '14px' }}>
              <MapPin size={18} color={C.blue} />
              <div>
                <strong style={{ display: 'block', fontSize: '12px', color: C.muted }}>Location</strong>
                {venue.venueName || 'Venue TBD'}{venue.city ? `, ${venue.city}` : ''}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.text, fontSize: '14px' }}>
              <Ticket size={18} color={C.green} />
              <div>
                <strong style={{ display: 'block', fontSize: '12px', color: C.muted }}>Price</strong>
                {basicInfo.price > 0 ? formatCurrency(basicInfo.price) : 'Free Entry'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {basicInfo.description && (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px' }}>
          <h4 style={{ margin: '0 0 12px', color: C.gold, fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>
            About The Event
          </h4>
          <p style={{ color: C.text, fontSize: '14px', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
            {basicInfo.description}
          </p>
        </div>
      )}

      {/* Policies */}
      {policy && (policy.refundPolicy || policy.entryPolicy || policy.cancellationPolicy) && (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px' }}>
          <h4 style={{ margin: '0 0 14px', color: C.gold, fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>
            Event Policies & Rules
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {policy.refundPolicy && (
              <div>
                <strong style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '4px' }}>Refund Policy</strong>
                <span style={{ color: C.text, fontSize: '13px' }}>{policy.refundPolicy}</span>
              </div>
            )}
            {policy.entryPolicy && (
              <div>
                <strong style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '4px' }}>Entry Policy</strong>
                <span style={{ color: C.text, fontSize: '13px' }}>{policy.entryPolicy}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAQs */}
      {faqs && faqs.length > 0 && (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px' }}>
          <h4 style={{ margin: '0 0 16px', color: C.gold, fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>
            Frequently Asked Questions
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: '10px' }}>
                <strong style={{ display: 'block', color: C.text, fontSize: '14px', marginBottom: '4px' }}>Q: {f.question}</strong>
                <span style={{ color: C.muted, fontSize: '13px' }}>A: {f.answer}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
