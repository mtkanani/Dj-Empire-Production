import { z } from 'zod';

export const createScannerSchema = z.object({
  scannerName: z.string().min(2, 'Scanner name must be at least 2 characters'),
  scannerEmail: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  assignedSectionIds: z.array(z.string()).optional().default([]),
  assignedGateIds: z.array(z.string()).optional().default([]),
});

export const scannerLoginSchema = z.object({
  eventId: z.string().optional(),
  scannerEmail: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateScannerSchema = z.object({
  scannerName: z.string().min(2).optional(),
  password: z.string().min(6).optional(),
  assignedSectionIds: z.array(z.string()).optional(),
  assignedGateIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});
