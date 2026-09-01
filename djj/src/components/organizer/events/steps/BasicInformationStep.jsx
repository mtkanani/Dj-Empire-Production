import React, { useState } from 'react';
import { Calendar, Tag, MapPin, Globe, DollarSign, Image, Plus, Building } from 'lucide-react';
import { C } from '../../../../constants/theme.js';
import { QuickCreateModal } from '../QuickCreateModal.jsx';

export const BasicInformationStep = ({
  data,
  onChange,
  categories = [],
  cities = [],
  venues = [],
  onCategoryCreated,
  onCityCreated,
  onVenueCreated,
  errors = {},
}) => {
  const [modalType, setModalType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleCreated = (item) => {
    if (modalType === 'CATEGORY') {
      if (onCategoryCreated) onCategoryCreated(item);
      onChange({ categoryId: item.id });
    } else if (modalType === 'CITY') {
      if (onCityCreated) onCityCreated(item);
      onChange({ cityId: item.id });
    } else if (modalType === 'VENUE') {
      if (onVenueCreated) onVenueCreated(item);
      onChange({ venueId: item.id });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, color: C.gold, fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>
        Step 1 — Basic Event Information
      </h3>

      {/* Event Title */}
      <div>
        <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
          Event Title *
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Summer Music & Tech Festival 2026"
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${errors.title ? C.red : C.border}`,
            borderRadius: '12px',
            color: C.text,
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {errors.title && <span style={{ color: C.red, fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.title}</span>}
      </div>

      {/* Short Description */}
      <div>
        <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
          Short Description / Tagline
        </label>
        <input
          type="text"
          value={data.shortDescription || ''}
          onChange={(e) => onChange({ shortDescription: e.target.value })}
          placeholder="Brief 1-liner summary of your event..."
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

      {/* Detailed Description */}
      <div>
        <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
          Full Event Description
        </label>
        <textarea
          rows={5}
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Detailed event program, highlights, instructions, artist line-up..."
          style={{
            width: '100%',
            padding: '12px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            color: C.text,
            fontSize: '13px',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
      </div>

      {/* Banner image URL */}
      <div>
        <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
          Event Banner Image URL
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Image size={16} color={C.gold} style={{ flexShrink: 0 }} />
          <input
            type="url"
            value={data.bannerUrl || ''}
            onChange={(e) => onChange({ bannerUrl: e.target.value })}
            placeholder="https://example.com/event-banner.jpg"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${errors.bannerUrl ? C.red : C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        {errors.bannerUrl && (
          <span style={{ color: C.red, fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.bannerUrl}</span>
        )}
        <span style={{ color: C.muted, fontSize: '11px', marginTop: '6px', display: 'block' }}>
          Use a direct image link (.jpg, .png, .webp). Sharing pages (Google Drive “view”) often will not display.
        </span>
        {data.bannerUrl ? (
          <img
            key={data.bannerUrl}
            src={data.bannerUrl}
            alt="Banner preview"
            style={{
              marginTop: '10px',
              width: '100%',
              maxHeight: '180px',
              objectFit: 'cover',
              borderRadius: '12px',
              border: `1px solid ${C.border}`,
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            onLoad={(e) => {
              e.currentTarget.style.display = 'block';
            }}
          />
        ) : null}
      </div>

      {/* Category, City, Venue Selectors with Inline Quick Add Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Category */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ color: C.muted, fontSize: '13px', fontWeight: 500 }}>Category</label>
            <button
              type="button"
              onClick={() => openModal('CATEGORY')}
              style={{ background: 'transparent', border: 'none', color: C.gold, fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              <Plus size={14} /> Add Category
            </button>
          </div>
          <select
            value={data.categoryId || ''}
            onChange={(e) => onChange({ categoryId: e.target.value || null })}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Select Category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ color: C.muted, fontSize: '13px', fontWeight: 500 }}>City</label>
            <button
              type="button"
              onClick={() => openModal('CITY')}
              style={{ background: 'transparent', border: 'none', color: C.gold, fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              <Plus size={14} /> Add City
            </button>
          </div>
          <select
            value={data.cityId || ''}
            onChange={(e) => onChange({ cityId: e.target.value || null })}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Select City...</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name} {city.state ? `(${city.state})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Venue */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ color: C.muted, fontSize: '13px', fontWeight: 500 }}>Master Venue</label>
            <button
              type="button"
              onClick={() => openModal('VENUE')}
              style={{ background: 'transparent', border: 'none', color: C.gold, fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              <Plus size={14} /> Add Venue
            </button>
          </div>
          <select
            value={data.venueId || ''}
            onChange={(e) => onChange({ venueId: e.target.value || null })}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Select Venue...</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.address})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Create Modal Integration */}
      <QuickCreateModal
        isOpen={isModalOpen}
        type={modalType}
        cities={cities}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreated}
      />
    </div>
  );
};
