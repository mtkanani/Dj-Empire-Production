import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { C } from '../../../constants/theme.js';
import { formatCurrency } from '../../../utils/formatters.js';
import { formatEventDateTimeLine } from '../../../utils/eventSchedule.js';
import { customerEventService } from '../../../services/customer/customerEventService.js';
import { normalizeTicketLines, quoteOrderPreview } from '../../../utils/orderPricing.js';
import { useBooking } from '../../../context/BookingContext.jsx';

const Row = ({ label, value, muted = true, currency }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', color: muted ? C.muted : C.text }}>
    <span>{label}</span>
    <span style={{ color: C.text }}>{formatCurrency(value, currency)}</span>
  </div>
);

export const OrderSummaryCard = ({ event = null, items = [], booking = null }) => {
  const { event: ctxEvent, booking: ctxBooking, selectedTickets } = useBooking();
  const eventData = event || ctxEvent;
  const bookingData = booking || ctxBooking;
  const [taxSettings, setTaxSettings] = useState(null);

  useEffect(() => {
    let active = true;
    customerEventService
      .getTaxSettings()
      .then((res) => {
        if (!active) return;
        setTaxSettings(res.data || res);
      })
      .catch(() => {
        if (active) setTaxSettings(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const quote = useMemo(() => {
    const lines = normalizeTicketLines(items, bookingData, selectedTickets);
    return quoteOrderPreview(lines, taxSettings || {}, bookingData);
  }, [items, bookingData, selectedTickets, taxSettings]);

  const currency = bookingData?.currency || eventData?.currency || 'INR';
  const gstLabel = quote.gstRate > 0 ? `GST (${quote.gstRate}%)` : 'GST';

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

      {eventData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '16px', borderBottom: `1px solid ${C.border}` }}>
          <strong style={{ fontSize: '15px', color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
            {eventData.title}
          </strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.muted, fontSize: '12px' }}>
            <Calendar size={13} color={C.gold} /> {formatEventDateTimeLine(eventData)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.muted, fontSize: '12px' }}>
            <MapPin size={13} color={C.blue} /> {eventData.venue?.name || 'Venue TBA'}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {quote.lines.length === 0 ? (
          <span style={{ color: C.muted, fontSize: '13px' }}>No tickets selected.</span>
        ) : (
          quote.lines.map((line, idx) => (
            <div key={`${line.name}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: C.text, fontWeight: 600 }}>{line.name}</span>
                {line.sectionName ? (
                  <span style={{ color: C.muted, display: 'block', fontSize: '11px' }}>{line.sectionName}</span>
                ) : null}
                <span style={{ color: C.muted, display: 'block', fontSize: '11px' }}>
                  {line.quantity} × {formatCurrency(line.unitPrice, currency)}
                </span>
              </div>
              <strong style={{ color: C.text }}>
                {formatCurrency(line.unitPrice * line.quantity, currency)}
              </strong>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: `1px solid ${C.border}`, paddingTop: '16px', fontSize: '13px' }}>
        <Row label={`Ticket Subtotal (${quote.totalQty || 0})`} value={quote.subtotal} currency={currency} />
        {quote.couponDiscount > 0 && (
          <Row label="Discount" value={-quote.couponDiscount} currency={currency} />
        )}
        {quote.platformFee > 0 && <Row label="Platform fee" value={quote.platformFee} currency={currency} />}
        {quote.bookingFee > 0 && <Row label="Booking fee" value={quote.bookingFee} currency={currency} />}
        {quote.serviceCharge > 0 && <Row label="Service charge" value={quote.serviceCharge} currency={currency} />}
        {quote.gstAmount > 0 && quote.gstRate > 0 ? (
          <>
            <Row label={`CGST (${(quote.gstRate / 2).toFixed(2)}%)`} value={quote.cgstAmount} currency={currency} />
            <Row label={`SGST (${(quote.gstRate / 2).toFixed(2)}%)`} value={quote.sgstAmount} currency={currency} />
          </>
        ) : quote.gstAmount > 0 ? (
          <Row label={gstLabel} value={quote.gstAmount} currency={currency} />
        ) : null}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
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
          <span>{formatCurrency(quote.total, currency)}</span>
        </div>
      </div>
    </div>
  );
};
