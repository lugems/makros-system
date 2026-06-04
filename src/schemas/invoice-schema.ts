import { z } from 'zod';

export const invoiceStatusSchema = z.enum(['Paid', 'Unpaid', 'Overdue']);
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export const invoiceTaskSchema = z.object({
  id: z.string(),
  description: z.string(),
  price: z.number(),
});

export const invoicePartSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantityUsed: z.number(),
  price: z.number(),
});

export const invoiceSchema = z.object({
  id: z.string(),
  jobCardId: z.string().optional(),
  customerName: z.string(),
  vehicleDetails: z.string(),
  date: z.string(),
  tasks: z.array(invoiceTaskSchema),
  parts: z.array(invoicePartSchema),
  discount: z.number().default(0),
  taxRate: z.number().default(0),
  status: invoiceStatusSchema,
  amount: z.number().optional(), // for backward compatibility
  issuedDate: z.date().optional(), // for backward compatibility
  dueDate: z.date().optional(), // for backward compatibility
});

export type Invoice = z.infer<typeof invoiceSchema>;
