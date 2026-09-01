import React from 'react';
import { MapPin, Building, Users, Check } from 'lucide-react';
import { C } from '../../../../constants/theme.js';

export const VenueStep = ({ data = {}, onChange, errors = {} }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, color: C.gold, fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>
        Step 2 — Event Venue & Location Details
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
            Venue Name *
          </label>
          <input
            type="text"
            value={data.venueName || ''}
            onChange={(e) => onChange({ venueName: e.target.value })}
            placeholder="e.g. Jio World Convention Centre"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${errors.venueName ? C.red : C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.venueName && <span style={{ color: C.red, fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.venueName}</span>}
        </div>

        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
            City *
          </label>
          <input
            type="text"
            value={data.city || ''}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="e.g. Mumbai"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${errors.city ? C.red : C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.city && <span style={{ color: C.red, fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.city}</span>}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
          Full Address *
        </label>
        <textarea
          rows={3}
          value={data.address || ''}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="Street address, landmark, building number..."
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${errors.address ? C.red : C.border}`,
            borderRadius: '12px',
            color: C.text,
            fontSize: '13px',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
        />
        {errors.address && <span style={{ color: C.red, fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.address}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
            State / Region
          </label>
          <input
            type="text"
            value={data.state || ''}
            onChange={(e) => onChange({ state: e.target.value })}
            placeholder="e.g. Maharashtra"
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

        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
            Country
          </label>
          <input
            type="text"
            value={data.country || 'India'}
            onChange={(e) => onChange({ country: e.target.value })}
            placeholder="India"
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
      </div>

      {/* Amenities Switches */}
      <div>
        <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '12px', fontWeight: 600 }}>
          Venue Amenities & Rules
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { key: 'parkingAvailable', label: 'Parking Available' },
            { key: 'wheelchairAccessible', label: 'Wheelchair Accessible' },
            { key: 'foodAllowed', label: 'Outside Food Allowed' },
            { key: 'smokingAllowed', label: 'Smoking Allowed' },
          ].map((item) => (
            <label
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '13px',
                color: C.text,
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(data[item.key])}
                onChange={(e) => onChange({ [item.key]: e.target.checked })}
                style={{ accentColor: C.gold, width: '16px', height: '16px' }}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
