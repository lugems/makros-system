'use client';

import { Card, CardContent } from '@/components/ui/card';
import { InventoryItem } from '@/types/inventory';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { LowStockBadge } from './low-stock-badge';
import { Badge } from '@/components/ui/badge';
import { Package, Fingerprint, Truck, ChevronRight, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EditInventoryItemDialog } from './edit-inventory-item-dialog';

interface InventoryCardProps {
  item: InventoryItem;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ item }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card className="hover:border-primary/40 transition-all group relative overflow-hidden bg-card border-border/50">
      <CardContent className="p-5 space-y-4">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/5 text-primary">
                    <Package className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-sm font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors">
                        {item.itemName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <Fingerprint className="h-3 w-3 text-muted-foreground/40" />
                        <span className="text-[9px] font-mono text-muted-foreground uppercase font-bold tracking-tighter">
                            {item.itemId.slice(-8).toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
            <LowStockBadge quantity={item.quantity} lowStockThreshold={item.reorderLevel} />
        </div>

        <div className="space-y-3">
            <div className="flex items-center justify-between bg-muted/30 p-2.5 rounded-xl border border-dashed border-border/50">
                <div className="space-y-1">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Catalog Rate</p>
                    <p className="text-sm font-black text-primary"><CurrencyFormat value={item.sellingPrice} abbreviate /></p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Vendor Source</p>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-foreground/60 uppercase">
                        <Truck className="h-2.5 w-2.5" /> {item.supplierId}
                    </div>
                </div>
            </div>
        </div>

        <div className="flex gap-2 pt-1">
            <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-9 text-[9px] font-black uppercase tracking-widest bg-background rounded-xl"
                onClick={() => router.push(`/inventory/${item.itemId}`)}
            >
                Inspect Dossier
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-9 w-9 rounded-xl border border-border/50"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl p-1.5 shadow-xl w-48">
                    <DropdownMenuItem onClick={() => router.push(`/inventory/${item.itemId}`)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Eye className="h-3.5 w-3.5" /> View SKU
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsEditing(true)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Pencil className="h-3.5 w-3.5" /> Edit Record
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-destructive">
                        <Trash2 className="h-3.5 w-3.5" /> Purge SKU
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardContent>
      
      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20" />

      {isEditing && (
          <EditInventoryItemDialog 
            item={item} 
            isOpen={isEditing} 
            onOpenChange={setIsEditing} 
          />
      )}
    </Card>
  );
};
