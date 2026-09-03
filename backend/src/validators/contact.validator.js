import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  message: z.string().trim().min(1, 'Message is required').max(5000),
});
