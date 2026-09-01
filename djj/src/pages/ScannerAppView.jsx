import React, { useState, useEffect } from 'react';
import { QrCode, ShieldAlert, CheckCircle, UserCheck, Lock, LogOut } from 'lucide-react';
import { C } from '../constants';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { checkinService } from '../services/checkin.service.js';
import { customerEventService } from '../services/customer/customerEventService.js';
import { QRScanner } from '../components/checkin/QRScanner.jsx';
import { useToast } from '../hooks/useToast.js';

export default function ScannerAppView() {
  const { showToast } = useToast();
  const [scannerToken, setScannerToken] = useState(() => localStorage.getItem('djj_scanner_token'));
  const [scannerInfo, setScannerInfo] = useState(() => {
    const saved = localStorage.getItem('djj_scanner_info');
    return saved ? JSON.parse(saved) : null;
  });

  const [events, setEvents] = useState([]);
  const [eventsError, setEventsError] = useState(null);
  const [eventId, setEventId] = useState('');
  const [scannerEmail, setScannerEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [isScanning, setIsScanning] = useState(true);
  const [manualInput, setManualInput] = useState('');
  const [admitCount, setAdmitCount] = useState(1);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setEventsError(null);
      try {
        const res = await customerEventService.browseEvents({ limit: 100 });
        const data = res.data || res;
        const list = Array.isArray(data) ? data : data.events || data.data || [];
        setEvents(list);
        setEventId('');
      } catch (err) {
        setEventsError(err.message || 'Unable to load events from the database.');
      }
    };
    fetchEvents();
  }, []);

  const handleScannerLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await checkinService.scannerLogin({
        eventId: eventId || undefined,
        scannerEmail,
        password,
      });
      const payload = res.data || res;
      if (payload?.token) {
        setScannerToken(payload.token);
        setScannerInfo(payload.scanner);
        localStorage.setItem('djj_scanner_token', payload.token);
        localStorage.setItem('djj_scanner_info', JSON.stringify(payload.scanner));
        showToast(`Authenticated as ${payload.scanner?.scannerName || 'scanner'}`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Invalid scanner staff credentials', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setScannerToken(null);
    setScannerInfo(null);
    setScanResult(null);
    localStorage.removeItem('djj_scanner_token');
    localStorage.removeItem('djj_scanner_info');
    showToast('Scanner staff logged out', 'info');
  };

  const runScan = async (qrToken) => {
    if (!qrToken?.trim() || scanLoading) return;
    setScanLoading(true);
    setIsScanning(false);
    setScanResult(null);

    try {
      const res = await checkinService.scanQrCode({
        qrToken: qrToken.trim(),
        admitCount: Number(admitCount) || 1,
        eventId: scannerInfo?.eventId,
        gateId: scannerInfo?.assignedGateIds?.[0] || undefined,
      });

      const data = res.data || res;
      setScanResult({
        status: 'SUCCESS',
        message: res.message || 'Check-in completed successfully',
        data,
      });
      showToast('Check-in granted!', 'success');
    } catch (err) {
      setScanResult({
        status: 'DENIED',
        message: err.message || 'Scan denied',
        errors: err.errors || [],
      });
      showToast(err.message || 'Entrance denied', 'error');
    } finally {
      setScanLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const raw = manualInput.trim().replace(/^#/, '');
    const isPasscode = /^TCK[-_]?/i.test(raw);

    setScanLoading(true);
    setScanResult(null);
    try {
      const res = await checkinService.manualCheckIn({
        eventId: scannerInfo?.eventId,
        ...(isPasscode ? { ticketCode: raw } : { bookingNumber: raw }),
        admitCount: Number(admitCount) || 1,
        gateId: scannerInfo?.assignedGateIds?.[0] || undefined,
      });
      const data = res.data || res;
      setScanResult({
        status: 'SUCCESS',
        message: res.message || 'Check-in completed successfully',
        data,
      });
      setManualInput('');
      setIsScanning(false);
      showToast('Check-in granted!', 'success');
    } catch (err) {
      setScanResult({
        status: 'DENIED',
        message: err.message || 'Scan denied',
      });
      showToast(err.message || 'Entrance denied', 'error');
    } finally {
      setScanLoading(false);
    }
  };

  if (!scannerToken) {
    return (
      <div className="section" style={{ maxWidth: '500px', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ background: C.bgCard, border: `1px solid ${C.borderGold}`, borderRadius: '24px', padding: '36px', boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${C.goldDim}` }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: C.goldDim, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: `1px solid ${C.gold}` }}>
              <Lock size={28} color={C.gold} />
            </div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.gold, fontSize: '24px', margin: '0 0 8px' }}>
              Scanner Staff Portal
            </h2>
            <p style={{ color: C.muted, fontSize: '14px', margin: 0 }}>
              Enter scanner credentials issued by the Event Organizer
            </p>
          </div>

          <form onSubmit={handleScannerLogin}>
            <label htmlFor="scanner-event" style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>Event</label>
            <select
              id="scanner-event"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', marginBottom: '14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none' }}
            >
              <option value="">Auto-detect from scanner email</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
            {eventsError && (
              <p style={{ color: C.red, fontSize: '12px', margin: '0 0 12px' }}>{eventsError}</p>
            )}
            <Input label="Scanner Staff Email" type="email" value={scannerEmail} onChange={(e) => setScannerEmail(e.target.value)} required />
            <Input label="Scanner Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <Button type="submit" variant="primary" fullWidth loading={loginLoading} style={{ marginTop: '12px' }}>
              Authenticate Scanner Device
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ background: C.panel, border: `1px solid ${C.borderGold}`, borderRadius: '20px', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: C.blueDim, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.blue}` }}>
            <QrCode size={24} color={C.blue} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', color: C.text, fontSize: '18px' }}>
              {scannerInfo?.scannerName || 'Active Entrance Station'}
            </h3>
            <span style={{ fontSize: '13px', color: C.muted }}>
              {scannerInfo?.scannerEmail} • {scannerInfo?.eventTitle || scannerInfo?.eventId || 'Assigned Event'}
            </span>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut size={14} /> Exit Scanner
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {scanResult ? (
            <Button variant="ghost" onClick={() => { setScanResult(null); setIsScanning(true); }}>
              Scan Next Ticket
            </Button>
          ) : (
            <QRScanner onScan={runScan} isScanning={isScanning && !scanLoading} />
          )}

          <form onSubmit={handleManualSubmit} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px' }}>
            <Input
              label="Passcode / Booking Ref"
              placeholder="TCK-AB12CD34 or BMS-..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
            />
            <Input
              label="Admit Quantity (Party Size)"
              type="number"
              min="1"
              value={admitCount}
              onChange={(e) => setAdmitCount(e.target.value)}
              helperText="Used for booking-level scans. Passcode always checks in one ticket."
            />
            <Button type="submit" variant="primary" fullWidth loading={scanLoading}>
              Check-In Ticket
            </Button>
          </form>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${scanResult?.status === 'DENIED' ? C.red : C.borderGold}`, borderRadius: '20px', padding: '28px', minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {!scanResult ? (
            <div style={{ textAlign: 'center', color: C.faint }}>
              <QrCode size={48} color={C.faint} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '14px' }}>Ready to scan. Point scanner at attendee QR code.</p>
            </div>
          ) : scanResult.status === 'SUCCESS' ? (
            <div>
              <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: `1px solid ${C.green}`, borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <CheckCircle size={32} color={C.green} />
                <div>
                  <h4 style={{ margin: 0, color: C.green, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px' }}>
                    ENTRY GRANTED
                  </h4>
                  <span style={{ fontSize: '12px', color: C.muted }}>Booking Verified & Attendance Logged</span>
                </div>
              </div>

              <div style={{ background: C.panel, borderRadius: '16px', padding: '20px', border: `1px solid ${C.border}`, marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: C.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Assigned Section</span>
                  <span
                    style={{
                      background: scanResult.data.section?.color || C.purple,
                      color: '#FFFFFF',
                      padding: '4px 14px',
                      borderRadius: '999px',
                      fontWeight: 700,
                      fontSize: '13px',
                      fontFamily: 'Space Grotesk, sans-serif',
                    }}
                  >
                    {scanResult.data.section?.name || 'General'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                  <div>
                    <span style={{ color: C.muted, fontSize: '12px', display: 'block' }}>Customer Name</span>
                    <strong style={{ color: C.text }}>{scanResult.data.customerName}</strong>
                  </div>
                  <div>
                    <span style={{ color: C.muted, fontSize: '12px', display: 'block' }}>Pass Code</span>
                    <strong style={{ color: C.gold }}>{scanResult.data.ticketCode || scanResult.data.section?.ticketType || '—'}</strong>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(0, 229, 255, 0.08)', border: `1px solid ${C.blue}`, borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '13px', color: C.blue, fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={16} /> Group Admittance Progress
                </div>
                <div style={{ fontSize: '20px', fontFamily: 'Space Grotesk, sans-serif', color: C.text, fontWeight: 700 }}>
                  {scanResult.data.groupCheckinSummary?.totalCheckedInNow || 1} / {scanResult.data.groupCheckinSummary?.totalTicketsPurchased || 1} Admitted
                </div>
                <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>
                  Remaining Unused: {scanResult.data.groupCheckinSummary?.remainingUnusedTickets || 0}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ background: 'rgba(255, 42, 82, 0.15)', border: `1px solid ${C.red}`, borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <ShieldAlert size={32} color={C.red} />
                <div>
                  <h4 style={{ margin: 0, color: C.red, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px' }}>
                    ENTRY DENIED
                  </h4>
                  <span style={{ fontSize: '12px', color: C.muted }}>Access Control Restriction Triggered</span>
                </div>
              </div>

              <div style={{ background: C.panel, borderRadius: '16px', padding: '20px', border: `1px solid ${C.redDim}` }}>
                <p style={{ color: C.red, fontSize: '15px', fontWeight: 600, margin: '0 0 8px' }}>
                  {scanResult.message}
                </p>
                <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>
                  This ticket is not valid for the selected event, gate, or has already been checked in.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
