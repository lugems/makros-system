import { z } from 'zod';

export const bookingFormSchema = z.object({
  customerId: z.string({ required_error: 'Please select a customer.' }),
  vehicleId: z.string({ required_error: 'Please select a vehicle.' }),
  serviceDescription: z.string().min(1, 'Service description is required.'),
  bookingDate: z.date(),
  status: z.enum(['Pending', 'Confirmed', 'Cancelled', 'Completed']),
});

export const bookingSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string().optional(),
  vehicleId: z.string(),
  vehicleDescription: z.string().optional(),
  serviceDescription: z.string(),
  bookingDate: z.string(),
  status: z.enum(['Pending', 'Confirmed', 'Cancelled', 'Completed']),
});


export type Booking = z.infer<typeof bookingSchema>;
export type BookingFormData = z.infer<typeof bookingFormSchema>;
