import { z } from 'zod';

export const jobStatusSchema = z.enum(['Pending', 'In Progress', 'Completed', 'Cancelled', 'On Hold']);
export type JobStatus = z.infer<typeof jobStatusSchema>;

export const jobCardSchema = z.object({
  id: z.string(),
  bookingId: z.string().optional(),
  customerId: z.string(),
  customerName: z.string(),
  vehicleId: z.string(),
  vehicleDescription: z.string(),
  assignedMechanicId: z.string().optional(),
  assignedMechanicName: z.string().optional(),
  serviceDescription: z.string(),
  status: jobStatusSchema,
  totalCost: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type JobCard = z.infer<typeof jobCardSchema>;

export const jobCardFormSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  vehicleId: z.string().min(1, 'Please select a vehicle'),
  assignedMechanicId: z.string().optional(),
  serviceDescription: z.string().min(1, 'Service description is required'),
  status: jobStatusSchema.default('Pending'),
});

export type JobCardFormData = z.infer<typeof jobCardFormSchema>;
