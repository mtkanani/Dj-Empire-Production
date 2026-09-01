import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Ticket, Search, RefreshCw, AlertTriangle, Trash2 } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { eventService } from '../../services/organizer/eventService.js';
import { ticketService } from '../../services/organizer/ticketService.js';
import { EventStatusBadge } from '../../components/organizer/events/EventStatusBadge.jsx';
import { TicketInventorySummary } from '../../components/organizer/ticketing/TicketInventorySummary.jsx';
import { TicketTable } from '../../components/organizer/ticketing/TicketTable.jsx';
import { formatDate } from '../../utils/formatters.js';
import { useToast } from '../../hooks/useToast.js';

export default function EventTicketingPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Delete modal state
  const [deleteTicketId, setDeleteTicketId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load Event Context & Ticket Data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [evRes, ticketRes, liveRes] = await Promise.allSettled([
        eventService.getEventById(eventId),
        ticketService.getEventTickets(eventId),
        ticketService.getLiveAvailability(eventId),
      ]);

      if (evRes.status === 'fulfilled') {
        setEvent(evRes.value.data || evRes.value);
      } else {
        throw new Error('Event not found or access denied');
      }

      if (ticketRes.status === 'fulfilled') {
        const raw = ticketRes.value.data || ticketRes.value || [];
        setTickets(Array.isArray(raw) ? raw : []);
      }

      if (liveRes.status === 'fulfilled') {
        setLiveMetrics(liveRes.value.data || liveRes.value);
      }
    } catch (err) {
      setError(err.message || 'Failed to load ticketing information');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) loadData();
  }, [eventId, loadData]);

  // Inventory Refresh
  const handleRefreshInventory = async () => {
    setRefreshing(true);
    try {
      const [ticketRes, liveRes] = await Promise.allSettled([
        ticketService.getEventTickets(eventId),
        ticketService.getLiveAvailability(eventId),
      ]);
      if (ticketRes.status === 'fulfilled') {
        const raw = ticketRes.value.data || ticketRes.value || [];
        setTickets(Array.isArray(raw) ? raw : []);
      }
      if (liveRes.status === 'fulfilled') {
        setLiveMetrics(liveRes.value.data || liveRes.value);
      }
      showToast('Ticket inventory refreshed', 'info');
    } catch {
      showToast('Failed to refresh inventory', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // Delete Ticket Type
  const handleDeleteConfirm = async () => {
    if (!deleteTicketId) return;
    setDeleting(true);
    try {
      await ticketService.deleteTicket(deleteTicketId);
      showToast('Ticket type deleted successfully', 'success');
      setDeleteTicketId(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Unable to delete ticket type', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading event ticketing system...</div>;
  }

  if (error || !event) {
    return (
      <div style={{ padding: '40px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '20px', color: C.red }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <AlertTriangle size={22} />
          <h3 style={{ margin: 0 }}>Event Ticketing Error</h3>
        </div>
        <p style={{ margin: '0 0 20px', color: C.text }}>{error || 'Event not found'}</p>
        <button onClick={() => navigate('/organizer/ticketing')} style={{ padding: '8px 16px', background: C.red, color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Back to Events Selection
        </button>
      </div>
    );
  }

  // Aggregate Metrics Calculations
  const calculatedTotal = tickets.reduce((acc, t) => acc + (t.quantityTotal || 0), 0);
  const calculatedAvailable = tickets.reduce((acc, t) => acc + ((t.quantityAvailable ?? t.quantityTotal) || 0), 0);
  const calculatedSold = Math.max(0, calculatedTotal - calculatedAvailable);

  const totalCapacity = liveMetrics?.totalCapacity || calculatedTotal;
  const soldCapacity = liveMetrics?.totalSold !== undefined ? liveMetrics.totalSold : calculatedSold;
  const availableCapacity = liveMetrics?.totalAvailable !== undefined ? liveMetrics.totalAvailable : calculatedAvailable;
  const reservedCapacity = 0; // Lock reservations

  const filteredTickets = tickets.filter((t) =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                Tickets — {event.title}
              </h1>
              <EventStatusBadge status={event.status} />
            </div>
            <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0' }}>
              Venue: {event.venue?.name || event.eventVenue?.venueName || 'Venue TBD'} • Date: {formatDate(event.startDate || event.createdAt)}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/organizer/events/${eventId}/tickets/create`)}
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
          <Plus size={16} /> Create Ticket Type
        </button>
      </div>

      {/* Inventory KPI Summary */}
      <TicketInventorySummary
        total={totalCapacity}
        sold={soldCapacity}
        reserved={reservedCapacity}
        available={availableCapacity}
        onRefresh={handleRefreshInventory}
        loading={refreshing}
      />

      {/* Ticket List Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
          <Search size={16} color={C.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search ticket tiers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <span style={{ fontSize: '13px', color: C.muted }}>
          Showing {filteredTickets.length} of {tickets.length} ticket tiers
        </span>
      </div>

      {/* Ticket Table */}
      <TicketTable
        tickets={filteredTickets}
        eventId={eventId}
        loading={loading}
        onDelete={(id) => setDeleteTicketId(id)}
      />

      {/* Delete Confirmation Modal */}
      {deleteTicketId && (
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
                Delete Ticket Type?
              </h3>
            </div>

            <p style={{ color: C.muted, fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
              Are you sure you want to delete this ticket type? This action will remove the tier configuration from this event.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                onClick={() => setDeleteTicketId(null)}
                disabled={deleting}
                style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.muted, fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                style={{ padding: '8px 18px', background: C.red, color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
              >
                {deleting ? 'Deleting...' : 'Delete Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
