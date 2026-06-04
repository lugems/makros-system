'use client';

import React from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { FormattedDate } from '@/components/shared/formatted-date';
import { ArrowUpRight, ArrowDownRight, Package, History as HistoryIcon, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StockMovement } from '@/types/inventory';

/**
 * @fileOverview Technical Stock Ledger Trace.
 * Fetches real-time movement records from the stockMovements registry.
 */
export function StockMovementList() {
  const db = useFirestore();

  // Stabilized trace query
  const movementsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'stockMovements'), orderBy('date', 'desc'), limit(20));
  }, [db]);

  const { data: movements, loading } = useCollection<StockMovement>(movementsQuery as any);

  if (loading) {
    return (
      <div className="p-10 space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-12 w-full bg-muted/20 animate-pulse rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {movements && movements.length > 0 ? movements.map((movement) => (
        <div key={movement.movementId || (movement as any).id} className="p-5 flex items-center justify-between hover:bg-muted/10 transition-colors group">
          <div className="flex items-center gap-4">
            <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border transition-all group-hover:scale-110",
                movement.type === 'In' 
                    ? "bg-green-500/10 text-green-600 border-green-500/20" 
                    : "bg-red-500/10 text-red-600 border-red-200/20"
            )}>
              {movement.type === 'In' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-black uppercase tracking-tight text-foreground line-clamp-1">{movement.itemName}</p>
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                  <Package className="h-2.5 w-2.5" />
                  ID: {movement.itemId.slice(-6).toUpperCase()}
              </div>
              <p className="text-[8px] text-muted-foreground/60 italic line-clamp-1">"{movement.reason}"</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className={cn(
              "text-sm font-black tabular-nums",
              movement.type === 'In' ? 'text-green-600' : 'text-red-600'
            )}>
              {movement.type === 'In' ? '+' : ''}{movement.quantityChange}
            </span>
            <div className="flex items-center justify-end gap-1.5 mt-0.5 text-[9px] text-muted-foreground">
               <HistoryIcon className="h-2.5 w-2.5 opacity-50" />
               <FormattedDate date={movement.date} formatString="dd MMM, HH:mm" />
            </div>
          </div>
        </div>
      )) : (
          <div className="p-10 text-center opacity-30">
              <HistoryIcon className="h-8 w-8 mx-auto mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No Recent Shifts Logged</p>
          </div>
      )}
    </div>
  );
}
