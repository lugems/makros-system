'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Hash, Plus, Warehouse } from 'lucide-react';
import { InventoryItem } from '@/types/inventory';
import { addPartToJobCardTransaction } from '@/services/job-cards-service';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { SearchableSelect } from '@/components/shared/searchable-select';

export function AddJobPartDialog({ jobCardId }: { jobCardId: string }) {
  const { user } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState('1');

  // Authorization Gating
  const isAuthorized = useMemo(() => {
    if (!user) return false;
    return ['Makros System Owner', 'Workshop Manager', 'Mechanic', 'Inventory Officer'].includes(user.role);
  }, [user]);

  const inventoryQuery = useMemo(() => {
    if (!isAuthorized || !db) return null;
    return query(collection(db, 'inventory'), where('status', '==', 'Active')) as any;
  }, [db, isAuthorized]);

  const { data: inventory, loading: invLoading } = useCollection<InventoryItem>(inventoryQuery);

  const handleSubmit = async () => {
    if (!user || !itemId) return;

    try {
        await addPartToJobCardTransaction(jobCardId, itemId, parseFloat(quantity), user.userId);
        setOpen(false);
        setItemId('');
        setQuantity('1');
        toast({ title: "Inventory Allocated", description: "Technical materials synced to repair dossier." });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Allocation Failed", description: error.message });
    }
  };

  const inventoryOptions = useMemo(() => 
    inventory?.map(item => ({
        value: item.itemId,
        label: item.itemName,
        description: `${item.quantity} Units Available • Rate: ${item.sellingPrice.toLocaleString()} Ush`,
        icon: <Package className="h-4 w-4" />
    })) || [],
    [inventory]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-4 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all shadow-sm"
        >
          <Plus className="h-3 w-3 mr-1.5" /> Add Part
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[480px] border-border/50">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">Material Allocation</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-6 px-6 pb-6 pt-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Warehouse className="h-3 w-3 text-primary" /> Select SKU from Inventory
              </Label>
              <SearchableSelect 
                options={inventoryOptions}
                value={itemId}
                onValueChange={setItemId}
                placeholder="Search inventory catalog..."
                isLoading={invLoading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Hash className="h-3 w-3 text-primary" /> Allocation Quantity
              </Label>
              <Input 
                type="number" 
                step="any"
                value={quantity} 
                onChange={e => setQuantity(e.target.value)} 
                min="0.01"
                className="rounded-xl h-11 bg-muted/50 border-none font-black text-primary"
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="p-6 border-t">
          <Button 
            className="w-full h-14 font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]" 
            onClick={handleSubmit} 
            disabled={!itemId || !isAuthorized}
          >
              Commit Material Allocation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
