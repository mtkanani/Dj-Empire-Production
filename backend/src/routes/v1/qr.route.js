import { Router } from 'express';
import QRCode from 'qrcode';
import { prisma } from '../../config/prisma.js';
import { logger } from '../../config/logger.js';

const router = Router();

/**
 * GET /api/v1/qr/:ticketCode
 *
 * Public, unauthenticated endpoint that returns a QR code PNG for a ticket.
 *
 * This is used as the <img src> in ticket confirmation emails.
 * Using a real https:// URL is the ONLY reliable way to display images in all
 * email clients (Gmail strips base64 data URIs; Resend ignores CID references).
 *
 * Security: Ticket codes are already printed visibly in the email body.
 * The JWT qrToken embedded in the QR is cryptographically signed and cannot be forged.
 */
router.get('/:ticketCode', async (req, res) => {
  const { ticketCode } = req.params;

  try {
    // Look up the ticket by code to get its signed qrToken
    const ticket = await prisma.ticket.findFirst({
      where: { ticketCode: ticketCode.toUpperCase() },
      select: { qrToken: true, ticketCode: true },
    });

    if (!ticket) {
      // Return a "not found" QR placeholder image instead of a JSON error
      // so the email doesn't show a broken image icon
      const notFoundQr = await QRCode.toBuffer('TICKET_NOT_FOUND', {
        type: 'png',
        width: 200,
        margin: 2,
        color: { dark: '#ef4444', light: '#ffffff' },
      });
      return res
        .status(404)
        .set('Content-Type', 'image/png')
        .set('Cache-Control', 'no-store')
        .send(notFoundQr);
    }

    // Use the signed qrToken if available, otherwise fall back to ticketCode
    const payload = ticket.qrToken || ticket.ticketCode;

    const qrPng = await QRCode.toBuffer(payload, {
      type: 'png',
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' },
    });

    res
      .status(200)
      .set('Content-Type', 'image/png')
      .set('Cache-Control', 'public, max-age=3600, immutable') // cache 1 hour in CDN/clients
      .set('X-Content-Type-Options', 'nosniff')
      .send(qrPng);
  } catch (error) {
    logger.error(`QR endpoint error for ${ticketCode}: ${error.message}`);
    // Return a minimal blank PNG so email shows a placeholder, not a broken icon
    try {
      const errQr = await QRCode.toBuffer('ERROR', {
        type: 'png',
        width: 200,
        margin: 2,
      });
      return res.status(500).set('Content-Type', 'image/png').send(errQr);
    } catch {
      return res.status(500).json({ error: 'QR generation failed' });
    }
  }
});

export default router;
