import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RefreshCw, Layers } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { customerEventService } from '../../services/customer/customerEventService.js';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar.jsx';
import { CustomerFooter } from '../../components/customer/CustomerFooter.jsx';
import { EventFilters } from '../../components/customer/EventFilters.jsx';
import { EventGrid } from '../../components/customer/EventGrid.jsx';

export default function CustomerEventListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [cityId, setCityId] = useState(searchParams.get('cityId') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state to URL params
  const updateURLParams = useCallback((key, value) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      return newParams;
    });
  }, [setSearchParams]);

  const handleFilterChange = (key, val) => {
    if (key === 'search') setSearch(val);
    if (key === 'categoryId') setCategoryId(val);
    if (key === 'cityId') setCityId(val);
    if (key === 'minPrice') setMinPrice(val);
    if (key === 'maxPrice') setMaxPrice(val);

    updateURLParams(key, val);
  };

  const handleClearAll = () => {
    setSearch('');
    setCategoryId('');
    setCityId('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (categoryId) params.categoryId = categoryId;
      if (cityId) params.cityId = cityId;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const [evRes, catRes, citRes] = await Promise.allSettled([
        customerEventService.browseEvents(params),
        customerEventService.getCategories(),
        customerEventService.getCities(),
      ]);

      if (evRes.status === 'fulfilled') {
        const rawEv = evRes.value.data || evRes.value || [];
        setEvents(Array.isArray(rawEv) ? rawEv : []);
      } else {
        throw new Error('Failed to fetch events');
      }

      if (catRes.status === 'fulfilled') {
        const rawCat = catRes.value.data || catRes.value || [];
        setCategories(Array.isArray(rawCat) ? rawCat : []);
      }

      if (citRes.status === 'fulfilled') {
        const rawCit = citRes.value.data || citRes.value || [];
        setCities(Array.isArray(rawCit) ? rawCit : []);
      }
    } catch (err) {
      setError(err.message || 'Unable to load events listing.');
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, cityId, minPrice, maxPrice]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
      <CustomerNavbar />

      <main style={{ flexGrow: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Header Title */}
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '32px', fontWeight: 800, margin: '0 0 8px', color: C.text }}>
            Explore Live Events
          </h1>
          <p style={{ color: C.muted, fontSize: '14px', margin: 0 }}>
            Browse upcoming concerts, summits, sports matches, and cultural festivals.
          </p>
        </div>

        {/* 2-Column Layout: Left (Filter Panel), Right (Event Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 300px) 1fr', gap: '30px', alignItems: 'start' }}>
          {/* Left Filter Sidebar */}
          <EventFilters
            search={search}
            categoryId={categoryId}
            cityId={cityId}
            minPrice={minPrice}
            maxPrice={maxPrice}
            categories={categories}
            cities={cities}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAll}
          />

          {/* Right Main Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: C.muted, fontWeight: 600 }}>
                Showing <strong style={{ color: C.gold }}>{events.length}</strong> Published Events
              </span>
            </div>

            <EventGrid events={events} loading={loading} error={error} onRetry={fetchEvents} />
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
