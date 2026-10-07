import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits').max(20),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().min(8).max(20).optional(),
});

export const createServiceSchema = z.object({
  name: z.string().min(3).max(150),
  description: z.string().min(10),
  category: z.string().min(2),
  department: z.string().min(2),
  estimatedMinutes: z.number().int().positive().max(240).default(15),
  requiredDocuments: z.array(z.string()).min(1),
  isActive: z.boolean().default(true),
});

export const updateServiceSchema = createServiceSchema.partial();

export const createCenterSchema = z.object({
  name: z.string().min(3).max(150),
  code: z.string().min(2).max(10).toUpperCase(),
  address: z.string().min(5),
  district: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4).max(10),
  phone: z.string().min(8).max(20),
  isActive: z.boolean().default(true),
});

export const updateCenterSchema = createCenterSchema.partial();

export const createAppointmentSchema = z.object({
  serviceId: z.string().uuid().or(z.string().min(1)),
  centerId: z.string().uuid().or(z.string().min(1)),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time format must be HH:MM'),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'CHECKED_IN',
    'IN_QUEUE',
    'CALLED',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
  ]),
});

export const aiGuideInputSchema = z.object({
  query: z.string().min(2, 'Please enter a question or query').max(1000),
  conversationId: z.string().uuid().or(z.string().min(1)).optional(),
});

export const aiGuideOutputSchema = z.object({
  intent: z.string(),
  recommendedServiceId: z.string().nullable(),
  recommendedServiceName: z.string(),
  reason: z.string(),
  requiredDocuments: z.array(z.string()),
  nextAction: z.enum(['VIEW_SERVICE', 'BOOK_APPOINTMENT', 'ASK_CLARIFICATION']),
  confidence: z.number().min(0).max(1),
});

export const availabilityQuerySchema = z.object({
  centerId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
