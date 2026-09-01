import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Ticket, RefreshCw, DoorOpen, Edit2, Trash2, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { gateScannerService } from '../../services/organizer/gateScannerService.js';
import { eventService as organizerEventService } from '../../services/organizer/eventService.js';
import { CreateScannerUserModal } from '../../components/organizer/CreateScannerUserModal.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function ScannerUsersPage() {
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [gates, setGates] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [scanners, setScanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScanner, setEditingScanner] = useState(null);

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

  // Fetch Scanner Accounts & Gates for selected Event
  const fetchScannersAndGates = async () => {
    if (!selectedEventId) return;
    setLoading(true);
    setError(null);
    try {
      const [scannersRes, gatesRes] = await Promise.allSettled([
        gateScannerService.getScanners(selectedEventId),
        gateScannerService.getGates(selectedEventId),
      ]);

      if (scannersRes.status === 'fulfilled') {
        const sData = scannersRes.value.data || scannersRes.value;
        setScanners(Array.isArray(sData) ? sData : []);
      }

      if (gatesRes.status === 'fulfilled') {
        const gData = gatesRes.value.data || gatesRes.value;
        setGates(Array.isArray(gData) ? gData : []);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve scanner staff accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScannersAndGates();
  }, [selectedEventId]);

  // Create / Update Scanner Account Handler
  const handleSaveScanner = async (payload) => {
    try {
      if (editingScanner) {
        await gateScannerService.updateScanner(selectedEventId, editingScanner.id, payload);
        showToast('Scanner staff account updated successfully.', 'success');
      } else {
        await gateScannerService.createScanner(selectedEventId, payload);
        showToast('Scanner staff account created successfully.', 'success');
      }
      fetchScannersAndGates();
    } catch (err) {
      showToast(err.message || 'Failed to save scanner staff account.', 'error');
    }
  };

  // Delete Scanner Account Handler
  const handleDeleteScanner = async (scanner) => {
    if (!window.confirm(`Are you sure you want to delete scanner account "${scanner.scannerName}"?`)) return;
    try {
      await gateScannerService.deleteScanner(selectedEventId, scanner.id);
      showToast('Scanner account deleted successfully.', 'success');
      fetchScannersAndGates();
    } catch (err) {
      showToast(err.message || 'Failed to delete scanner account.', 'error');
    }
  };

  const filteredScanners = scanners.filter((s) =>
    !search ||
    s.scannerName.toLowerCase().includes(search.toLowerCase()) ||
    s.scannerEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, margin: 0, color: C.text }}>
            Scanner Staff Accounts & Access Credentials
          </h1>
          <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '13px' }}>
            Manage entrance gate staff accounts, section permissions, and active scanner login credentials
          </p>
        </div>

        <button
          onClick={() => {
            setEditingScanner(null);
            setIsModalOpen(true);
          }}
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
          <Plus size={16} /> Create Staff Account
        </button>
      </div>

      {/* Toolbar: Event Selector & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '6px 14px' }}>
          <Ticket size={16} color={C.gold} />
          <span style={{ fontSize: '12px', color: C.muted, fontWeight: 600 }}>Select Event:</span>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            style={{ padding: '6px 12px', background: 'transparent', border: 'none', color: C.text, fontSize: '13px', fontWeight: 600, outline: 'none' }}
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id} style={{ background: C.bgCard }}>{ev.title}</option>
            ))}
          </select>
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={16} color={C.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by Name or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Staff Accounts Table / Cards */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading scanner staff accounts...</div>
      ) : error ? (
        <div style={{ padding: '20px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '16px', color: C.red, textAlign: 'center' }}>
          {error}
        </div>
      ) : filteredScanners.length === 0 ? (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <UserCheck size={48} color={C.muted} />
          <h3 style={{ margin: 0, fontSize: '18px', color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
            No Scanner Staff Accounts
          </h3>
          <p style={{ margin: 0, color: C.muted, fontSize: '14px', maxWidth: '400px' }}>
            Create credentials for gate staff members to operate entrance scanners and record check-ins.
          </p>
          <button
            onClick={() => {
              setEditingScanner(null);
              setIsModalOpen(true);
            }}
            style={{ padding: '10px 20px', background: C.gold, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Create Staff Credentials
          </button>
        </div>
      ) : (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '14px 16px' }}>Staff Name</th>
                <th style={{ padding: '14px 16px' }}>Login Email</th>
                <th style={{ padding: '14px 16px' }}>Assigned Gate</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredScanners.map((s) => (
                <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: C.text }}>
                    {s.scannerName}
                  </td>
                  <td style={{ padding: '14px 16px', color: C.muted, fontFamily: 'Space Grotesk, monospace' }}>
                    {s.scannerEmail}
                  </td>
                  <td style={{ padding: '14px 16px', color: C.blue }}>
                    {s.assignedGateIds?.length > 0 ? `Gate ID: ${s.assignedGateIds[0].slice(0, 8)}...` : 'All Entrance Gates'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '8px', background: s.isActive ? C.greenDim : C.redDim, color: s.isActive ? C.green : C.red, fontWeight: 700, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {s.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {s.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setEditingScanner(s);
                          setIsModalOpen(true);
                        }}
                        style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, padding: '6px', cursor: 'pointer' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteScanner(s)}
                        style={{ background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '8px', color: C.red, padding: '6px', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <CreateScannerUserModal
        isOpen={isModalOpen}
        scanner={editingScanner}
        gates={gates}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveScanner}
      />
    </div>
  );
}
