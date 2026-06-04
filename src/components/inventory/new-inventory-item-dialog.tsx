'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InventoryForm, InventoryFormValues } from './inventory-form';
import { createInventoryItem } from '@/services/inventory-service';
import { useAuth } from '@/contexts/auth-context';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Technical enrollment terminal for adding new SKUs to the workshop ledger.
 * Interfaces directly with the Firestore inventory service for persistence and auditing.
 */
export function NewInventoryItemDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: InventoryFormValues) => {
    if (!user) return;

    try {
      await createInventoryItem(data, user.userId);
      setOpen(false);
      toast({ 
        title: "Catalog Expanded", 
        description: `${data.itemName} has been successfully enrolled in the technical registry.` 
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Enrollment Failed",
        description: error.message || "A technical error occurred during registry synchronization."
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 font-black uppercase tracking-[0.2em] text-[10px] h-11 px-6 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" /> Enroll SKU
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[480px] border-border/50">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">Stock Enrollment</DialogTitle>
          <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Register a new SKU in the workshop technical catalog.
          </DialogDescription>
        </DialogHeader>
        <InventoryForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
