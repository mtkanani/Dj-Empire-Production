import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Ticket, Users, DoorOpen, AlertCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { checkInService } from '../../services/checkin/checkInService.js';
import { eventService as organizerEventService } from '../../services/organizer/eventService.js';
import { QRScanner } from '../../components/checkin/QRScanner.jsx';
import { ScanResultCard } from '../../components/checkin/ScanResultCard.jsx';
import { useToast } from '../../hooks/useToast.js';
import { getSocket, joinEventRoom, leaveEventRoom } from '../../services/socket/socketClient.js';

const EMPTY_ATTENDANCE = {
  totalTickets: 0,
  checkedIn: 0,
  remaining: 0,
  attendanceRate: 0,
};

const parseEventList = (res) => {
  const eventData = res?.data || res;
  return Array.isArray(eventData) ? eventData : eventData?.events || [];
};

const applyAttendance = (payload) => {
  const aData = payload?.data || payload;
  if (!aData) return EMPTY_ATTENDANCE;
  return {
    totalTickets: aData.totalSeats ?? aData.totalTickets ?? 0,
    checkedIn: aData.checkedIn ?? aData.checkedInCount ?? 0,
    remaining: aData.remaining ?? 0,
    attendanceRate: aData.attendanceRate ?? aData.occupancyPercentage ?? 0,
  };
};

