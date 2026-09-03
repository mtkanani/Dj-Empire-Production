import QRCode from 'qrcode';
import { env } from '../../../config/env.js';
import { mapTicketPublicStatus } from './ticketCode.util.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function pickEventImage(event) {
  const images = event?.images || [];
  return (
    images.find((i) => i.type === 'BANNER')?.imageUrl ||
    images.find((i) => i.type === 'POSTER')?.imageUrl ||
    images.find((i) => i.type === 'THUMBNAIL')?.imageUrl ||
    images[0]?.imageUrl ||
    event?.bannerUrl ||
    event?.seo?.ogImage ||
    null
  );
}

function formatDateIn(date) {
  if (!date) return 'TBA';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'TBA';
  return parsed.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTimeIn(time) {
  if (!time) return '';
  const raw = String(time).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw;
  const d = new Date();
  d.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function pickPrimarySchedule(event) {
  const schedules = Array.isArray(event?.schedules) ? [...event.schedules] : [];
  if (schedules.length === 0) return {};
  schedules.sort((a, b) => {
    const da = new Date(a.startDate || 0).getTime();
    const db = new Date(b.startDate || 0).getTime();
    if (da !== db) return da - db;
    return String(a.startTime || '').localeCompare(String(b.startTime || ''));
  });
  return schedules[0] || {};
}

export function buildTicketBundle(booking) {
  const event = booking.event || {};
  const schedule = pickPrimarySchedule(event);
  const venueName = event.venue?.name || event.eventVenue?.venueName || 'Venue TBA';
  const venueAddress =
    event.venue?.address ||
    [event.eventVenue?.address, event.eventVenue?.city, event.city?.name].filter(Boolean).join(', ') ||
    event.city?.name ||
    '';
  const organizer =
    event.organizer?.organizerProfile?.companyName ||
    `${event.organizer?.firstName || ''} ${event.organizer?.lastName || ''}`.trim() ||
    'Event Organizer';
  const tickets = (booking.tickets || []).map((ticket, index) => {
    const seat = ticket.seats?.[0] || null;
    return {
      ticketId: ticket.id,
      ticketCode: ticket.ticketCode,
      qrToken: ticket.qrToken || null,
      status: ticket.status,
      publicStatus: mapTicketPublicStatus(ticket.status),
      ticketType: ticket.ticketType?.name || booking.items?.[0]?.ticketType?.name || 'Standard',
      unitPrice: ticket.ticketType?.price ?? booking.items?.[0]?.unitPrice ?? 0,
      seat: seat ? `Row ${seat.row}, Seat ${seat.seatNumber}` : null,
      index: index + 1,
    };
  });

  const startTime = formatTimeIn(schedule.startTime);
  const endTime = formatTimeIn(schedule.endTime);
  const dateLabel = formatDateIn(schedule.startDate);
  const endDateLabel = schedule.endDate && String(schedule.endDate) !== String(schedule.startDate)
    ? formatDateIn(schedule.endDate)
    : '';
  const timeLabel = [startTime, endTime].filter(Boolean).join(' – ') || 'TBA';

  return {
    bookingId: booking.id,
    bookingNumber: booking.bookingNumber,
    bookingDate: booking.createdAt,
    bookingStatus: booking.bookingStatus,
    paymentStatus: booking.paymentStatus,
    quantity: booking.quantity || tickets.length || 1,
    currency: booking.currency || 'INR',
    subtotal: booking.subtotal,
    totalAmount: booking.totalAmount,
    ticketEmailSentAt: booking.ticketEmailSentAt || null,
    ticketEmailError: booking.ticketEmailError || null,
    user: {
      name: `${booking.customer?.firstName || ''} ${booking.customer?.lastName || ''}`.trim(),
      email: booking.customer?.email || '',
      phone: booking.customer?.phone || '',
    },
    event: {
      id: event.id,
      name: event.title,
      description: event.shortDescription || event.description || '',
      date: schedule.startDate || null,
      dateLabel: endDateLabel ? `${dateLabel} – ${endDateLabel}` : dateLabel,
      startTime: schedule.startTime || '',
      endTime: schedule.endTime || '',
      timeLabel,
      gateOpenTime: schedule.gateOpenTime ? formatTimeIn(schedule.gateOpenTime) : '',
      venue: venueName,
      address: venueAddress,
      city: event.city?.name || event.eventVenue?.city || '',
      organizer,
      imageUrl: pickEventImage(event),
      entryPolicy: event.policy?.entryPolicy || null,
      terms: event.policy?.cancellationPolicy || event.policy?.refundPolicy || null,
    },
    tickets,
  };
}

export async function buildTicketEmailHtml(bundle, qrDataUriMap) {
  const ticketBlocks = bundle.tickets
    .map((ticket) => {
      const dataUri = qrDataUriMap[ticket.ticketId];
      return `
        <td style="width: 50%; padding: 10px; vertical-align: top;">
          <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; text-align: center; background: #fff;">
            <div style="font-size: 12px; color: #6b7280; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase;">Pass ${ticket.index} of ${bundle.tickets.length}</div>
            ${dataUri
              ? `<img src="${dataUri}" alt="QR for ${escapeHtml(ticket.ticketCode)}" width="160" height="160" style="margin: 10px 0; border-radius: 8px;" />`
              : `<div style="margin: 10px 0; padding: 24px; background: #f9fafb; border-radius: 8px; font-size: 12px; color: #6b7280;">QR is on page ${ticket.index} of the attached PDF</div>`}
            <div style="font-family: monospace; font-weight: 800; color: #111827; font-size: 13px;">${escapeHtml(ticket.ticketCode)}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${escapeHtml(ticket.ticketType)}${ticket.seat ? ` · ${escapeHtml(ticket.seat)}` : ''} · ${escapeHtml(ticket.publicStatus)}</div>
          </div>
        </td>`;
    })
    .reduce((rows, cell, index) => {
      if (index % 2 === 0) rows.push([cell]);
      else rows[rows.length - 1].push(cell);
      return rows;
    }, [])
    .map((pair) => `<tr>${pair.join('')}${pair.length === 1 ? '<td></td>' : ''}</tr>`)
    .join('');

  const eventDate = bundle.event.dateLabel || (bundle.event.date ? new Date(bundle.event.date).toDateString() : 'TBA');
  const timeLabel = bundle.event.timeLabel || [bundle.event.startTime, bundle.event.endTime].filter(Boolean).join(' - ') || 'TBA';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #0b0d14; color: #111827;">
      <div style="background: #111827; color: #fbbf24; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">${escapeHtml(env.APP_NAME)}</h1>
        <p style="margin: 8px 0 0; color: #e5e7eb;">Booking confirmed</p>
      </div>
      ${bundle.event.imageUrl ? `<img src="${escapeHtml(bundle.event.imageUrl)}" alt="${escapeHtml(bundle.event.name)}" style="width:100%; max-height: 220px; object-fit: cover;" />` : ''}
      <div style="background: #ffffff; padding: 24px;">
        <h2 style="margin: 0 0 8px;">${escapeHtml(bundle.event.name)}</h2>
        <p style="color: #4b5563; font-size: 14px;">Hi ${escapeHtml(bundle.user.name)}, your ${bundle.tickets.length} unique entry pass${bundle.tickets.length > 1 ? 'es' : ''} ${bundle.tickets.length > 1 ? 'are' : 'is'} ready. Each QR admits one person.</p>
        <table style="width: 100%; font-size: 14px; margin: 16px 0; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #6b7280;">Booking ID</td><td style="padding: 6px 0; font-weight: 700;">${escapeHtml(bundle.bookingNumber)}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Date</td><td style="padding: 6px 0;">${escapeHtml(eventDate)}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Time</td><td style="padding: 6px 0;">${escapeHtml(timeLabel)}${bundle.event.gateOpenTime ? ` (Gates ${escapeHtml(bundle.event.gateOpenTime)})` : ''}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Venue</td><td style="padding: 6px 0;">${escapeHtml(bundle.event.venue)}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Address</td><td style="padding: 6px 0;">${escapeHtml(bundle.event.address)}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Guest</td><td style="padding: 6px 0;">${escapeHtml(bundle.user.name)} · ${escapeHtml(bundle.user.email)} · ${escapeHtml(bundle.user.phone)}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Quantity</td><td style="padding: 6px 0;">${bundle.tickets.length}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Total</td><td style="padding: 6px 0; font-weight: 700;">${escapeHtml(bundle.currency)} ${Number(bundle.totalAmount || 0).toFixed(2)}</td></tr>
        </table>
        <h3 style="margin: 20px 0 8px;">Your QR entry passes (${bundle.tickets.length} unique code${bundle.tickets.length > 1 ? 's' : ''})</h3>
        ${bundle.tickets.length > Object.keys(qrCidMap).length
          ? `<p style="font-size: 12px; color: #6b7280;">The first ${Object.keys(qrCidMap).length} QR codes are shown below. Remaining passes are in the attached PDF (one page per ticket).</p>`
          : ''}
        <table style="width: 100%; border-collapse: collapse;">${ticketBlocks}</table>
        <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">Show the matching QR at the gate. Each pass can be used once. Organizer: ${escapeHtml(bundle.event.organizer)}.</p>
        ${bundle.event.entryPolicy ? `<p style="font-size: 12px; color: #6b7280;">Entry: ${escapeHtml(bundle.event.entryPolicy)}</p>` : ''}
      </div>
    </div>
  `;
}

export async function generateQrPngBuffer(payload) {
  return QRCode.toBuffer(payload, {
    type: 'png',
    width: 320,
    margin: 1,
    errorCorrectionLevel: 'M',
  });
}

export function ticketQrPayload(ticket, bookingId) {
  return ticket.qrToken || JSON.stringify({ ticketId: ticket.ticketId, bookingId });
}
