import React, { useState, useEffect } from 'react';
import { Smartphone, Plus, Search, Ticket, RefreshCw, DoorOpen, Monitor, Tablet, Trash2 } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { gateScannerService } from '../../services/organizer/gateScannerService.js';
import { eventService as organizerEventService } from '../../services/organizer/eventService.js';
import { ScannerDeviceCard } from '../../components/organizer/ScannerDeviceCard.jsx';
import { CreateScannerUserModal } from '../../components/organizer/CreateScannerUserModal.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function ScannersPage() {
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [gates, setGates] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [devices, setDevices] = useState([]);
  const [scanners, setScanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Register Device Modal Form State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [platform, setPlatform] = useState('ANDROID_SCANNER');
  const [selectedGateId, setSelectedGateId] = useState('');
  const [registering, setRegistering] = useState(false);

  // Fetch Organizer Events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await organizerEventService.getMyEvents({ limit: 100 });
        const data = res.data || res;
        const list = Array.isArray(data) ? data : data.events || [];
        setEvents(list);
        if (list.length > 0) setSelectedEventId(list[0].id);
        else {
          setError('No events found for this organizer.');
          setLoading(false);
        }
      } catch (err) {
        setError(err.message || 'Unable to load events from the database.');
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Fetch Devices & Gates for selected Event
  const fetchDevicesAndGates = async () => {
    if (!selectedEventId) return;
    setLoading(true);
    setError(null);
    setDevices([]);
    setGates([]);
    setScanners([]);
    try {
      const [devicesRes, gatesRes, scannersRes] = await Promise.allSettled([
        gateScannerService.getDevices(selectedEventId),
        gateScannerService.getGates(selectedEventId),
        gateScannerService.getScanners(selectedEventId),
      ]);

      if (devicesRes.status === 'fulfilled') {
        const dData = devicesRes.value.data || devicesRes.value;
        setDevices(Array.isArray(dData) ? dData : []);
      }

      if (gatesRes.status === 'fulfilled') {
        const gData = gatesRes.value.data || gatesRes.value;
        const gList = Array.isArray(gData) ? gData : [];
        setGates(gList);
        if (gList.length > 0) setSelectedGateId(gList[0].id);
      }

      if (scannersRes.status === 'fulfilled') {
        const sData = scannersRes.value.data || scannersRes.value;
        setScanners(Array.isArray(sData) ? sData : []);
      }
    } catch (err) {
      setError(err.message || 'Unable to load scanner devices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevicesAndGates();
  }, [selectedEventId]);

  // Register Scanner Device Submit Handler
  const handleRegisterDeviceSubmit = async (e) => {
    e.preventDefault();
    setRegistering(true);
    try {
      await gateScannerService.registerDevice({
        eventId: selectedEventId,
        gateId: selectedGateId || undefined,
        deviceName: deviceName.trim(),
        platform,
      });

      showToast('Scanner device registered successfully.', 'success');
      setShowRegisterModal(false);
      setDeviceName('');
      fetchDevicesAndGates();
    } catch (err) {
      showToast(err.message || 'Failed to register scanner device.', 'error');
    } finally {
      setRegistering(false);
    }
  };

  const handleSaveScanner = async (payload) => {
    try {
      await gateScannerService.createScanner(selectedEventId, payload);
      showToast('Scanner staff account created successfully.', 'success');
      fetchDevicesAndGates();
    } catch (err) {
      showToast(err.message || 'Failed to create scanner staff.', 'error');
      throw err;
    }
  };
  const handleDeleteDevice = async (device) => {
    if (!window.confirm(`Are you sure you want to de-register device "${device.deviceName}"?`)) return;
    try {
      await gateScannerService.deleteDevice(device.id);
      showToast('Device de-registered successfully.', 'success');
      fetchDevicesAndGates();
    } catch (err) {
      showToast(err.message || 'Failed to de-register device.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, margin: 0, color: C.text }}>
            Scanner Device Infrastructure
          </h1>
          <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '13px' }}>
            Register and manage dedicated handheld optical scanner hardware and mobile devices
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowScannerModal(true)}
            disabled={!selectedEventId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: C.bgCard,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '13px',
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: !selectedEventId ? 'not-allowed' : 'pointer',
            }}
          >
            <Plus size={16} /> Add Scanner Staff
          </button>
          <button
            onClick={() => setShowRegisterModal(true)}
            disabled={!selectedEventId}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: C.gold,
            color: '#000000',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '13px',
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: !selectedEventId ? 'not-allowed' : 'pointer',
          }}
        >
          <Plus size={16} /> Register Scanner Device
        </button>
        </div>
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

      {/* Devices Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading registered scanner devices...</div>
      ) : error ? (
        <div style={{ padding: '20px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '16px', color: C.red, textAlign: 'center' }}>
          {error}
        </div>
      ) : devices.length === 0 ? (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Smartphone size={48} color={C.muted} />
          <h3 style={{ margin: 0, fontSize: '18px', color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
            No Scanner Devices Registered
          </h3>
          <p style={{ margin: 0, color: C.muted, fontSize: '14px', maxWidth: '400px' }}>
            Register handheld optical hardware or tablet devices to pair with entrance check-in gates.
          </p>
          <button
            onClick={() => setShowRegisterModal(true)}
            style={{ padding: '10px 20px', background: C.gold, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Register Device
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {devices.map((device) => (
            <ScannerDeviceCard key={device.id} device={device} onDelete={handleDeleteDevice} />
          ))}
        </div>
      )}

      {!loading && scanners.length > 0 && (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
            <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', color: C.text }}>Scanner Staff</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '12px 16px' }}>Name</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {scanners.map((s) => (
                <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '12px 16px', color: C.text, fontWeight: 600 }}>{s.scannerName}</td>
                  <td style={{ padding: '12px 16px', color: C.muted }}>{s.scannerEmail}</td>
                  <td style={{ padding: '12px 16px', color: s.isActive ? C.green : C.red }}>{s.isActive ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateScannerUserModal
        isOpen={showScannerModal}
        gates={gates}
        onClose={() => setShowScannerModal(false)}
        onSubmit={handleSaveScanner}
      />

      {/* Register Device Modal */}
      {showRegisterModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <form onSubmit={handleRegisterDeviceSubmit} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '24px', maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', color: C.text }}>
              Register Scanner Hardware Device
            </h3>

            <div>
              <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>Device Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Handheld Terminal #01"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>Hardware Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              >
                <option value="ANDROID_SCANNER">Android Handheld Scanner</option>
                <option value="IPHONE_SCANNER">iOS Scanner Terminal</option>
                <option value="TABLET">Gate Tablet Scanner</option>
                <option value="WEB_SCANNER">Web Browser Kiosk</option>
              </select>
            </div>

            {gates.length > 0 && (
              <div>
                <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>Assigned Entrance Gate</label>
                <select
                  value={selectedGateId}
                  onChange={(e) => setSelectedGateId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                >
                  <option value="">All Entrance Gates</option>
                  {gates.map((g) => (
                    <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" onClick={() => setShowRegisterModal(false)} style={{ padding: '10px 16px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.muted, fontSize: '13px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={registering} style={{ padding: '10px 20px', background: C.gold, color: '#000', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: registering ? 'not-allowed' : 'pointer' }}>
                {registering ? 'Registering...' : 'Register Device'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
