'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { InventoryForm, InventoryFormValues } from './inventory-form';
import { updateInventoryItem } from '@/services/inventory-service';
import { useAuth } from '@/contexts/auth-context';
import { InventoryItem } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';

interface EditInventoryItemDialogProps {
    item: InventoryItem;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * @fileOverview Technical synchronization terminal for modifying existing SKU dossiers.
 * Ensures all technical updates are forensically audited.
 */
export function EditInventoryItemDialog({ item, isOpen, onOpenChange }: EditInventoryItemDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (data: InventoryFormValues) => {
    if (!user) return;

    try {
      await updateInventoryItem(item.itemId, data, user.userId);
      toast({ 
        title: "Record Synchronized", 
        description: `Technical specifications for ${item.itemName} updated successfully.` 
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Synchronization Failed",
        description: error.message || "A registry collision or permission error occurred."
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[480px] border-border/50">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">Technical Data Update</DialogTitle>
          <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Synchronize registry record for SKU #{item.itemId.slice(-8).toUpperCase()}
          </DialogDescription>
        </DialogHeader>
        <InventoryForm onSubmit={handleSubmit} item={item} />
      </DialogContent>
    </Dialog>
  );
}
