import { z } from 'zod';

export const paymentSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  customerName: z.string(),
  amount: z.number(),
  date: z.string(),
  paymentMethod: z.string(),
  transactionReference: z.string().optional(),
});

export type Payment = z.infer<typeof paymentSchema>;
