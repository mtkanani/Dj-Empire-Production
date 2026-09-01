import React from 'react';
import { Filter, X, Search, MapPin, Tag, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const EventFilters = ({
  search = '',
  categoryId = '',
  cityId = '',
  minPrice = '',
  maxPrice = '',
  startDate = '',
  endDate = '',
  categories = [],
  cities = [],
  onFilterChange,
  onClearAll,
}) => {
  const hasActiveFilters = Boolean(search || categoryId || cityId || minPrice || maxPrice || startDate || endDate);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedCity = cities.find((c) => c.id === cityId);

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: '20px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.gold }}>
          <Filter size={18} />
          <h4 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', color: C.text }}>
            Filter Events
          </h4>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            style={{
              background: 'transparent',
              border: 'none',
              color: C.red,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RefreshCw size={12} /> Clear All
          </button>
        )}
      </div>

      {/* Active Filter Chips Bar */}
      {hasActiveFilters && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {search && (
            <span style={{ padding: '4px 10px', borderRadius: '999px', background: C.goldDim, border: `1px solid ${C.borderGold}`, color: C.gold, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Search: "{search}" <X size={12} style={{ cursor: 'pointer' }} onClick={() => onFilterChange('search', '')} />
            </span>
          )}
          {selectedCategory && (
            <span style={{ padding: '4px 10px', borderRadius: '999px', background: C.blueDim, border: `1px solid ${C.blue}`, color: C.blue, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Category: {selectedCategory.name} <X size={12} style={{ cursor: 'pointer' }} onClick={() => onFilterChange('categoryId', '')} />
            </span>
          )}
          {selectedCity && (
            <span style={{ padding: '4px 10px', borderRadius: '999px', background: C.greenDim, border: `1px solid ${C.green}`, color: C.green, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              City: {selectedCity.name} <X size={12} style={{ cursor: 'pointer' }} onClick={() => onFilterChange('cityId', '')} />
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span style={{ padding: '4px 10px', borderRadius: '999px', background: C.amberDim, border: `1px solid ${C.amber}`, color: C.amber, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Price: ₹{minPrice || 0} – ₹{maxPrice || '∞'} <X size={12} style={{ cursor: 'pointer' }} onClick={() => { onFilterChange('minPrice', ''); onFilterChange('maxPrice', ''); }} />
            </span>
          )}
        </div>
      )}

      {/* Keyword Search */}
      <div>
        <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>
          Keyword Search
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px' }}>
          <Search size={16} color={C.muted} />
          <input
            type="text"
            value={search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Event title or keyword..."
            style={{ width: '100%', background: 'transparent', border: 'none', color: C.text, fontSize: '13px', outline: 'none' }}
          />
        </div>
      </div>

      {/* Category Dropdown */}
      <div>
        <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>
          Category
        </label>
        <select
          value={categoryId}
          onChange={(e) => onFilterChange('categoryId', e.target.value)}
          style={{ width: '100%', padding: '9px 12px', background: '#0D111C', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', cursor: 'pointer' }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* City Dropdown */}
      <div>
        <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>
          City / Location
        </label>
        <select
          value={cityId}
          onChange={(e) => onFilterChange('cityId', e.target.value)}
          style={{ width: '100%', padding: '9px 12px', background: '#0D111C', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', cursor: 'pointer' }}
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div>
        <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>
          Price Range (₹)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            placeholder="Min ₹"
            style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
          />
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            placeholder="Max ₹"
            style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>
    </div>
  );
};
