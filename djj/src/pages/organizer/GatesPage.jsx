import React, { useState, useEffect } from 'react';
import { DoorOpen, Plus, Search, Ticket, RefreshCw, Users, CheckCircle2 } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { gateScannerService } from '../../services/organizer/gateScannerService.js';
import { eventService as organizerEventService } from '../../services/organizer/eventService.js';
import { GateCard } from '../../components/organizer/GateCard.jsx';
import { CreateGateModal } from '../../components/organizer/CreateGateModal.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function GatesPage() {
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [sections, setSections] = useState([]);
  const [gates, setGates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGate, setEditingGate] = useState(null);

  // 1. Fetch Organizer Events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await organizerEventService.getOrganizerEvents();
        const data = res.data || res;
        const list = Array.isArray(data) ? data : data.events || [];
        setEvents(list);
        if (list.length > 0) {
          setSelectedEventId(list[0].id);
        } else {
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

  // 2. Fetch Gates & Event Details (Sections) for selected Event
  const fetchGatesAndSections = async () => {
    if (!selectedEventId) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch Gates
      const res = await gateScannerService.getGates(selectedEventId);
      const data = res.data || res;
      setGates(Array.isArray(data) ? data : []);

      // Fetch Event Sections
      try {
        const evRes = await organizerEventService.getEventById(selectedEventId);
        const evData = evRes.data || evRes;
        setSections(evData.sections || []);
      } catch {
        setSections([]);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve gates for selected event.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGatesAndSections();
  }, [selectedEventId]);

  // 3. Create / Update Gate & Scanner Staff Credentials Handler
  const handleSaveGate = async (payload) => {
    try {
      const gateData = {
        eventId: payload.eventId,
        name: payload.name,
        code: payload.code,
        description: payload.description,
        capacity: payload.capacity,
        allowedSections: payload.allowedSections || [],
      };

      let savedGate;
      if (editingGate) {
        const res = await gateScannerService.updateGate(editingGate.id, gateData);
        savedGate = res.data || res;
      } else {
        const res = await gateScannerService.createGate(gateData);
        savedGate = res.data || res;
      }

      const targetGateId = savedGate?.id || editingGate?.id;

      // Create any newly specified Scanner Accounts
      if (payload.scannerAccounts && payload.scannerAccounts.length > 0 && targetGateId) {
        for (const scanner of payload.scannerAccounts) {
          try {
            await gateScannerService.createScanner(selectedEventId, {
              scannerName: scanner.scannerName || `${payload.name} Staff`,
              scannerEmail: scanner.scannerEmail,
              password: scanner.password,
              assignedGateIds: [targetGateId],
              assignedSectionIds: payload.allowedSections || [],
            });
          } catch (scErr) {
            console.warn('Scanner account creation warning:', scErr.message);
          }
        }
      }

      showToast('Entrance gate and scanner accounts saved successfully.', 'success');
      fetchGatesAndSections();
    } catch (err) {
      showToast(err.message || 'Failed to save entrance gate.', 'error');
    }
  };

  // Delete Gate Handler
  const handleDeleteGate = async (gate) => {
    if (!window.confirm(`Are you sure you want to delete gate "${gate.name}"?`)) return;
    try {
      await gateScannerService.deleteGate(gate.id);
      showToast('Gate deleted successfully.', 'success');
      fetchGatesAndSections();
    } catch (err) {
      showToast(err.message || 'Failed to delete gate.', 'error');
    }
  };

  const filteredGates = gates.filter(
    (g) =>
      !search ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, margin: 0, color: C.text }}>
            Entrance Gate Infrastructure
          </h1>
          <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '13px' }}>
            Configure turnstile entrance gates, section access codes, and dedicated scanner staff logins
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGate(null);
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
            boxShadow: '0 4px 16px rgba(234, 179, 8, 0.3)',
          }}
        >
          <Plus size={16} /> Add Entrance Gate
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
            style={{ padding: '6px 12px', background: 'transparent', border: 'none', color: C.text, fontSize: '13px', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
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

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={16} color={C.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by Gate Name or Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Gates Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading entrance gates...</div>
      ) : error ? (
        <div style={{ padding: '20px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '16px', color: C.red, textAlign: 'center' }}>
          {error}
        </div>
      ) : filteredGates.length === 0 ? (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <DoorOpen size={48} color={C.muted} />
          <h3 style={{ margin: 0, fontSize: '18px', color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
            No Entrance Gates Configured
          </h3>
          <p style={{ margin: 0, color: C.muted, fontSize: '14px', maxWidth: '400px' }}>
            Create entrance gates to manage section access and scanner staff credential logins for this event.
          </p>
          <button
            onClick={() => {
              setEditingGate(null);
              setIsModalOpen(true);
            }}
            disabled={!selectedEventId}
            style={{ padding: '10px 20px', background: C.gold, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Create First Gate
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredGates.map((gate) => (
            <GateCard
              key={gate.id}
              gate={gate}
              onEdit={(g) => {
                setEditingGate(g);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteGate}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Gate & Scanner Credentials Modal */}
      <CreateGateModal
        isOpen={isModalOpen}
        gate={editingGate}
        eventId={selectedEventId}
        sections={sections}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveGate}
      />
    </div>
  );
}
