import React from 'react';
import { Globe, Search, Share2 } from 'lucide-react';
import { C } from '../../../../constants/theme.js';

export const SEOSettingsStep = ({ data = {}, onChange, errors = {} }) => {
  const keywordsString = Array.isArray(data.keywords) ? data.keywords.join(', ') : data.keywords || '';

  const handleKeywordsChange = (val) => {
    const arr = val.split(',').map((s) => s.trim()).filter(Boolean);
    onChange({ keywords: arr });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, color: C.gold, fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>
        Step 6 — SEO & Social Sharing Metadata
      </h3>

      {/* Meta Title */}
      <div>
        <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
          Meta Search Title
        </label>
        <input
          type="text"
          value={data.metaTitle || ''}
          onChange={(e) => onChange({ metaTitle: e.target.value })}
          placeholder="e.g. Summer Music Festival 2026 | Live Concert Tickets"
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            color: C.text,
            fontSize: '13px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Meta Description */}
      <div>
        <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
          Meta Description
        </label>
        <textarea
          rows={3}
          value={data.metaDescription || ''}
          onChange={(e) => onChange({ metaDescription: e.target.value })}
          placeholder="Search engine snippet description..."
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            color: C.text,
            fontSize: '13px',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Keywords */}
      <div>
        <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
          SEO Keywords (Comma separated)
        </label>
        <input
          type="text"
          value={keywordsString}
          onChange={(e) => handleKeywordsChange(e.target.value)}
          placeholder="music, festival, concert, live, electronic music, tickets"
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            color: C.text,
            fontSize: '13px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Canonical URL & OG Image */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
            Canonical URL (Optional)
          </label>
          <input
            type="url"
            value={data.canonicalUrl || ''}
            onChange={(e) => onChange({ canonicalUrl: e.target.value })}
            placeholder="https://example.com/events/summer-festival"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${errors.canonicalUrl ? C.red : C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.canonicalUrl && <span style={{ color: C.red, fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.canonicalUrl}</span>}
        </div>

        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
            OpenGraph Social Sharing Image URL
          </label>
          <input
            type="url"
            value={data.ogImage || ''}
            onChange={(e) => onChange({ ogImage: e.target.value })}
            placeholder="https://example.com/og-share.jpg"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${errors.ogImage ? C.red : C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.ogImage && <span style={{ color: C.red, fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.ogImage}</span>}
        </div>
      </div>

      {/* Live SEO Search Result Preview Snippet */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', marginTop: '10px' }}>
        <h4 style={{ margin: '0 0 12px', color: C.gold, fontSize: '13px', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif' }}>
          Search Engine Result Preview
        </h4>
        <div style={{ fontFamily: 'sans-serif' }}>
          <div style={{ color: '#8ab4f8', fontSize: '16px', fontWeight: 500, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {data.metaTitle || data.title || 'Event Title — Event Booking'}
          </div>
          <div style={{ fontSize: '12px', margin: '0 0 4px', color: '#bdc1c6' }}>
            {data.canonicalUrl || 'https://eventbooking.com/events/your-event-slug'}
          </div>
          <div style={{ color: '#9aa0a6', fontSize: '13px', lineHeight: 1.4 }}>
            {data.metaDescription || data.shortDescription || 'Your event search snippet preview will appear here when users search on Google or Bing.'}
          </div>
        </div>
      </div>
    </div>
  );
};
