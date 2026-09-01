import { z } from 'zod';

export const verifyTicketSchema = z
  .object({
    ticketId: z.string().min(1).optional(),
    ticketCode: z.string().min(1).optional(),
    qrToken: z.string().optional(),
    eventId: z.string().optional(),
  })
  .refine((data) => data.ticketId || data.ticketCode || data.qrToken, {
    message: 'Provide ticketId, ticketCode, or qrToken',
  });
