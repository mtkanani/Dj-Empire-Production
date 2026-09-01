import { z } from 'zod';

/**
 * Zod Validation Schemas for QR Check-In & Event Access Management
 */

// 1. Validate / Scan QR Code Schema
export const scanEntrySchema = z.object({
  qrToken: z.string().min(1, 'QR Token / Base64 Payload is required'),
  eventId: z.string().optional(),
  admitCount: z.number().int().min(1).optional(),
  gateId: z.string().optional(),
  deviceId: z.string().optional(),
  isOffline: z.boolean().default(false),
});

// 2. Manual Check-In Schema
export const manualCheckinSchema = z
  .object({
    eventId: z.string().min(1, 'Event ID is required'),
    bookingNumber: z.string().optional(),
    customerEmail: z.string().email().optional(),
    customerPhone: z.string().optional(),
    ticketCode: z.string().optional(),
    gateId: z.string().optional(),
    admitCount: z.number().int().min(1).optional(),
    overrideReason: z.string().optional(),
  })
  .refine(
    (data) => data.bookingNumber || data.ticketCode || data.customerEmail || data.customerPhone,
    { message: 'Provide a ticket passcode, booking number, email, or phone' }
  );

// 3. Create Gate Schema
export const createGateSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  name: z.string().min(1, 'Gate Name is required'),
  code: z.string().min(1, 'Gate Code (e.g. GATE_A, VIP_GATE) is required'),
  description: z.string().optional(),
  allowedSections: z.array(z.string()).default([]),
  capacity: z.number().int().positive().default(1000),
});

// 4. Register Scanner Device Schema
export const registerDeviceSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  gateId: z.string().optional(),
  deviceName: z.string().min(1, 'Device Name is required'),
  platform: z.enum(['ANDROID_SCANNER', 'IPHONE_SCANNER', 'TABLET', 'WEB_SCANNER']).default('ANDROID_SCANNER'),
});

// 5. Offline Batch Sync Schema
export const syncOfflineLogsSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  logs: z.array(
    z.object({
      ticketId: z.string().optional(),
      qrToken: z.string().optional(),
      scannedAt: z.string(),
      scanResult: z.string(),
    })
  ),
});
