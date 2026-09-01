import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, ChevronLeft, ChevronRight, Ticket, RefreshCw } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { attendanceAnalyticsService } from '../../services/organizer/attendanceAnalyticsService.js';
import { eventService as organizerEventService } from '../../services/organizer/eventService.js';
import { RecentCheckInsTable } from '../../components/analytics/RecentCheckInsTable.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function CheckInHistoryPage() {
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [scanResultFilter, setScanResultFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Organizer Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await organizerEventService.getMyEvents({ limit: 100 });
        const data = res.data || res;
        const list = Array.isArray(data) ? data : data.events || [];
        setEvents(list);
        if (list.length > 0) setSelectedEventId(list[0].id);
      } catch {
        // Safe silent fail
      }
    };
    fetchEvents();
  }, []);

  // Fetch Scan History Logs with pagination & filter
  const fetchLogs = async () => {
    if (!selectedEventId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceAnalyticsService.getCheckInHistory(selectedEventId, {
        page,
        limit,
        scanResult: scanResultFilter || undefined,
      });

      const data = res.data || res;
      setLogs(Array.isArray(data) ? data : data.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      setError(err.message || 'Unable to retrieve scan audit history logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedEventId, page, scanResultFilter]);

  const totalPages = Math.ceil((meta.total || logs.length) / limit) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, margin: 0, color: C.text }}>
          Scan Verification Audit History
        </h1>
        <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '13px' }}>
          Inspect comprehensive scan verification audit logs, entrance turnstile timestamps, and security rejection events
        </p>
      </div>

      {/* Toolbar: Event & Result Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Event Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '6px 14px' }}>
            <Ticket size={16} color={C.gold} />
            <span style={{ fontSize: '12px', color: C.muted, fontWeight: 600 }}>Select Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setPage(1);
              }}
              style={{ padding: '6px 12px', background: 'transparent', border: 'none', color: C.text, fontSize: '13px', fontWeight: 600, outline: 'none' }}
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id} style={{ background: C.bgCard }}>{ev.title}</option>
              ))}
            </select>
          </div>

          {/* Outcome Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '6px 14px' }}>
            <Filter size={16} color={C.blue} />
            <span style={{ fontSize: '12px', color: C.muted, fontWeight: 600 }}>Outcome Filter:</span>
            <select
              value={scanResultFilter}
              onChange={(e) => {
                setScanResultFilter(e.target.value);
                setPage(1);
              }}
              style={{ padding: '6px 12px', background: 'transparent', border: 'none', color: C.text, fontSize: '13px', fontWeight: 600, outline: 'none' }}
            >
              <option value="" style={{ background: C.bgCard }}>All Outcome Results</option>
              <option value="SUCCESS" style={{ background: C.bgCard }}>SUCCESS (Entry Granted)</option>
              <option value="DUPLICATE_SCAN" style={{ background: C.bgCard }}>DUPLICATE_SCAN (Already Used)</option>
              <option value="INVALID_SIGNATURE" style={{ background: C.bgCard }}>INVALID_SIGNATURE (Tampered QR)</option>
              <option value="CANCELLED_BOOKING" style={{ background: C.bgCard }}>CANCELLED_BOOKING</option>
              <option value="WRONG_SECTION" style={{ background: C.bgCard }}>WRONG_SECTION</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            color: C.text,
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh Audit Logs
        </button>
      </div>

      {/* Main Audit History Table Component */}
      <RecentCheckInsTable logs={logs} loading={loading} />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border}`, paddingTop: '16px' }}>
          <span style={{ fontSize: '13px', color: C.muted }}>
            Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({meta.total || logs.length} audit logs)
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1 }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
