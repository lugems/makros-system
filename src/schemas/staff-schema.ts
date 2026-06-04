import { z } from 'zod';

export const staffSchema = z.object({
  staffId: z.string(),
  fullName: z.string().nonempty(),
  role: z.enum(['Manager', 'Technician', 'Clerk']),
  phone: z.string().nonempty(),
  email: z.string().email(),
});

export type Staff = z.infer<typeof staffSchema>;
