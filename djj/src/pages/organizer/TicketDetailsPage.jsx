import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Ticket, DollarSign, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { ticketService } from '../../services/organizer/ticketService.js';
import { getTicketStatusBadgeProps, formatTicketPrice } from '../../utils/ticketUtils.js';
import { formatDate } from '../../utils/formatters.js';

export default function TicketDetailsPage() {
  const { eventId, ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await ticketService.getEventTickets(eventId);
        const list = res.data || res || [];
        const found = list.find((t) => t.id === ticketId);
        if (!found) throw new Error('Ticket tier not found');
        setTicket(found);
      } catch (err) {
        setError(err.message || 'Ticket tier details could not be loaded');
      } finally {
        setLoading(false);
      }
    };
    if (eventId && ticketId) fetchTicket();
  }, [eventId, ticketId]);

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading ticket details...</div>;
  }

  if (error || !ticket) {
    return (
      <div style={{ padding: '40px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '20px', color: C.red }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <AlertTriangle size={22} />
          <h3 style={{ margin: 0 }}>Ticket Details Error</h3>
        </div>
        <p style={{ margin: '0 0 20px', color: C.text }}>{error || 'Ticket tier not found'}</p>
        <button onClick={() => navigate(`/organizer/events/${eventId}/tickets`)} style={{ padding: '8px 16px', background: C.red, color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Back to Event Tickets
        </button>
      </div>
    );
  }

  const statusProps = getTicketStatusBadgeProps(ticket);
  const sold = ticket.quantityTotal - (ticket.quantityAvailable ?? ticket.quantityTotal);
  const available = ticket.quantityAvailable ?? ticket.quantityTotal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header Context */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: C.text, margin: 0 }}>
                {ticket.name}
              </h1>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: statusProps.bg,
                  color: statusProps.color,
                  border: `1px solid ${statusProps.border}`,
                }}
              >
                {statusProps.label}
              </span>
            </div>
            <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0' }}>
              ID: {ticket.id} • Created: {formatDate(ticket.createdAt)}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/organizer/events/${eventId}/tickets/${ticketId}/edit`)}
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
          <Edit size={16} /> Edit Ticket Tier
        </button>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: C.muted, textTransform: 'uppercase' }}>Price</span>
          <h3 style={{ margin: '6px 0 0', color: C.green, fontSize: '22px', fontFamily: 'Space Grotesk, sans-serif' }}>
            {formatTicketPrice(ticket.price, ticket.currency || 'INR')}
          </h3>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: C.muted, textTransform: 'uppercase' }}>Total Stock</span>
          <h3 style={{ margin: '6px 0 0', color: C.text, fontSize: '22px', fontFamily: 'Space Grotesk, sans-serif' }}>
            {ticket.quantityTotal}
          </h3>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: C.muted, textTransform: 'uppercase' }}>Sold</span>
          <h3 style={{ margin: '6px 0 0', color: C.green, fontSize: '22px', fontFamily: 'Space Grotesk, sans-serif' }}>
            {sold}
          </h3>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: C.muted, textTransform: 'uppercase' }}>Available</span>
          <h3 style={{ margin: '6px 0 0', color: available > 0 ? C.blue : C.red, fontSize: '22px', fontFamily: 'Space Grotesk, sans-serif' }}>
            {available}
          </h3>
        </div>
      </div>

      {/* Ticket Details & Breakdown */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ margin: 0, color: C.gold, fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>
          Ticket Configuration
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '13px' }}>
          <div>
            <strong style={{ display: 'block', color: C.muted, marginBottom: '4px' }}>Ticket Tier Name</strong>
            <span style={{ color: C.text, fontWeight: 600 }}>{ticket.name}</span>
          </div>

          <div>
            <strong style={{ display: 'block', color: C.muted, marginBottom: '4px' }}>Currency</strong>
            <span style={{ color: C.text, fontWeight: 600 }}>{ticket.currency || 'INR'}</span>
          </div>

          <div>
            <strong style={{ display: 'block', color: C.muted, marginBottom: '4px' }}>Min / Max Per Order</strong>
            <span style={{ color: C.text, fontWeight: 600 }}>{ticket.minimumTickets || 1} min — {ticket.maximumTickets || 10} max</span>
          </div>

          <div>
            <strong style={{ display: 'block', color: C.muted, marginBottom: '4px' }}>Sale Window</strong>
            <span style={{ color: C.text, fontWeight: 600 }}>
              {ticket.saleStartDate ? formatDate(ticket.saleStartDate) : 'Immediate'}
              {ticket.saleEndDate ? ` to ${formatDate(ticket.saleEndDate)}` : ''}
            </span>
          </div>
        </div>

        {ticket.description && (
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '16px', marginTop: '8px' }}>
            <strong style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>Description & Guest Benefits</strong>
            <p style={{ color: C.text, fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
              {ticket.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
