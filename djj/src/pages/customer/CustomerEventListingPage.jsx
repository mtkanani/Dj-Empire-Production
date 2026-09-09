import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { customerEventService } from '../../services/customer/customerEventService.js';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar.jsx';
import { Footer } from '../../components/Layout.jsx';
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
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters = Boolean(search || categoryId || cityId || minPrice || maxPrice);

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

  const fetchEvents = useCallback(async ({ showSkeleton = false } = {}) => {
    if (showSkeleton) setLoading(true);
    setError(null);
    try {
      const params = { limit: 24 };
      if (search.trim()) params.search = search.trim();
      if (categoryId) params.categoryId = categoryId;
      if (cityId) params.cityId = cityId;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const evRes = await customerEventService.browseEvents(params);
      const rawEv = evRes.data || evRes || [];
      setEvents(Array.isArray(rawEv) ? rawEv : []);
    } catch (err) {
      setError(err.message || 'Unable to load events listing.');
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, cityId, minPrice, maxPrice]);

  useEffect(() => {
    const loadFilters = async () => {
      const [catRes, citRes] = await Promise.allSettled([
        customerEventService.getCategories(),
        customerEventService.getCities(),
      ]);
      if (catRes.status === 'fulfilled') {
        const rawCat = catRes.value.data || catRes.value || [];
        setCategories(Array.isArray(rawCat) ? rawCat : []);
      }
      if (citRes.status === 'fulfilled') {
        const rawCit = citRes.value.data || citRes.value || [];
        setCities(Array.isArray(rawCit) ? rawCit : []);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    const hasList = events.length > 0;
    const timer = setTimeout(() => {
      fetchEvents({ showSkeleton: !hasList });
    }, search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  useEffect(() => {
    if (!filtersOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setFiltersOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [filtersOpen]);

  const filterProps = {
    search,
    categoryId,
    cityId,
    minPrice,
    maxPrice,
    categories,
    cities,
    onFilterChange: handleFilterChange,
    onClearAll: handleClearAll,
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
      <CustomerNavbar />

      <main className="explore-main" style={{ flexGrow: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '30px', boxSizing: 'border-box' }}>
        <div>
          <h1 className="explore-title" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '32px', fontWeight: 800, margin: '0 0 8px', color: C.text }}>
            Explore Live Events
          </h1>
          <p className="explore-subtitle" style={{ color: C.muted, fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
            Browse upcoming concerts, summits, sports matches, and cultural festivals.
          </p>
        </div>

        <div className="explore-toolbar" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: C.muted, fontWeight: 600 }}>
            Showing <strong style={{ color: C.gold }}>{events.length}</strong> events
          </span>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              minHeight: '44px',
              padding: '10px 16px',
              borderRadius: '12px',
              border: `1px solid ${C.borderGold}`,
              background: C.goldDim,
              color: C.gold,
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters ? (
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.gold }} />
            ) : null}
          </button>
        </div>

        <div className="explore-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 300px) 1fr', gap: '30px', alignItems: 'start' }}>
          <aside className="explore-filters-desktop">
            <EventFilters {...filterProps} />
          </aside>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
            <div className="explore-count-desktop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: C.muted, fontWeight: 600 }}>
                Showing <strong style={{ color: C.gold }}>{events.length}</strong> Published Events
                {loading && events.length > 0 ? (
                  <span style={{ marginLeft: 8, color: C.gold, fontWeight: 500 }}>Updating…</span>
                ) : null}
              </span>
            </div>

            <EventGrid events={events} loading={loading && events.length === 0} error={error} onRetry={() => fetchEvents({ showSkeleton: events.length === 0 })} />
          </div>
        </div>
      </main>

      {filtersOpen ? (
        <div
          className="explore-filter-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Event filters"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setFiltersOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: C.bgMain,
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              padding: '16px 16px 28px',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px' }}>Filters</span>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  border: `1px solid ${C.border}`,
                  background: 'transparent',
                  color: C.text,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>
            <EventFilters {...filterProps} />
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              style={{
                width: '100%',
                marginTop: '16px',
                minHeight: '48px',
                borderRadius: '12px',
                border: 'none',
                background: C.gold,
                color: '#000',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Show {events.length} events
            </button>
          </div>
        </div>
      ) : null}

      <Footer />

      <style>{`
        @media (max-width: 980px) {
          .explore-main {
            padding: 28px 16px 40px !important;
            gap: 20px !important;
          }
          .explore-title {
            font-size: 26px !important;
          }
          .explore-layout {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .explore-filters-desktop {
            display: none !important;
          }
          .explore-count-desktop {
            display: none !important;
          }
          .explore-toolbar {
            display: flex !important;
          }
        }

        @media (max-width: 480px) {
          .explore-main {
            padding: 20px 12px 32px !important;
          }
          .explore-title {
            font-size: 22px !important;
          }
          .explore-subtitle {
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
}
