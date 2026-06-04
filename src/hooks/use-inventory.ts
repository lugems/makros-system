import { useState, useEffect } from 'react';
import { InventoryItem } from '@/types/inventory';

const mockInventory: InventoryItem[] = [
  {
    itemId: '1',
    itemName: 'Engine Oil',
    quantity: 50,
    sellingPrice: 25.99,
    purchasePrice: 20.00,
    reorderLevel: 10,
    category: 'Fluids',
    status: 'Active',
    supplierId: 'sup-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    itemId: '2',
    itemName: 'Brake Pads',
    quantity: 30,
    sellingPrice: 45.50,
    purchasePrice: 35.00,
    reorderLevel: 5,
    category: 'Brakes',
    status: 'Active',
    supplierId: 'sup-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setItems(mockInventory);
      setIsLoading(false);
    }, 500);
  }, []);

  return { items, isLoading };
};
