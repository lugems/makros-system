'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

import { LowStockBadge } from '@/components/inventory/low-stock-badge';
import { InventoryItem } from '@/schemas/inventory-schema';

export const inventoryColumns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: 'name',
    header: 'Item',
    cell: ({ row }) => (
      <div>
        <div>{row.original.name}</div>
        <div className="text-xs text-gray-500">{row.original.partNumber}</div>
      </div>
    ),
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => (
        <LowStockBadge 
            quantity={row.original.quantity} 
            lowStockThreshold={row.original.lowStockThreshold} 
        />
    ),
  },
  {
    accessorKey: 'supplierName',
    header: 'Supplier',
    cell: ({ row }) => (
        row.original.supplierId ? (
        <Link href={`/suppliers/${row.original.supplierId}`} className="text-blue-500 hover:underline">
          {row.original.supplierName}
        </Link>
      ) : 'N/A'
    ),
  },
  {
    accessorKey: 'costPrice',
    header: 'Cost Price',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('costPrice'));
      return <div>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)}</div>;
    },
  },
  {
    accessorKey: 'salePrice',
    header: 'Sale Price',
    cell: ({ row }) => {
        const amount = parseFloat(row.getValue('salePrice'));
        return <div>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)}</div>;
      },
  },
];
