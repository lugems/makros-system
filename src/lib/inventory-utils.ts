import { InventoryItem } from '../types';

export function isLowStock(item: InventoryItem): boolean {
  return item.quantity <= item.reorderLevel;
}

export function deductStock(item: InventoryItem, quantity: number): InventoryItem {
  if (item.quantity < quantity) {
    throw new Error('Not enough stock');
  }
  return { ...item, quantity: item.quantity - quantity };
}

export function getLowStockItems(items: InventoryItem[]): InventoryItem[] {
  return items.filter(isLowStock);
}
