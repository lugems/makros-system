'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Supplier } from '@/types/supplier';
import { InventoryItem } from '@/types/inventory';
import { X, Phone, Mail, MapPin, Package, Fingerprint, Info, History, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { SupplierStatusBadge } from './supplier-status-badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { cn } from '@/lib/utils';

interface SupplierProfileProps {
  supplier: Supplier;
  inventory: InventoryItem[];
  onClose: () => void;
}

export const SupplierProfile: React.FC<SupplierProfileProps> = ({ supplier, inventory, onClose }) => {
  const id = supplier.supplierId || (supplier as any).id;
  const itemsSupplied = inventory.filter(item => item.supplierId === id);
  const lowStockItems = itemsSupplied.filter(item => item.quantity <= item.reorderLevel);
  const stockValue = itemsSupplied.reduce((total, item) => total + (item.purchasePrice * item.quantity), 0);

  return (
    <Card className="h-[calc(100vh-220px)] border-border/50 bg-card shadow-2xl flex flex-col overflow-hidden text-foreground rounded-[2.5rem] premium-shadow animate-in slide-in-from-right-4 duration-500">
      <CardHeader className="bg-muted/30 p-8 border-b flex flex-row items-center justify-between space-y-0 shrink-0">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-3.5 w-3.5 text-primary" />
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em]">{id.toUpperCase()}</p>
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-tight truncate max-w-[220px]">{supplier.supplierName}</CardTitle>
        </div>
        <div className="flex items-center gap-3">
          <SupplierStatusBadge status={supplier.status as any} className="text-[9px]" />
          <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-background border border-transparent hover:border-border/50">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="p-8 space-y-10">
          {/* Performance Matrix */}
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 text-center group transition-all hover:bg-primary/10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Catalog SKUs</p>
                  <p className="text-3xl font-black leading-none">{itemsSupplied.length}</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase mt-2">Active Line Items</p>
              </div>
              <div className="bg-orange-500/5 p-6 rounded-3xl border border-orange-500/10 text-center group transition-all hover:bg-orange-500/10">
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-2">Alerts</p>
                  <p className="text-3xl font-black leading-none text-orange-600">{lowStockItems.length}</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase mt-2">Low Stock States</p>
              </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
              <div className="flex items-center gap-3 text-primary mb-4">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.4em]">Equity Index</span>
              </div>
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Active Valuation</h4>
              <p className="text-4xl font-black text-white tracking-tighter"><CurrencyFormat value={stockValue} /></p>
              <div className="flex items-center gap-2 mt-4 text-[9px] font-bold text-white/30 uppercase tracking-widest">
                  <TrendingUp className="h-3 w-3 text-green-500" /> Verified procurement equity
              </div>
          </div>

          {/* Registry Directory */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center border border-border/50">
                    <Info className="h-4 w-4" />
                </div>
                <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Registry Identification</h3>
            </div>
            <div className="pl-11 space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 group">
                        <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center border border-transparent group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <Phone className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-tight">{supplier.phone}</p>
                    </div>
                    {supplier.email && (
                        <div className="flex items-center gap-4 group">
                            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center border border-transparent group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                <Mail className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-bold text-muted-foreground truncate">{supplier.email}</p>
                        </div>
                    )}
                    {supplier.address && (
                        <div className="flex items-start gap-4 group pt-1">
                            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center border border-transparent group-hover:bg-primary group-hover:text-white transition-all shadow-sm shrink-0">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <p className="text-[11px] font-medium leading-relaxed italic text-foreground/80">{supplier.address}</p>
                        </div>
                    )}
                </div>
            </div>
          </div>

          <Separator className="opacity-50" />

          {/* Fulfillment Tracking */}
          <div className="space-y-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center border border-border/50">
                      <History className="h-4 w-4" />
                  </div>
                  <h3 className="font-black uppercase text-[11px] tracking-[0.2em] text-foreground">Catalog Fulfillment</h3>
              </div>
              <div className="pl-11 space-y-3">
                {itemsSupplied.length > 0 ? (
                    itemsSupplied.map(item => (
                        <div key={item.itemId} className="flex justify-between items-center p-4 rounded-2xl border border-border/50 bg-muted/20 hover:border-primary/30 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="h-9 w-9 rounded-xl bg-background border flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-xs font-black uppercase tracking-tight truncate max-w-[140px]">{item.itemName}</p>
                                  <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">SKU: {item.itemId.slice(-6)}</p>
                                </div>
                            </div>
                            <div className="text-right">
                              <span className={cn(
                                "text-sm font-black tabular-nums",
                                item.quantity <= item.reorderLevel ? 'text-destructive' : 'text-green-600'
                              )}>
                                {item.quantity}
                              </span>
                              <p className="text-[8px] font-bold text-muted-foreground uppercase">Units</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center bg-muted/10 rounded-3xl border-2 border-dashed border-border/50 opacity-40">
                        <p className="text-xs font-medium italic">No material assets linked to this vendor registry.</p>
                    </div>
                )}
              </div>
          </div>
        </CardContent>
      </ScrollArea>
      
      <div className="bg-muted/30 px-8 py-6 border-t flex flex-col items-center justify-center shrink-0">
          <div className="flex items-center gap-3 text-muted-foreground/30 mb-2">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.6em]">Makros System Technical OS</p>
          </div>
          <p className="text-[8px] font-bold text-muted-foreground/20 uppercase tracking-widest">Certified Vendor Archive Record</p>
      </div>
    </Card>
  );
};
