import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Search, Filter, RefreshCw, AlertTriangle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { eventService } from '../../services/organizer/eventService.js';
import { categoryService } from '../../services/admin/categoryService.js';
import { cityService } from '../../services/admin/cityService.js';
import { EventTable } from '../../components/organizer/events/EventTable.jsx';
import { Pagination } from '../../components/admin/Pagination.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function MyEventsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Master Data Selectors
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load Master Categories & Cities
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [catRes, cityRes] = await Promise.allSettled([
          categoryService.getCategories(),
          cityService.getCities(),
        ]);
        if (catRes.status === 'fulfilled') setCategories(catRes.value?.data || catRes.value || []);
        if (cityRes.status === 'fulfilled') setCities(cityRes.value?.data || cityRes.value || []);
      } catch {
        // Fallback gracefully
      }
    };
    loadMasterData();
  }, []);

  // Fetch Events List from Backend
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        categoryId: categoryFilter || undefined,
        city: cityFilter || undefined,
      };

      const res = await eventService.getEvents(params);
      const dataArr = res?.data || res || [];
      const metaObj = res?.meta || { page: 1, limit, total: dataArr.length, totalPages: 1 };

      setEvents(Array.isArray(dataArr) ? dataArr : []);
      setMeta(metaObj);
    } catch (err) {
      setError(err.message || 'Unable to load events. Please try again.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter, categoryFilter, cityFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // FSM Action Handler Trigger
  const handleStateAction = async (eventId, action) => {
    try {
      if (action === 'submit-approval') {
        await eventService.submitForApproval(eventId);
        showToast('Submitted event for Super Admin approval', 'info');
      } else if (action === 'publish') {
        await eventService.publishEvent(eventId);
        showToast('Event published live successfully!', 'success');
      } else if (action === 'unpublish') {
        await eventService.unpublishEvent(eventId);
        showToast('Event unpublished and reverted to draft status', 'info');
      } else if (action === 'cancel') {
        await eventService.cancelEvent(eventId);
        showToast('Event marked as cancelled', 'warning');
      } else if (action === 'archive') {
        await eventService.archiveEvent(eventId);
        showToast('Event archived and hidden from active dashboard', 'info');
      } else if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
          await eventService.deleteEvent(eventId);
          showToast('Event deleted successfully!', 'success');
        }
      }

      fetchEvents();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: C.text, margin: 0 }}>
            My Events
          </h1>
          <p style={{ color: C.muted, fontSize: '14px', margin: '4px 0 0' }}>
            Manage, publish, and track events created under your organization.
          </p>
        </div>

        <button
          onClick={() => navigate('/organizer/events/create')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: C.gold,
            color: '#000000',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '13px',
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Create Event
        </button>
      </div>

      {/* Search & Multi-Filter Toolbar */}
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '220px' }}>
          <Search size={16} color={C.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search events by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: '10px',
            color: C.text,
            padding: '8px 12px',
            fontSize: '13px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="PendingApproval">Pending Approval</option>
          <option value="Approved">Approved</option>
          <option value="Published">Published (Live)</option>
          <option value="Unpublished">Unpublished</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Completed">Completed</option>
          <option value="Archived">Archived (Hidden from Dashboard)</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: '10px',
            color: C.text,
            padding: '8px 12px',
            fontSize: '13px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Refresh Button */}
        <button
          onClick={fetchEvents}
          style={{
            padding: '8px 14px',
            background: C.goldDim,
            border: `1px solid ${C.borderGold}`,
            borderRadius: '10px',
            color: C.gold,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Network Error State */}
      {error && (
        <div style={{ padding: '16px 20px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '14px', color: C.red, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} /> <span>{error}</span>
          </div>
          <button onClick={fetchEvents} style={{ padding: '6px 12px', background: C.red, color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
            Retry
          </button>
        </div>
      )}

      {/* Events Data Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: C.muted }}>Loading event records...</div>
      ) : events.length === 0 ? (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '60px 20px', textAlign: 'center', color: C.muted }}>
          <Calendar size={42} color={C.gold} style={{ marginBottom: '16px' }} />
          <h3 style={{ color: C.text, margin: '0 0 8px', fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>No events found</h3>
          <p style={{ margin: '0 0 20px', fontSize: '14px' }}>
            {debouncedSearch || statusFilter ? 'No events match your current search and filter rules.' : 'You have not created any events yet.'}
          </p>
          <button
            onClick={() => navigate('/organizer/events/create')}
            style={{ padding: '10px 20px', background: C.gold, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <>
          <EventTable events={events} loading={loading} onStateAction={handleStateAction} />

          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}
    </div>
  );
}
