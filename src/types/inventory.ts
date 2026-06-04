export interface InventoryItem {
    itemId: string;
    itemName: string;
    category: string;
    quantity: number;
    reorderLevel: number;
    purchasePrice: number;
    sellingPrice: number;
    supplierId: string;
    status: "Active" | "Inactive";
    createdAt: string;
    updatedAt: string;
  }

export interface StockMovement {
  movementId: string;
  itemId: string;
  itemName: string;
  type: 'In' | 'Out';
  quantityChange: number;
  reason: string; // e.g. "Allocated to Job JC-1234", "Restock from Supplier", "Manual Adjustment"
  recordId?: string; // Link to JobCard or Invoice
  date: any;
  userId: string;
}
