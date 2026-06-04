
'use client';

import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InventoryItem } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Pencil, Package, Fingerprint, Truck, MoreHorizontal, Eye, Trash2, ShieldAlert } from 'lucide-react';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { LowStockBadge } from './low-stock-badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { EditInventoryItemDialog } from './edit-inventory-item-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteInventoryItem } from '@/services/inventory-service';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

interface InventoryTableProps {
  inventory: InventoryItem[];
}

/**
 * @fileOverview High-density technical registry table for global SKU management.
 * Restricted to administrative roles per operational requirements.
 */
export const InventoryTable: React.FC<InventoryTableProps> = ({ inventory }) => {
  const router = useRouter();
  const { user, role } = useAuth();
  const { toast } = useToast();
  
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  // Administrative Authority Gate
  const canManageInventory = useMemo(() => 
    ['Makros System Owner', 'Workshop Manager', 'Inventory Officer', 'Accountant'].includes(role || ''),
  [role]);

  const handleDelete = async () => {
      if (itemToDelete && user) {
          try {
            await deleteInventoryItem(itemToDelete.itemId, user.userId);
            toast({ 
              title: "SKU Decommissioned", 
              description: `${itemToDelete.itemName} has been permanently purged from the technical catalog.` 
            });
            setItemToDelete(null);
          } catch (error: any) {
            toast({
              variant: "destructive",
              title: "Decommissioning Failed",
              description: error.message
            });
          }
      }
  };

  return (
    <>
        <Table>
            <TableHeader>
                <TableRow className="bg-muted/50 uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground">
                    <TableHead className="px-6 py-4">Item Identity & Reference</TableHead>
                    <TableHead className="px-6 py-4">Availability</TableHead>
                    <TableHead className="px-6 py-4">Vendor Source</TableHead>
                    <TableHead className="px-6 py-4 text-right">Unit Cost</TableHead>
                    <TableHead className="px-6 py-4 text-right">Retail Rate</TableHead>
                    <TableHead className="px-6 py-4 text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {inventory.map((item) => (
                    <TableRow 
                        key={item.itemId} 
                        className="cursor-pointer hover:bg-muted/30 transition-all group"
                        onClick={() => router.push(`/inventory/${item.itemId}`)}
                    >
                        <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/5">
                                    <Package className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-black group-hover:text-primary transition-colors uppercase tracking-tight leading-none">
                                        {item.itemName}
                                    </p>
                                    <div className="flex items-center gap-1.5 pt-1">
                                        <Fingerprint className="h-3 w-3 text-muted-foreground/50" />
                                        <span className="text-[9px] font-mono text-muted-foreground uppercase font-bold tracking-tight">
                                            {item.itemId.slice(-8).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                            <LowStockBadge quantity={item.quantity} lowStockThreshold={item.reorderLevel} />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <Truck className="h-3.5 w-3.5 text-muted-foreground/50" />
                                <span className="text-[10px] font-bold text-foreground uppercase tracking-tight">{item.supplierId || 'Direct'}</span>
                            </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                            <p className="text-sm font-bold text-muted-foreground">
                                <CurrencyFormat value={item.purchasePrice} />
                            </p>
                            <p className="text-[9px] font-bold uppercase tracking-tighter opacity-40">Cost Basis</p>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                            <p className="text-sm font-black text-primary">
                                <CurrencyFormat value={item.sellingPrice} />
                            </p>
                            <p className="text-[9px] font-black uppercase tracking-tighter text-primary/40">Market Rate</p>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl p-1.5 shadow-xl w-48">
                                    <DropdownMenuItem onClick={() => router.push(`/inventory/${item.itemId}`)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                                        <Eye className="h-3.5 w-3.5" /> SKU Dossier
                                    </DropdownMenuItem>
                                    
                                    {canManageInventory ? (
                                        <>
                                            <DropdownMenuItem onClick={() => setEditingItem(item)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                                                <Pencil className="h-3.5 w-3.5" /> Update Record
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                onClick={() => setItemToDelete(item)} 
                                                className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-destructive focus:bg-destructive/10 focus:text-destructive"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Purge SKU
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem disabled className="rounded-lg gap-2 text-[8px] font-black uppercase tracking-widest opacity-40">
                                                <ShieldAlert className="h-3 w-3" /> Admin Restricted
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
                {inventory.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="h-64 text-center text-muted-foreground opacity-30 italic">
                            No SKU records detected in technical registry.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>

        {editingItem && (
            <EditInventoryItemDialog 
                item={editingItem} 
                isOpen={!!editingItem} 
                onOpenChange={(open) => !open && setEditingItem(null)} 
            />
        )}

        <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
            <AlertDialogContent className="rounded-3xl border-border/50">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Purge SKU Record?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                        This action will permanently decommission <span className="font-bold text-foreground">{(itemToDelete as any)?.itemName}</span> from the workshop catalog. Physical stock remaining will need to be manually audited. This operation is forensic-grade and irreversible.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive hover:bg-destructive/90 font-black uppercase tracking-widest text-[10px] h-11 border-none text-white">Confirm Purge</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
};
