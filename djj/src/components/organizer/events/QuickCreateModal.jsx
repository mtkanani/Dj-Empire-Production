import React, { useState } from 'react';
import { X, Plus, Building, MapPin, Tag } from 'lucide-react';
import { C } from '../../../constants/theme.js';
import { categoryService } from '../../../services/admin/categoryService.js';
import { cityService } from '../../../services/admin/cityService.js';
import { venueService } from '../../../services/admin/venueService.js';
import { useToast } from '../../../hooks/useToast.js';

export const QuickCreateModal = ({ isOpen, type, cities = [], onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Category Fields
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');

  // City Fields
  const [cityName, setCityName] = useState('');
  const [cityState, setCityState] = useState('');
  const [cityCountry, setCityCountry] = useState('India');

  // Venue Fields
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueCityId, setVenueCityId] = useState(cities[0]?.id || '');
  const [venueCapacity, setVenueCapacity] = useState(500);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (type === 'CATEGORY') {
        const res = await categoryService.createCategory({
          name: categoryName.trim(),
          description: categoryDesc.trim() || undefined,
        });
        const created = res.data || res;
        showToast('New category created successfully!', 'success');
        onSuccess(created);
      } else if (type === 'CITY') {
        const res = await cityService.createCity({
          name: cityName.trim(),
          state: cityState.trim() || undefined,
          country: cityCountry.trim() || 'India',
        });
        const created = res.data || res;
        showToast('New city added successfully!', 'success');
        onSuccess(created);
      } else if (type === 'VENUE') {
        const res = await venueService.createVenue({
          name: venueName.trim(),
          address: venueAddress.trim(),
          cityId: venueCityId || cities[0]?.id,
          capacity: Number(venueCapacity) || 500,
        });
        const created = res.data || res;
        showToast('Custom venue created successfully!', 'success');
        onSuccess(created);
      }
      onClose();
    } catch (err) {
      setError(err.message || `Failed to create ${type.toLowerCase()}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (type === 'CATEGORY') return 'Add Custom Event Category';
    if (type === 'CITY') return 'Add Custom City';
    return 'Create Custom Venue Location';
  };

  const getIcon = () => {
    if (type === 'CATEGORY') return Tag;
    if (type === 'CITY') return MapPin;
    return Building;
  };

  const Icon = getIcon();

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
      <form onSubmit={handleSubmit} style={{ background: C.bgCard, border: `1px solid ${C.borderGold}`, borderRadius: '24px', padding: '24px', maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.gold }}>
            <Icon size={20} />
            <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px' }}>
              {getTitle()}
            </h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {error && <div style={{ padding: '10px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '8px', color: C.red, fontSize: '12px' }}>{error}</div>}

        {/* Category Inputs */}
        {type === 'CATEGORY' && (
          <>
            <div>
              <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>Category Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Salsa & Bachata Workshop"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>Description (Optional)</label>
              <textarea
                rows={2}
                placeholder="Brief summary of events in this category..."
                value={categoryDesc}
                onChange={(e) => setCategoryDesc(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </>
        )}

        {/* City Inputs */}
        {type === 'CITY' && (
          <>
            <div>
              <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>City Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Goa"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>State / Region</label>
              <input
                type="text"
                placeholder="e.g. Goa"
                value={cityState}
                onChange={(e) => setCityState(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </>
        )}

        {/* Venue Inputs */}
        {type === 'VENUE' && (
          <>
            <div>
              <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>Venue Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sunset Beach Resort Arena"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>Street Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. 101 Baga Beach Road"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {cities.length > 0 && (
              <div>
                <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>City Location *</label>
                <select
                  value={venueCityId}
                  onChange={(e) => setVenueCityId(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none' }}
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id} style={{ background: C.bgCard }}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>Venue Capacity *</label>
              <input
                type="number"
                required
                min={1}
                value={venueCapacity}
                onChange={(e) => setVenueCapacity(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 16px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.muted, fontSize: '13px', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: C.gold, color: '#000', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Creating...' : 'Save & Auto-Select'}
          </button>
        </div>
      </form>
    </div>
  );
};
