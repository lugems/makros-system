
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, Fingerprint, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { LowStockBadge } from '@/components/inventory/low-stock-badge';
import { InventoryItem } from '@/types/inventory';
import { cn } from '@/lib/utils';

interface InventoryReportProps {
  inventory: InventoryItem[];
}

/**
 * @fileOverview Critical Inventory Replenishment Roadmap.
 * Analyzes SKU depletion against reorder thresholds to prioritize procurement actions.
 */
const InventoryReport = ({ inventory }: InventoryReportProps) => {
  const criticalItems = React.useMemo(() => {
    if (!inventory) return [];
    return inventory
        .filter(item => item.quantity <= item.reorderLevel)
        // Sort by depletion percentage: 0 stock items first, then those closest to reorder level
        .sort((a, b) => {
            if (a.quantity === 0 && b.quantity > 0) return -1;
            if (b.quantity === 0 && a.quantity > 0) return 1;
            const ratioA = a.quantity / (a.reorderLevel || 1);
            const ratioB = b.quantity / (b.reorderLevel || 1);
            return ratioA - ratioB;
        })
        .slice(0, 15);
  }, [inventory]);

  return (
    <Card className="rounded-[2.5rem] border-border/50 bg-card overflow-hidden shadow-sm premium-shadow h-full">
      <CardHeader className="bg-muted/30 border-b p-8 space-y-1">
        <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-500" /> Supply Chain
            </CardTitle>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-200 text-[8px] font-black uppercase px-3 py-1">
                Registry Shortages: {criticalItems.length}
            </Badge>
        </div>
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Critical Inventory Replenishment Roadmap</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10 border-none uppercase text-[9px] font-black tracking-[0.3em] text-muted-foreground">
                <TableHead className="px-8 h-14">SKU Identity & Reference</TableHead>
                <TableHead className="px-8 h-14">Availability State</TableHead>
                <TableHead className="px-8 text-right h-14">Vendor Authority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {criticalItems.map((item) => (
                <TableRow key={item.itemId} className="hover:bg-muted/30 border-border/50 group transition-all">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 shadow-sm",
                          item.quantity === 0 ? "bg-red-500/10 text-red-600 border-red-200" : "bg-background border-border/50"
                      )}>
                          <Package className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                          <p className="text-xs font-black uppercase tracking-tight group-hover:text-primary transition-colors">{item.itemName}</p>
                          <div className="flex items-center gap-2">
                              <Fingerprint className="h-3 w-3 text-primary opacity-40" />
                              <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-tighter">REF: {item.itemId.slice(-8).toUpperCase()}</span>
                          </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8">
                      <LowStockBadge quantity={item.quantity} lowStockThreshold={item.reorderLevel} />
                  </TableCell>
                  <TableCell className="px-8 text-right">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-foreground/70">
                            <Truck className="h-3 w-3 opacity-40" />
                            {item.supplierId || 'Direct Supply'}
                        </div>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Authorized Provider</p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {criticalItems.length === 0 && (
            <div className="py-32 text-center opacity-40 italic text-sm text-muted-foreground flex flex-col items-center justify-center space-y-4">
                <div className="h-20 w-20 rounded-[2rem] bg-green-500/5 border border-green-500/10 flex items-center justify-center">
                    <ShieldCheck className="h-12 w-12 text-green-500/50" />
                </div>
                <div className="space-y-1">
                    <p className="font-black uppercase tracking-[0.2em] text-foreground">Supply Chain Nominal</p>
                    <p className="text-xs">All SKU parameters are within verified technical thresholds.</p>
                </div>
            </div>
        )}

        <div className="p-6 bg-muted/10 border-t flex justify-center no-print">
            <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-widest gap-2 opacity-50 hover:opacity-100 transition-opacity">
                Export Procurement List <ArrowRight className="h-3 w-3" />
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryReport;
