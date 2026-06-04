'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Supplier } from '@/types/supplier';
import { MoreHorizontal, Eye, Edit, Activity, Truck, Phone, Mail, Fingerprint, Trash2, ChevronRight } from 'lucide-react';
import { SupplierStatusBadge } from './supplier-status-badge';
import { hasSupplierPermission } from '@/lib/supplier-permissions';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { cn } from '@/lib/utils';

interface SuppliersTableProps {
  suppliers: (Supplier & { itemsSuppliedCount?: number; lowStockItemsCount?: number; stockValue?: number })[];
  permissions: string[];
  onViewProfile: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDeactivate: (supplierId: string) => void;
  onDelete: (supplier: Supplier) => void;
  selectedId?: string | null;
}

export const SuppliersTable: React.FC<SuppliersTableProps> = ({ 
    suppliers, 
    permissions, 
    onViewProfile, 
    onEdit, 
    onDeactivate, 
    onDelete,
    selectedId 
}) => {
  const canEdit = hasSupplierPermission(permissions, 'edit');
  const canDeactivate = hasSupplierPermission(permissions, 'deactivate');

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground border-none">
          <TableHead className="px-8 py-5 w-[300px]">Supplier Identity</TableHead>
          <TableHead className="px-8 py-5">Technical Reach</TableHead>
          <TableHead className="px-8 py-5">Operational Status</TableHead>
          <TableHead className="px-8 py-5 text-right">SKU Depth</TableHead>
          <TableHead className="px-8 py-5 text-right">Active Equity</TableHead>
          <TableHead className="px-8 py-5 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.map((supplier) => {
          const id = supplier.supplierId || (supplier as any).id;
          const isActive = selectedId === id;

          return (
            <TableRow 
              key={id}
              className={cn(
                "hover:bg-muted/30 transition-colors group cursor-pointer border-l-4 border-l-transparent",
                isActive ? "bg-primary/[0.04] border-l-primary" : "border-border/50"
              )}
              onClick={() => onViewProfile(supplier)}
            >
              <TableCell className="px-8 py-6">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300",
                    isActive ? "bg-primary text-white border-primary/20 shadow-lg shadow-primary/20 scale-105" : "bg-primary/5 border-primary/10 text-primary"
                  )}>
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className={cn(
                        "text-sm font-black uppercase tracking-tight leading-none transition-colors",
                        isActive ? "text-primary" : "group-hover:text-primary"
                    )}>
                      {supplier.supplierName}
                    </p>
                    <div className="flex items-center gap-2">
                      <Fingerprint className="h-3.5 w-3.5 text-muted-foreground/30" />
                      <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-tighter">
                          {id.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-8 py-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-primary/50" />
                    <span className="text-[11px] font-bold text-foreground/80">{supplier.phone}</span>
                  </div>
                  {supplier.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-primary/50" />
                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{supplier.email}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="px-8 py-6">
                <SupplierStatusBadge status={supplier.status as any} className="text-[8px]" />
              </TableCell>
              <TableCell className="px-8 py-6 text-right">
                <p className="text-base font-black text-foreground tabular-nums tracking-tighter">{supplier.itemsSuppliedCount ?? 0}</p>
                <p className='text-[9px] font-black text-muted-foreground uppercase tracking-widest pt-1 opacity-40'>Line Items</p>
              </TableCell>
              <TableCell className="px-8 py-6 text-right">
                <p className="text-base font-black text-primary tabular-nums tracking-tighter">
                  <CurrencyFormat value={supplier.stockValue ?? 0} abbreviate />
                </p>
                <p className='text-[9px] font-black text-primary uppercase tracking-widest pt-1 opacity-40'>Net Worth</p>
              </TableCell>
              <TableCell className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl p-2 shadow-2xl w-52 border-border/50">
                        <DropdownMenuItem onClick={() => onViewProfile(supplier)} className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                          <Eye className="h-4 w-4 text-primary" />
                          Inspect Dossier
                        </DropdownMenuItem>
                        {canEdit && (
                          <DropdownMenuItem onClick={() => onEdit(supplier)} className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                            <Edit className="h-4 w-4 text-primary" />
                            Update Record
                          </DropdownMenuItem>
                        )}
                        {canDeactivate && (
                          <DropdownMenuItem onClick={() => onDeactivate(id)} className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                            <Activity className="h-4 w-4 text-primary" />
                            {supplier.status === 'Active' ? 'Deactivate' : 'Restore Duty'}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem 
                            onClick={() => onDelete(supplier)} 
                            className="rounded-xl gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Purge Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <ChevronRight className={cn("h-4 w-4 text-muted-foreground/20 transition-all duration-300", isActive && "translate-x-1 text-primary opacity-100")} />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {suppliers.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="h-64 text-center text-muted-foreground">
              <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                <Truck className="h-12 w-12 mb-2" />
                <p className="text-sm italic font-medium tracking-wide">No verified suppliers matching your current filter.</p>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
