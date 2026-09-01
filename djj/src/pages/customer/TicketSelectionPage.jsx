import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Ticket, AlertCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { customerEventService } from '../../services/customer/customerEventService.js';
import { customerBookingService } from '../../services/customer/customerBookingService.js';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar.jsx';
import { CustomerFooter } from '../../components/customer/CustomerFooter.jsx';
import { BookingStepper } from '../../components/customer/booking/BookingStepper.jsx';
import { QuantitySelector } from '../../components/customer/booking/QuantitySelector.jsx';
import { useBooking } from '../../context/BookingContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { useToast } from '../../hooks/useToast.js';

import { useEventRealtime } from '../../hooks/useEventRealtime.js';

export default function TicketSelectionPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { event, setEvent, selectedTickets, setSelectedTickets, setReservation } = useBooking();

  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState(null);

  const { liveInventory } = useEventRealtime(eventId);

  // Sync ticketTypes with real-time socket inventory updates
  useEffect(() => {
    if (liveInventory && liveInventory.sections && ticketTypes.length > 0) {
      setTicketTypes((prevTypes) =>
        prevTypes.map((tt) => {
          const matchingSec = liveInventory.sections.find((s) => s.id === tt.sectionId);
          if (matchingSec) {
            return {
              ...tt,
              quantityAvailable: matchingSec.available,
            };
          }
          return tt;
        })
      );
    }
  }, [liveInventory]);

  useEffect(() => {
    const fetchEventTickets = async () => {
      setLoading(true);
      setError(null);
      // Reset selected tickets and reservation so NO ticket is pre-selected by default
      setSelectedTickets({});
      setReservation(null);
      try {
        const res = await customerEventService.getEventDetails(eventId);
        const data = res.data || res;
        setEvent(data);
        const rawT = data.ticketTypes || [];
        setTicketTypes(Array.isArray(rawT) ? rawT : []);
      } catch (err) {
        setError(err.message || 'Unable to load tickets for this event.');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchEventTickets();
  }, [eventId, setSelectedTickets, setReservation, setEvent]);

  const handleQuantityChange = (ticket, qty) => {
    setSelectedTickets((prev) => {
      const updated = { ...prev };
      if (qty <= 0) {
        delete updated[ticket.id];
      } else {
        updated[ticket.id] = { ticketType: ticket, quantity: qty };
      }
      return updated;
    });
  };

  // Calculate total selected quantity & subtotal
  const totalSelectedQty = Object.values(selectedTickets).reduce((acc, it) => acc + it.quantity, 0);
  const estimatedSubtotal = Object.values(selectedTickets).reduce((acc, it) => acc + (it.ticketType.price * it.quantity), 0);

  // Reserve Tickets API Call
  const handleProceedToReservation = async () => {
    if (totalSelectedQty <= 0) {
      showToast('Please select at least 1 ticket to proceed.', 'error');
      return;
    }

    setReserving(true);
    setError(null);
    try {
      const payload = {
        eventId,
        items: Object.values(selectedTickets).map((it) => ({
          ticketTypeId: it.ticketType.id,
          sectionId: it.ticketType.sectionId || undefined,
          quantity: it.quantity,
        })),
        quantity: totalSelectedQty,
        ticketTypeId: Object.keys(selectedTickets)[0],
        sectionId: Object.values(selectedTickets)[0]?.ticketType?.sectionId || undefined,
      };

      const res = await customerBookingService.createReservation(payload);
      const resData = res.data || res;

      setReservation(resData);
      showToast('15-minute ticket lock reserved successfully!', 'success');
      navigate(`/events/${eventId}/booking/customer`);
    } catch (err) {
      setError(err.message || 'Reservation failed. Tickets may be sold out.');
      showToast(err.message || 'Reservation failed', 'error');
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
        <CustomerNavbar />
        <div style={{ flexGrow: 1, padding: '80px 24px', textAlign: 'center', color: C.muted }}>Loading available ticket tiers...</div>
        <CustomerFooter />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
      <CustomerNavbar />

      <main style={{ flexGrow: 1, maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Stepper Header */}
        <BookingStepper currentStep={1} />

        {/* Back Link */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              color: C.text,
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} /> Back to Event Details
          </button>
          <span style={{ fontSize: '13px', color: C.muted }}>
            Event: <strong style={{ color: C.gold }}>{event?.title}</strong>
          </span>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div style={{ padding: '14px 18px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '14px', color: C.red, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Ticket Tiers List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', fontWeight: 800, margin: 0, color: C.text }}>
            Select Ticket Tiers & Quantities
          </h2>

          {ticketTypes.length === 0 ? (
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '40px', textAlign: 'center', color: C.muted }}>
              No active ticket tiers available for this event.
            </div>
          ) : (
            ticketTypes.map((ticket) => {
              const currentQty = selectedTickets[ticket.id]?.quantity || 0;
              const isAvailable = ticket.quantityAvailable > 0 && ticket.isActive;

              return (
                <div
                  key={ticket.id}
                  style={{
                    background: C.bgCard,
                    border: `1px solid ${currentQty > 0 ? C.borderGold : C.border}`,
                    borderRadius: '20px',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    boxShadow: currentQty > 0 ? '0 4px 20px rgba(234, 179, 8, 0.1)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '480px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
                        {ticket.name}
                      </span>
                      {ticket.section?.name && (
                        <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', border: `1px solid ${C.blue}`, color: C.blue, fontSize: '11px', fontWeight: 700 }}>
                          {ticket.section.name}
                        </span>
                      )}
                      {!isAvailable && (
                        <span style={{ padding: '2px 8px', borderRadius: '6px', background: C.redDim, color: C.red, fontSize: '11px', fontWeight: 700 }}>
                          Sold Out
                        </span>
                      )}
                    </div>
                    {ticket.description && (
                      <span style={{ fontSize: '13px', color: C.muted }}>{ticket.description}</span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '12px', color: isAvailable ? C.green : C.red, fontWeight: 700 }}>
                        {isAvailable ? `${ticket.quantityAvailable} tickets available` : '0 tickets available'}
                      </span>
                      {ticket.quantityTotal && (
                        <span style={{ fontSize: '11px', color: C.muted }}>
                          (of {ticket.quantityTotal} total)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Counter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: C.gold, fontFamily: 'Space Grotesk, sans-serif' }}>
                      {ticket.price === 0 ? 'Free' : formatCurrency(ticket.price)}
                    </span>

                    <QuantitySelector
                      value={currentQty}
                      min={0}
                      max={Math.min(ticket.quantityAvailable || 10, ticket.maximumTickets || 10)}
                      onChange={(qty) => handleQuantityChange(ticket, qty)}
                      disabled={!isAvailable}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Total Bar & Proceed CTA */}
        {totalSelectedQty > 0 && (
          <div
            style={{
              position: 'sticky',
              bottom: '20px',
              background: 'rgba(13, 17, 28, 0.95)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${C.borderGold}`,
              borderRadius: '20px',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: C.muted, display: 'block' }}>Selected ({totalSelectedQty} tickets)</span>
              <strong style={{ fontSize: '22px', color: C.gold, fontFamily: 'Space Grotesk, sans-serif' }}>
                {formatCurrency(estimatedSubtotal)}
              </strong>
            </div>

            <button
              onClick={handleProceedToReservation}
              disabled={reserving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: C.gold,
                color: '#000000',
                border: 'none',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: 800,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: reserving ? 'not-allowed' : 'pointer',
              }}
            >
              {reserving ? 'Reserving Lock...' : 'Lock Tickets & Proceed'} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </main>

      <CustomerFooter />
    </div>
  );
}
