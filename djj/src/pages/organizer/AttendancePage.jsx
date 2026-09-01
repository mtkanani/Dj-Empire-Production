import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, CheckCircle2, Ticket, Clock, RefreshCw, Filter, Search, ShieldCheck } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { gateScannerService } from '../../services/organizer/gateScannerService.js';
import { eventService as organizerEventService } from '../../services/organizer/eventService.js';
import { formatDate } from '../../utils/formatters.js';
import { getSocket, joinEventRoom, leaveEventRoom } from '../../services/socket/socketClient.js';

export default function AttendancePage() {
  const { eventId: routeEventId } = useParams();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(routeEventId || '');
  const [attendance, setAttendance] = useState({
    totalTickets: 0,
    checkedIn: 0,
    remaining: 0,
    attendanceRate: 0,
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Organizer Events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await organizerEventService.getMyEvents({ limit: 100 });
        const data = res.data || res;
        const list = Array.isArray(data) ? data : data.events || [];
        setEvents(list);
        if (list.length > 0 && !selectedEventId) setSelectedEventId(list[0].id);
        else if (list.length === 0) setError('No events found for this organizer.');
      } catch (err) {
        setError(err.message || 'Unable to load events from the database.');
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Fetch Attendance & Scan Audit History
  const fetchMetricsAndHistory = async (showLoading = true) => {
    if (!selectedEventId) return;
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [attendanceRes, historyRes] = await Promise.allSettled([
        gateScannerService.getAttendance(selectedEventId),
        gateScannerService.getCheckInHistory(selectedEventId, { limit: 50 }),
      ]);

      if (attendanceRes.status === 'fulfilled') {
        const aData = attendanceRes.value.data || attendanceRes.value;
        if (aData) {
          setAttendance({
            totalTickets: aData.totalSeats ?? aData.totalTickets ?? 0,
            checkedIn: aData.checkedIn ?? aData.checkedInCount ?? 0,
            remaining: aData.remaining ?? 0,
            attendanceRate: aData.attendanceRate ?? aData.occupancyPercentage ?? 0,
          });
        }
      }

      if (historyRes.status === 'fulfilled') {
        const hData = historyRes.value.data || historyRes.value;
        setHistory(Array.isArray(hData) ? hData : hData.data || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to load attendance metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricsAndHistory();
  }, [selectedEventId]);

  useEffect(() => {
    if (!selectedEventId) return undefined;
    const socket = getSocket();
    joinEventRoom(selectedEventId);
    const handleCheckIn = () => {
      fetchMetricsAndHistory(false);
    };
    socket.on('checkin:updated', handleCheckIn);
    return () => {
      socket.off('checkin:updated', handleCheckIn);
      leaveEventRoom(selectedEventId);
    };
  }, [selectedEventId]);

  const checkedIn = attendance.checkedIn || 0;
  const total = attendance.totalTickets || 0;
  const rate = total > 0 ? Math.min(100, Math.round((checkedIn / total) * 100)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, margin: 0, color: C.text }}>
            Event Occupancy & Scan Audit Logs
          </h1>
          <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '13px' }}>
            Monitor real-time gate entrance throughput, attendance rates, and scan verification audit logs
          </p>
        </div>

        <button
          onClick={fetchMetricsAndHistory}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
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
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh Live Data
        </button>
      </div>

      {/* Toolbar: Event Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '6px 14px', width: 'fit-content' }}>
        <Ticket size={16} color={C.gold} />
        <span style={{ fontSize: '12px', color: C.muted, fontWeight: 600 }}>Select Event:</span>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          style={{ padding: '6px 12px', background: 'transparent', border: 'none', color: C.text, fontSize: '13px', fontWeight: 600, outline: 'none' }}
        >
          {events.length === 0 ? (
            <option value="" style={{ background: C.bgCard }}>No Events Available</option>
          ) : (
            events.map((ev) => (
              <option key={ev.id} value={ev.id} style={{ background: C.bgCard }}>{ev.title}</option>
            ))
          )}
        </select>
      </div>

      {/* Attendance Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase' }}>Total Capacity Sold</span>
          <h2 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', color: C.gold }}>
            {total.toLocaleString()}
          </h2>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase' }}>Total Checked-In</span>
          <h2 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', color: C.green }}>
            {checkedIn.toLocaleString()}
          </h2>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase' }}>Remaining Unused</span>
          <h2 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', color: C.blue }}>
            {(attendance.remaining || 0).toLocaleString()}
          </h2>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.borderGold}`, borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: C.gold, textTransform: 'uppercase', fontWeight: 700 }}>Occupancy Rate</span>
          <h2 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', color: C.text }}>
            {rate}%
          </h2>
        </div>
      </div>

      {/* Progress Bar Occupancy Gauge */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: C.text, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>Venue Capacity Fill Gauge</span>
          <span style={{ color: C.gold, fontWeight: 800 }}>{rate}% Attended</span>
        </div>
        <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ width: `${rate}%`, height: '100%', background: `linear-gradient(to right, ${C.blue}, ${C.gold})`, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Check-In Audit Logs Table */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', color: C.text }}>
          Scan Audit Log History
        </h3>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: C.muted }}>Loading audit history...</div>
        ) : history.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: C.muted, fontSize: '13px' }}>No scan history recorded for this event yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '10px 12px' }}>Timestamp</th>
                <th style={{ padding: '10px 12px' }}>Booking Ref</th>
                <th style={{ padding: '10px 12px' }}>Gate</th>
                <th style={{ padding: '10px 12px' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {history.map((log) => (
                <tr key={log.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '12px', color: C.muted }}>
                    {formatDate(log.scannedAt || log.createdAt)}
                  </td>
                  <td style={{ padding: '12px', color: C.gold, fontFamily: 'Space Grotesk, monospace', fontWeight: 700 }}>
                    #{log.booking?.bookingNumber || log.bookingId || 'BK-REF'}
                  </td>
                  <td style={{ padding: '12px', color: C.text }}>
                    {log.gate?.name || 'Main Entrance'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', background: log.scanResult === 'SUCCESS' ? C.greenDim : C.redDim, color: log.scanResult === 'SUCCESS' ? C.green : C.red, fontWeight: 700, fontSize: '11px' }}>
                      {log.scanResult || 'SUCCESS'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
