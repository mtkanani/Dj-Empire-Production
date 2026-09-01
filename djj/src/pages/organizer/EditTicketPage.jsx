import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { ticketService } from '../../services/organizer/ticketService.js';
import { seatMapService } from '../../services/organizer/seatMapService.js';
import { TicketForm } from '../../components/organizer/ticketing/TicketForm.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function EditTicketPage() {
  const { eventId, ticketId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [ticket, setTicket] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const [listRes, secRes] = await Promise.allSettled([
          ticketService.getEventTickets(eventId),
          seatMapService.getSections(eventId),
        ]);
        const list = listRes.status === 'fulfilled' ? listRes.value.data || listRes.value || [] : [];
        const found = list.find((t) => t.id === ticketId);
        if (!found) {
          throw new Error('Ticket type not found');
        }
        setTicket(found);
        if (secRes.status === 'fulfilled') {
          const raw = secRes.value.data || secRes.value || [];
          setSections(Array.isArray(raw) ? raw : []);
        }
      } catch (err) {
        setError(err.message || 'Ticket type not found');
      } finally {
        setLoading(false);
      }
    };
    if (eventId && ticketId) fetchTicket();
  }, [eventId, ticketId]);

  const handleSubmit = async (payload) => {
    setSaving(true);
    setError(null);
    try {
      await ticketService.updateTicket(ticketId, payload);
      showToast('Ticket type updated successfully!', 'success');
      navigate(`/organizer/events/${eventId}/tickets`);
    } catch (err) {
      setError(err.message || 'Failed to update ticket type');
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading ticket details...</div>;
  }

  if (error || !ticket) {
    return (
      <div style={{ padding: '40px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '20px', color: C.red }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <AlertCircle size={22} />
          <h3 style={{ margin: 0 }}>Ticket Type Not Found</h3>
        </div>
        <p style={{ margin: '0 0 20px', color: C.text }}>{error || 'Invalid ticket type identifier'}</p>
        <button onClick={() => navigate(`/organizer/events/${eventId}/tickets`)} style={{ padding: '8px 16px', background: C.red, color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => navigate(`/organizer/events/${eventId}/tickets`)}
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
          title="Back to Tickets"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: C.text, margin: 0 }}>
            Edit Ticket — {ticket.name}
          </h1>
          <p style={{ color: C.muted, fontSize: '14px', margin: '4px 0 0' }}>
            Modify ticket pricing, description, quantity capacity, or active availability.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '28px' }}>
        <TicketForm
          initialValues={ticket}
          sections={sections}
          mode="edit"
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/organizer/events/${eventId}/tickets`)}
          saving={saving}
          error={error}
        />
      </div>
    </div>
  );
}
