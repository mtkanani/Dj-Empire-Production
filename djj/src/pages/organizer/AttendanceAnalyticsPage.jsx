import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, RefreshCw, Filter, ShieldCheck, Download, Calendar } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { attendanceAnalyticsService } from '../../services/organizer/attendanceAnalyticsService.js';
import { eventService as organizerEventService } from '../../services/organizer/eventService.js';
import { AttendanceOverviewCards } from '../../components/analytics/AttendanceOverviewCards.jsx';
import { HourlyCheckInsChart } from '../../components/analytics/HourlyCheckInsChart.jsx';
import { GateDistributionChart } from '../../components/analytics/GateDistributionChart.jsx';
import { ScanResultBreakdown } from '../../components/analytics/ScanResultBreakdown.jsx';
import { RecentCheckInsTable } from '../../components/analytics/RecentCheckInsTable.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function AttendanceAnalyticsPage() {
  const { eventId: routeEventId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(routeEventId || '');
  const [attendanceStats, setAttendanceStats] = useState({});
  const [scannerMetrics, setScannerMetrics] = useState({});
  const [historyLogs, setHistoryLogs] = useState([]);
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
        if (!selectedEventId && list.length > 0) {
          setSelectedEventId(list[0].id);
        }
      } catch {
        // Safe silent fail
      }
    };
    fetchEvents();
  }, []);

  // Fetch Analytics & History for selected Event
  const fetchAnalytics = async () => {
    if (!selectedEventId) return;
    setLoading(true);
    setError(null);
    try {
      const [attendanceRes, scannerRes, historyRes] = await Promise.allSettled([
        attendanceAnalyticsService.getLiveAttendance(selectedEventId),
        attendanceAnalyticsService.getScannerMetrics(selectedEventId),
        attendanceAnalyticsService.getCheckInHistory(selectedEventId, { limit: 15 }),
      ]);

      if (attendanceRes.status === 'fulfilled') {
        const aData = attendanceRes.value.data || attendanceRes.value;
        if (aData) setAttendanceStats(aData);
      }

      if (scannerRes.status === 'fulfilled') {
        const sData = scannerRes.value.data || scannerRes.value;
        if (sData) setScannerMetrics(sData);
      }

      if (historyRes.status === 'fulfilled') {
        const hData = historyRes.value.data || historyRes.value;
        setHistoryLogs(Array.isArray(hData) ? hData : hData.data || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to load attendance analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedEventId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, margin: 0, color: C.text }}>
            Attendance & Check-In Operational Analytics
          </h1>
          <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '13px' }}>
            Real-time occupancy fill rates, gate throughput distribution, and entry velocity insights
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/organizer/check-in-history')}
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
            <ShieldCheck size={16} color={C.gold} /> View Full Audit History
          </button>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              background: C.gold,
              color: '#000000',
              border: 'none',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 800,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh Analytics
          </button>
        </div>
      </div>

      {/* Event Selector Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '6px 14px', width: 'fit-content' }}>
        <Ticket size={16} color={C.gold} />
        <span style={{ fontSize: '12px', color: C.muted, fontWeight: 600 }}>Select Event:</span>
        <select
          value={selectedEventId}
          onChange={(e) => {
            setSelectedEventId(e.target.value);
            navigate(`/organizer/attendance/${e.target.value}`);
          }}
          style={{ padding: '6px 12px', background: 'transparent', border: 'none', color: C.text, fontSize: '13px', fontWeight: 600, outline: 'none' }}
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id} style={{ background: C.bgCard }}>{ev.title}</option>
          ))}
        </select>
      </div>

      {/* Summary Stat Cards */}
      <AttendanceOverviewCards stats={attendanceStats} />

      {/* 2-Column Charts Row: Hourly Velocity & Gate Volume */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <HourlyCheckInsChart />
        <GateDistributionChart />
      </div>

      {/* 2-Column Row: Outcome Breakdown & Recent History Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <ScanResultBreakdown results={scannerMetrics.outcomeBreakdown || { SUCCESS: attendanceStats.checkedInCount || 0 }} />
        <RecentCheckInsTable logs={historyLogs} loading={loading} />
      </div>
    </div>
  );
}
