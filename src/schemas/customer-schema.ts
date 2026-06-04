
import { z } from 'zod';

export const CustomerSchema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')), 
  phone: z.string().min(1, { message: 'Phone number is required' }),
  address: z.string().optional(),
});

export type Customer = z.infer<typeof CustomerSchema>;