export default function CheckInPage() {
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [gates, setGates] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedGateId, setSelectedGateId] = useState('');
  const [eventsError, setEventsError] = useState(null);

  const [attendance, setAttendance] = useState(EMPTY_ATTENDANCE);

  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);
  const [recentScans, setRecentScans] = useState([]);

  const refreshAttendance = useCallback(async (eventId) => {
    if (!eventId) return;
    try {
      const res = await checkInService.getAttendance(eventId);
      setAttendance(applyAttendance(res));
    } catch {
      // keep last known stats
    }
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setEventsError(null);
      try {
        const res = await organizerEventService.getMyEvents({ limit: 100 });
        const list = parseEventList(res);
        setEvents(list);
        if (list.length > 0) setSelectedEventId(list[0].id);
        else setEventsError('No events found for this organizer.');
      } catch (err) {
        setEvents([]);
        setEventsError(err.message || 'Unable to load events from the database.');
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setGates([]);
      setSelectedGateId('');
      setAttendance(EMPTY_ATTENDANCE);
      return;
    }

    setGates([]);
    setSelectedGateId('');
    setAttendance(EMPTY_ATTENDANCE);
    setScanResult(null);
    setIsScanning(true);
    setRecentScans([]);

    const fetchEventMeta = async () => {
      try {
        const [gatesRes, attendanceRes] = await Promise.allSettled([
          checkInService.getGates(selectedEventId),
          checkInService.getAttendance(selectedEventId),
        ]);

        if (gatesRes.status === 'fulfilled') {
          const gData = gatesRes.value.data || gatesRes.value;
          const gList = Array.isArray(gData) ? gData : [];
          setGates(gList);
          setSelectedGateId(gList[0]?.id || '');
        } else {
          setGates([]);
          setSelectedGateId('');
        }

        if (attendanceRes.status === 'fulfilled') {
          setAttendance(applyAttendance(attendanceRes.value));
        }
      } catch {
        setGates([]);
        setSelectedGateId('');
      }
    };

    fetchEventMeta();
  }, [selectedEventId]);

  useEffect(() => {
    if (!selectedEventId) return undefined;
    const socket = getSocket();
    joinEventRoom(selectedEventId);
    const handleCheckIn = () => {
      refreshAttendance(selectedEventId);
    };
    socket.on('checkin:updated', handleCheckIn);
    return () => {
      socket.off('checkin:updated', handleCheckIn);
      leaveEventRoom(selectedEventId);
    };
  }, [selectedEventId, refreshAttendance]);

  const handleExecuteScan = async (qrToken) => {
    if (!isScanning) return;
    if (!selectedEventId) {
      showToast('Select an event before scanning.', 'error');
      return;
    }
    setIsScanning(false);

    try {
      const res = await checkInService.scanEntry({
        qrToken,
        gateId: selectedGateId || undefined,
        eventId: selectedEventId,
      });

      const data = res.data || res;
      setScanResult({ valid: true, ...data });
      showToast('ENTRY ALLOWED — Check-in verified.', 'success');
      refreshAttendance(selectedEventId);

      setRecentScans((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          customerName: data.customerName || 'Ticket Holder',
          bookingNumber: data.ticketCode || data.bookingNumber || 'BK-REF',
          result: 'ALLOWED',
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      const errMsg = err.message || 'Invalid or tampered QR code payload.';
      setScanResult({ valid: false, reason: errMsg });
      showToast(`ENTRY DENIED — ${errMsg}`, 'error');

      setRecentScans((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          customerName: 'Unknown',
          bookingNumber: 'N/A',
          result: 'DENIED',
        },
        ...prev.slice(0, 9),
      ]);
    }
  };

  const handleManualCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    if (!selectedEventId) {
      showToast('Select an event before checking in.', 'error');
      return;
    }

    setSubmittingManual(true);
    const raw = manualInput.trim().replace(/^#/, '');
    const isPasscode = /^TCK[-_]?/i.test(raw);

    try {
      const res = await checkInService.manualCheckIn({
        eventId: selectedEventId,
        ...(isPasscode ? { ticketCode: raw } : { bookingNumber: raw }),
        gateId: selectedGateId || undefined,
      });

      const data = res.data || res;
      setScanResult({ valid: true, ...data });
      setManualInput('');
      setIsScanning(false);
      showToast('Check-in verified successfully!', 'success');
      refreshAttendance(selectedEventId);

      setRecentScans((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          customerName: data.customerName || 'Ticket Holder',
          bookingNumber: data.ticketCode || data.bookingNumber || raw,
          result: 'ALLOWED',
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      const errMsg = err.message || 'Manual check-in failed. Ticket not found.';
      setScanResult({ valid: false, reason: errMsg });
      showToast(errMsg, 'error');
    } finally {
      setSubmittingManual(false);
    }
  };

  const handleScanNext = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  const selectedEvent = events.find((ev) => ev.id === selectedEventId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, margin: 0, color: C.text }}>
          QR Scanner & Entrance Check-In Control
        </h1>
        <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '13px' }}>
          Scan cryptographic QR entry passes and validate gate entrance access control
        </p>
      </div>

      {eventsError && (
        <div style={{ padding: '12px 16px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '12px', color: C.red, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} /> {eventsError}
        </div>
      )}

      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Ticket size={16} color={C.gold} />
          <span style={{ fontSize: '12px', color: C.muted, fontWeight: 600 }}>Active Event:</span>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none' }}
          >
            {events.length === 0 ? (
              <option value="">No events found</option>
            ) : (
              events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))
            )}
          </select>
        </div>

        {gates.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DoorOpen size={16} color={C.blue} />
            <span style={{ fontSize: '12px', color: C.muted, fontWeight: 600 }}>Entrance Gate:</span>
            <select
              value={selectedGateId}
              onChange={(e) => setSelectedGateId(e.target.value)}
              style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none' }}
            >
              {gates.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        )}

        {selectedEvent && (
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: C.muted }}>
            Showing capacity for <strong style={{ color: C.text }}>{selectedEvent.title}</strong>
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.goldDim, color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ticket size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase' }}>Total Capacity</span>
            <strong style={{ display: 'block', fontSize: '18px', color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>{attendance.totalTickets || 0}</strong>
          </div>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.greenDim, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase' }}>Checked In</span>
            <strong style={{ display: 'block', fontSize: '18px', color: C.green, fontFamily: 'Space Grotesk, sans-serif' }}>{attendance.checkedIn || 0}</strong>
          </div>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.blueDim, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase' }}>Remaining</span>
            <strong style={{ display: 'block', fontSize: '18px', color: C.blue, fontFamily: 'Space Grotesk, sans-serif' }}>{attendance.remaining || 0}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div>
          {scanResult ? (
            <ScanResultCard result={scanResult} onScanNext={handleScanNext} />
          ) : (
            <QRScanner onScan={handleExecuteScan} isScanning={isScanning} />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <form onSubmit={handleManualCheckInSubmit} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', color: C.text }}>
              Manual Ticket Passcode / Booking Ref
            </h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                required
                placeholder="e.g. TCK-AB12CD34 or BMS-20260828-XXXXXX"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                style={{ flexGrow: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none' }}
              />
              <button
                type="submit"
                disabled={submittingManual || !selectedEventId}
                style={{ padding: '10px 16px', background: C.gold, color: '#000', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: submittingManual || !selectedEventId ? 'not-allowed' : 'pointer' }}
              >
                {submittingManual ? 'Verifying...' : 'Check-In'}
              </button>
            </div>
          </form>

          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', color: C.text }}>
              Recent Gate Scans Feed
            </h4>

            {recentScans.length === 0 ? (
              <span style={{ fontSize: '12px', color: C.muted, textAlign: 'center', padding: '12px' }}>No scans performed yet in this session.</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentScans.map((scan) => (
                  <div key={scan.id} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                    <div>
                      <strong style={{ color: C.text, display: 'block' }}>{scan.customerName}</strong>
                      <span style={{ color: C.muted, fontSize: '11px' }}>#{scan.bookingNumber} • {scan.time}</span>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', background: scan.result === 'ALLOWED' ? C.greenDim : C.redDim, color: scan.result === 'ALLOWED' ? C.green : C.red, fontWeight: 700, fontSize: '11px' }}>
                      {scan.result}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
