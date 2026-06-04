import { z } from 'zod';

export const vehicleSchema = z.object({
  id: z.string(),
  numberPlate: z.string(),
  make: z.string().nonempty(),
  model: z.string().nonempty(),
  year: z.union([z.string(), z.number()]),
  chassisNumber: z.string().optional(),
  vin: z.string().optional(), // Adding vin support to match UI usage
  owner: z.string(),
  status: z.enum(['Active', 'Inactive']),
});

export type Vehicle = z.infer<typeof vehicleSchema>;