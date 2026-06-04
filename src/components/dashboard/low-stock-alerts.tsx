
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Package, AlertCircle, ChevronRight, Fingerprint, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InventoryItem } from '@/types/inventory';

interface LowStockAlertsProps {
  items: InventoryItem[];
}

export const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ items }) => {
  const router = useRouter();

  return (
    <div className="divide-y divide-border/40">
      {items.length > 0 ? items.map((item) => {
        const isCritical = item.quantity === 0;
        
        return (
          <div 
            key={item.itemId} 
            className="flex items-center justify-between p-5 hover:bg-muted/10 transition-colors group cursor-pointer"
            onClick={() => router.push(`/inventory/${item.itemId}`)}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform",
                isCritical ? "bg-red-500/5 border-red-500/10 text-red-600" : "bg-orange-500/5 border-orange-500/10 text-orange-600"
              )}>
                <Package className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-black uppercase tracking-tight group-hover:text-primary transition-colors truncate max-w-[120px]">{item.itemName}</p>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted border border-border/50">
                    <Fingerprint className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase">{item.itemId.slice(-6)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-2.5 w-2.5 opacity-50" />
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                    {isCritical ? 'Critical Stockout' : 'Low Threshold'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className={cn(
                  "text-sm font-black tabular-nums leading-none",
                  isCritical ? "text-red-600" : "text-orange-600"
                )}>{item.quantity}</p>
                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-tighter mt-1">Available</p>
              </div>
              <ChevronRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </div>
          </div>
        );
      }) : (
        <div className="p-10 text-center opacity-30">
          <Package className="h-8 w-8 mx-auto mb-2" />
          <p className="text-[9px] font-black uppercase tracking-widest">Supply Levels Nominal</p>
        </div>
      )}
      <div className="p-4 bg-muted/5 text-center">
        <button 
            onClick={() => router.push('/inventory')}
            className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
        >
          Open Logistics Ledger
        </button>
      </div>
    </div>
  );
};
