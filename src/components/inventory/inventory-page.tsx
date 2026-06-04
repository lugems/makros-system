'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InventoryForm, InventoryFormValues } from '@/components/inventory/inventory-form';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { StockMovementList } from '@/components/inventory/stock-movement-list';
import { LowStockAlerts } from '@/components/dashboard/low-stock-alerts';
import { MOCK_INVENTORY } from '@/data/seed-inventory';

export function InventoryPage() {
  const [open, setOpen] = useState(false);

  const handleFormSubmit = (data: InventoryFormValues) => {
    console.log('New Inventory Item:', data);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <InventoryForm onSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <InventoryTable inventory={MOCK_INVENTORY} />
        </div>
        <div>
            <LowStockAlerts items={MOCK_INVENTORY.filter(i => i.quantity <= i.reorderLevel)} />
        </div>
      </div>
        
      <StockMovementList />
    </div>
  );
}
