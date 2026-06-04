import { z } from 'zod';

export const ServiceStatusSchema = z.enum(["Active", "Inactive"]);
export type ServiceStatus = z.infer<typeof ServiceStatusSchema>;

export const ServiceCategorySchema = z.enum([
  "General Service",
  "Diagnostics",
  "Engine",
  "Brakes",
  "Suspension",
  "Tyres",
  "Battery",
  "Car Wash",
  "Body Works",
  "Electrical",
  "Other"
]);
export type ServiceCategory = z.infer<typeof ServiceCategorySchema>;

export const MakrosServiceSchema = z.object({
  serviceId: z.string(),
  serviceName: z.string(),
  category: ServiceCategorySchema,
  description: z.string(),
  defaultLaborCost: z.number(),
  estimatedDuration: z.string(), // e.g., "2 hours", "30 minutes"
  status: ServiceStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type MakrosService = z.infer<typeof MakrosServiceSchema>;
