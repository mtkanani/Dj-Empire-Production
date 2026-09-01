import React from 'react';
import { Ticket, Calendar, MapPin, ShieldCheck, Tag } from 'lucide-react';
import { C } from '../../../constants/theme.js';
import { formatCurrency } from '../../../utils/formatters.js';
import { formatEventDateTimeLine } from '../../../utils/eventSchedule.js';

export const OrderSummaryCard = ({ event = null, items = [], booking = null }) => {
  const subtotal = booking?.subtotal ?? items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const tax = booking?.gstAmount ?? booking?.taxAmount ?? 0;
  const platformFee = booking?.platformFee ?? 0;
  const bookingFee = booking?.bookingFee ?? 0;
  const total = booking?.totalAmount ?? (subtotal + tax + platformFee + bookingFee);
  const currency = booking?.currency || 'INR';

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', color: C.gold }}>
        Order Summary
      </h3>

      {/* Event Info Brief */}
      {event && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '16px', borderBottom: `1px solid ${C.border}` }}>
          <strong style={{ fontSize: '15px', color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
            {event.title}
          </strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.muted, fontSize: '12px' }}>
            <Calendar size={13} color={C.gold} /> {formatEventDateTimeLine(event)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.muted, fontSize: '12px' }}>
            <MapPin size={13} color={C.blue} /> {event.venue?.name || 'Venue TBA'}
          </div>
        </div>
      )}

      {/* Itemized Line Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <div>
              <span style={{ color: C.text, fontWeight: 600 }}>{item.name || item.ticketTypeName}</span>
              <span style={{ color: C.muted, display: 'block', fontSize: '11px' }}>Qty: {item.quantity}</span>
            </div>
            <strong style={{ color: C.text }}>{formatCurrency(item.price * item.quantity, currency)}</strong>
          </div>
        ))}
      </div>

      {/* Financial Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: `1px solid ${C.border}`, paddingTop: '16px', fontSize: '13px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: C.muted }}>
          <span>Ticket Subtotal</span>
          <span style={{ color: C.text }}>{formatCurrency(subtotal, currency)}</span>
        </div>

        {tax > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: C.muted }}>
            <span>GST / Tax (18%)</span>
            <span style={{ color: C.text }}>{formatCurrency(tax, currency)}</span>
          </div>
        )}

        {(platformFee > 0 || bookingFee > 0) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: C.muted }}>
            <span>Convenience / Service Fee</span>
            <span style={{ color: C.text }}>{formatCurrency(platformFee + bookingFee, currency)}</span>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            borderTop: `1px solid ${C.borderGold}`,
            paddingTop: '12px',
            marginTop: '4px',
            fontSize: '16px',
            fontWeight: 800,
            color: C.gold,
            fontFamily: 'Space Grotesk, sans-serif',
          }}
        >
          <span>Total Amount</span>
          <span>{formatCurrency(total, currency)}</span>
        </div>
      </div>
    </div>
  );
};
