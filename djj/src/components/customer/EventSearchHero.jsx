import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const EventSearchHero = ({ cities = [], onSearch }) => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (keyword.trim()) queryParams.set('search', keyword.trim());
    if (selectedCityId) queryParams.set('cityId', selectedCityId);

    navigate(`/events?${queryParams.toString()}`);
  };

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '30px',
        padding: '60px 30px',
        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(11, 15, 25, 0.9) 100%)',
        border: `1px solid ${C.borderGold}`,
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        overflow: 'hidden',
      }}
    >
      {/* Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: C.goldDim,
          border: `1px solid ${C.borderGold}`,
          borderRadius: '999px',
          color: C.gold,
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.5px',
        }}
      >
        <Sparkles size={14} /> DISCOVER LIVE EXPERIENCES NEAR YOU
      </div>

      {/* Main Title & Subtitle */}
      <div>
        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 800,
            color: C.text,
            margin: '0 0 12px',
            lineHeight: 1.15,
            letterSpacing: '-1px',
          }}
        >
          Find & Book Extraordinary <br />
          <span style={{ color: C.gold, background: 'linear-gradient(90deg, #EAB308 0%, #FACC15 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Live Events Anywhere
          </span>
        </h1>
        <p style={{ color: C.muted, fontSize: '15px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Explore top music concerts, tech conferences, sports tournaments, and comedy shows hosted by verified organizers.
        </p>
      </div>

      {/* Search Bar Container */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: '20px',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          maxWidth: '780px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
          flexWrap: 'wrap',
        }}
      >
        {/* Keyword Search Input */}
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', minWidth: '200px' }}>
          <Search size={18} color={C.gold} />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search events, artists, venues..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: C.text,
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ width: '1px', height: '30px', background: C.border, display: 'none' }} className="search-divider" />

        {/* City Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', minWidth: '160px' }}>
          <MapPin size={18} color={C.muted} />
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <option value="" style={{ background: '#0D111C' }}>All Locations</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id} style={{ background: '#0D111C' }}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search CTA */}
        <button
          type="submit"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: C.gold,
            color: '#000000',
            border: 'none',
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(234, 179, 8, 0.3)',
          }}
        >
          Explore Events <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
};
