import { z } from 'zod';

export const inventorySchema = z.object({
  id: z.string(),
  name: z.string(),
  partNumber: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number(),
  lowStockThreshold: z.number().default(10),
  costPrice: z.number().optional(),
  salePrice: z.number().optional(),
  price: z.number().optional(), // For backward compatibility
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
});

export type InventoryItem = z.infer<typeof inventorySchema>;

export const inventoryItemFormSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  partNumber: z.string().optional(),
  supplierId: z.string().optional(),
  quantity: z.coerce.number().min(0),
  lowStockThreshold: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0),
});

export type InventoryItemFormData = z.infer<typeof inventoryItemFormSchema>;
