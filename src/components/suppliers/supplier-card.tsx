
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Supplier } from '@/types/supplier';
import { SupplierStatusBadge } from './supplier-status-badge';
import { hasSupplierPermission } from '@/lib/supplier-permissions';
import { Truck, Phone, Mail, Fingerprint, MoreHorizontal, Eye, Edit, Activity, Trash2, Banknote } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { CurrencyFormat } from '@/components/shared/currency-format';

interface SupplierCardProps {
  supplier: (Supplier & { itemsSuppliedCount?: number; lowStockItemsCount?: number; stockValue?: number });
  permissions: string[];
  onViewProfile: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDeactivate: (supplierId: string) => void;
  onDelete?: (supplier: Supplier) => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({ 
    supplier, 
    permissions, 
    onViewProfile, 
    onEdit, 
    onDeactivate,
    onDelete 
}) => {
  const canView = hasSupplierPermission(permissions, 'view');
  const canEdit = hasSupplierPermission(permissions, 'edit');
  const canDeactivate = hasSupplierPermission(permissions, 'deactivate');

  return (
    <Card className="hover:border-primary/40 transition-all group relative overflow-hidden bg-card border-border/50">
      <CardContent className="p-5 space-y-4">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/5 text-primary">
                    <Truck className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-sm font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors">
                        {supplier.supplierName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <Fingerprint className="h-3 w-3 text-muted-foreground/40" />
                        <span className="text-[9px] font-mono text-muted-foreground uppercase font-bold tracking-tighter">
                            {supplier.supplierId.slice(-8).toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
            <SupplierStatusBadge status={supplier.status} />
        </div>

        <div className="space-y-3">
            <div className="flex items-center justify-between bg-muted/30 p-2.5 rounded-xl border border-dashed border-border/50">
                <div className="space-y-1">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Supply Equity</p>
                    <p className="text-sm font-black text-primary"><CurrencyFormat value={supplier.stockValue ?? 0} abbreviate /></p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">SKU Count</p>
                    <p className="text-xs font-bold text-foreground/80">{supplier.itemsSuppliedCount ?? 0} Units</p>
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                    <Phone className="h-3 w-3 opacity-50" /> {supplier.phone}
                </div>
                {supplier.email && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground truncate">
                        <Mail className="h-3 w-3 opacity-50" /> {supplier.email}
                    </div>
                )}
            </div>
        </div>

        <div className="flex gap-2 pt-1">
            <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-9 text-[9px] font-black uppercase tracking-widest bg-background rounded-xl"
                onClick={() => onViewProfile(supplier)}
            >
                Inspect Partner
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
                    <DropdownMenuItem onClick={() => onViewProfile(supplier)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Eye className="h-3.5 w-3.5" /> Open Dossier
                    </DropdownMenuItem>
                    {canEdit && (
                        <DropdownMenuItem onClick={() => onEdit(supplier)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                            <Edit className="h-3.5 w-3.5" /> Update Record
                        </DropdownMenuItem>
                    )}
                    {canDeactivate && (
                        <DropdownMenuItem onClick={() => onDeactivate(supplier.supplierId)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                            <Activity className="h-3.5 w-3.5" />
                            {supplier.status === 'Active' ? 'Deactivate' : 'Restore'}
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={() => onDelete?.(supplier)}
                        className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                        <Trash2 className="h-3.5 w-3.5" /> Purge Account
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardContent>
      
      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20" />
    </Card>
  );
};
