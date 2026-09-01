import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Layers, Eye, RefreshCw, AlertTriangle, Trash2 } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { eventService } from '../../services/organizer/eventService.js';
import { seatMapService } from '../../services/organizer/seatMapService.js';
import { EventStatusBadge } from '../../components/organizer/events/EventStatusBadge.jsx';
import { SectionTable } from '../../components/organizer/seating/SectionTable.jsx';
import { SectionFormModal } from '../../components/organizer/seating/SectionFormModal.jsx';
import { formatDate } from '../../utils/formatters.js';
import { useToast } from '../../hooks/useToast.js';

export default function EventSeatingPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Section Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [savingSection, setSavingSection] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Delete Section Modal
  const [deleteSectionId, setDeleteSectionId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [evRes, secRes] = await Promise.allSettled([
        eventService.getEventById(eventId),
        seatMapService.getSections(eventId),
      ]);

      if (evRes.status === 'fulfilled') {
        setEvent(evRes.value.data || evRes.value);
      } else {
        throw new Error('Event not found or access denied');
      }

      if (secRes.status === 'fulfilled') {
        const raw = secRes.value.data || secRes.value || [];
        setSections(Array.isArray(raw) ? raw : []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load event seating information.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) loadData();
  }, [eventId, loadData]);

  // Section Creation / Update Handler
  const handleSaveSection = async (payload) => {
    setSavingSection(true);
    setModalError(null);
    try {
      if (editingSection) {
        await seatMapService.updateSection(eventId, editingSection.id, payload);
        showToast('Section updated successfully!', 'success');
      } else {
        await seatMapService.createSection(eventId, payload);
        showToast('New section created successfully!', 'success');
      }
      setIsModalOpen(false);
      setEditingSection(null);
      loadData();
    } catch (err) {
      setModalError(err.message || 'Failed to save section');
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setSavingSection(false);
    }
  };

  // Delete Section Handler
  const handleDeleteSectionConfirm = async () => {
    if (!deleteSectionId) return;
    setDeleting(true);
    try {
      await seatMapService.deleteSection(eventId, deleteSectionId);
      showToast('Section deleted successfully', 'success');
      setDeleteSectionId(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Unable to delete section', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading event sections...</div>;
  }

  if (error || !event) {
    return (
      <div style={{ padding: '40px', background: C.bgCard, border: `1px solid ${C.borderGold}`, borderRadius: '24px', color: C.text, maxWidth: '600px', margin: '40px auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(234,179,8,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold }}>
          <AlertTriangle size={24} />
        </div>
        <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', color: C.text }}>
          Seating Access Error or Session Expired
        </h3>
        <p style={{ margin: 0, color: C.muted, fontSize: '14px', lineHeight: '1.6' }}>
          {error?.includes('Unauthorized') || error?.includes('401')
            ? 'Your organizer login session has expired. Please log in again to access event seating.'
            : 'The requested event ID does not exist in your organizer account. Please select an event from your events list.'}
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={() => navigate('/organizer/login')}
            style={{ padding: '10px 18px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
          >
            Log In as Organizer
          </button>
          <button
            onClick={() => navigate('/organizer/events')}
            style={{ padding: '10px 20px', background: C.gold, color: '#000', border: 'none', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: 800 }}
          >
            Go to My Events Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalCapacity = sections.reduce((acc, s) => acc + (s.capacity || 0), 0);
  const totalSold = sections.reduce((acc, s) => acc + (s.soldCapacity || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header Context & Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate(`/organizer/events/${eventId}`)}
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              color: C.muted,
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Back to Event Details"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: C.text, margin: 0 }}>
                Seating & Sections — {event.title}
              </h1>
              <EventStatusBadge status={event.status} />
            </div>
            <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0' }}>
              Total Allocated Capacity: {totalCapacity} Seats Across {sections.length} Sections
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate(`/organizer/events/${eventId}/seat-map`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              background: C.goldDim,
              border: `1px solid ${C.borderGold}`,
              borderRadius: '12px',
              color: C.gold,
              fontWeight: 700,
              fontSize: '13px',
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
            }}
          >
            <Eye size={16} /> Interactive Seat Map
          </button>

          <button
            onClick={() => {
              setEditingSection(null);
              setIsModalOpen(true);
            }}
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
            <Plus size={16} /> Create Section
          </button>
        </div>
      </div>

      {/* Section Table */}
      <SectionTable
        sections={sections}
        eventId={eventId}
        loading={loading}
        onEdit={(sec) => {
          setEditingSection(sec);
          setIsModalOpen(true);
        }}
        onDelete={(secId) => setDeleteSectionId(secId)}
      />

      {/* Section Form Modal */}
      <SectionFormModal
        isOpen={isModalOpen}
        initialValues={editingSection}
        onSubmit={handleSaveSection}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSection(null);
        }}
        saving={savingSection}
        error={modalError}
      />

      {/* Delete Confirmation Modal */}
      {deleteSectionId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '440px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: C.red }}>
              <Trash2 size={24} />
              <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', color: C.text }}>
                Delete Event Section?
              </h3>
            </div>

            <p style={{ color: C.muted, fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
              Are you sure you want to delete this section? This will remove capacity allocation and ticket assignments.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                onClick={() => setDeleteSectionId(null)}
                disabled={deleting}
                style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.muted, fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSectionConfirm}
                disabled={deleting}
                style={{ padding: '8px 18px', background: C.red, color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
              >
                {deleting ? 'Deleting...' : 'Delete Section'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
