import PDFDocument from 'pdfkit';
import { generateQrPngBuffer, ticketQrPayload } from './ticketBundle.util.js';

function money(amount, currency = 'INR') {
  return `${currency} ${Number(amount || 0).toFixed(2)}`;
}

const COLORS = {
  bg: '#0B0D14',
  card: '#121624',
  gold: '#FBBF24',
  goldDim: '#8B6914',
  text: '#F8FAFC',
  muted: '#94A3B8',
  white: '#FFFFFF',
  line: '#1F2937',
};

export async function generateTicketsPdf(bundle) {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  const finished = new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const pageW = doc.page.width;
  const pageH = doc.page.height;

  for (let i = 0; i < bundle.tickets.length; i += 1) {
    if (i > 0) doc.addPage();
    const ticket = bundle.tickets[i];
    const qrBuffer = await generateQrPngBuffer(ticketQrPayload(ticket, bundle.bookingId));
    const eventDate = bundle.event.dateLabel || (bundle.event.date ? new Date(bundle.event.date).toDateString() : 'TBA');
    const timeLabel = bundle.event.timeLabel || [bundle.event.startTime, bundle.event.endTime].filter(Boolean).join(' - ') || 'TBA';

    doc.rect(0, 0, pageW, pageH).fill(COLORS.bg);
    doc.rect(0, 0, pageW, 8).fill(COLORS.gold);
    doc.rect(0, pageH - 8, pageW, 8).fill(COLORS.gold);

    doc.fillColor(COLORS.gold).fontSize(10).font('Helvetica-Bold');
    doc.text('DJ EMPIRE  ·  OFFICIAL ENTRY PASS', 40, 28, { width: pageW - 80, align: 'center' });

    doc.fillColor(COLORS.text).fontSize(22).font('Helvetica-Bold');
    doc.text(bundle.event.name || 'Event Ticket', 40, 50, { width: pageW - 80, align: 'center' });

    doc.fillColor(COLORS.gold).fontSize(11).font('Helvetica-Bold');
    doc.text(`PASS ${ticket.index} OF ${bundle.tickets.length}`, 40, 88, { width: pageW - 80, align: 'center' });

    const cardX = 36;
    const cardY = 118;
    const cardW = pageW - 72;
    const cardH = pageH - 180;
    doc.roundedRect(cardX, cardY, cardW, cardH, 16).fill(COLORS.card);
    doc.lineWidth(1.5).strokeColor(COLORS.gold).roundedRect(cardX, cardY, cardW, cardH, 16).stroke();

    const leftX = cardX + 28;
    let y = cardY + 28;

    doc.fillColor(COLORS.gold).fontSize(9).font('Helvetica-Bold').text('GUEST', leftX, y);
    doc.fillColor(COLORS.text).fontSize(13).font('Helvetica-Bold').text(bundle.user.name || 'Ticket Holder', leftX, y + 14);
    doc.fillColor(COLORS.muted).fontSize(10).font('Helvetica').text(bundle.user.email || '', leftX, y + 32);
    if (bundle.user.phone) doc.text(bundle.user.phone, leftX, y + 46);

    y = cardY + 92;
    doc.moveTo(leftX, y).lineTo(cardX + cardW - 28, y).strokeColor(COLORS.line).lineWidth(1).stroke();
    y += 18;

    const details = [
      ['DATE', eventDate],
      ['TIME', `${timeLabel}${bundle.event.gateOpenTime ? `  ·  Gates ${bundle.event.gateOpenTime}` : ''}`],
      ['VENUE', bundle.event.venue || 'Venue TBA'],
      ['ADDRESS', bundle.event.address || '—'],
      ['ORGANIZER', bundle.event.organizer || '—'],
      ['BOOKING ID', bundle.bookingNumber || '—'],
      ['TICKET ID', ticket.ticketCode || '—'],
      ['TYPE', ticket.ticketType || 'Standard'],
    ];
    if (ticket.seat) details.push(['SEAT', ticket.seat]);
    details.push(['PRICE', money(ticket.unitPrice, bundle.currency)]);
    details.push(['TOTAL PAID', money(bundle.totalAmount, bundle.currency)]);
    details.push(['STATUS', ticket.publicStatus || 'CONFIRMED']);

    doc.font('Helvetica');
    details.forEach(([label, value]) => {
      doc.fillColor(COLORS.gold).fontSize(8).font('Helvetica-Bold').text(label, leftX, y);
      doc.fillColor(COLORS.text).fontSize(11).font('Helvetica').text(String(value || '—'), leftX + 110, y, { width: 200 });
      y += 22;
    });

    const qrSize = 168;
    const qrX = cardX + cardW - qrSize - 36;
    const qrY = cardY + 36;
    doc.roundedRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 52, 12).fill(COLORS.white);
    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });
    doc.fillColor('#111827').fontSize(9).font('Helvetica-Bold').text(ticket.ticketCode || '', qrX - 12, qrY + qrSize + 8, {
      width: qrSize + 24,
      align: 'center',
    });

    doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica').text(
      'Show this unique QR at the gate. Each QR admits one person and cannot be reused.',
      40,
      pageH - 48,
      { width: pageW - 80, align: 'center' }
    );
  }

  doc.end();
  return finished;
}
