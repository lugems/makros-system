import { InventoryItem } from '@/types/inventory';

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    itemId: 'item-001',
    itemName: 'Engine Oil 5W-30',
    category: 'Fluids & Lubricants',
    status: 'Active',
    quantity: 50,
    reorderLevel: 10,
    purchasePrice: 35000,
    sellingPrice: 45000,
    supplierId: 'sup-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    itemId: 'item-002',
    itemName: 'Brake Pads (Front)',
    category: 'Braking System',
    status: 'Active',
    quantity: 12,
    reorderLevel: 5,
    purchasePrice: 45000,
    sellingPrice: 65000,
    supplierId: 'sup-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    itemId: 'item-003',
    itemName: 'Air Filter',
    category: 'Filters',
    status: 'Active',
    quantity: 25,
    reorderLevel: 8,
    purchasePrice: 8000,
    sellingPrice: 15000,
    supplierId: 'sup-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
