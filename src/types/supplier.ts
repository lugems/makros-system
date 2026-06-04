
export interface Supplier {
  supplierId: string;
  supplierName: string;
  phone: string;
  email?: string;
  address?: string;
  status: "Active" | "Inactive";
  createdAt: any;
  updatedAt: any;
  itemsSuppliedCount?: number;
  lowStockItemsCount?: number;
  stockValue?: number;
}
