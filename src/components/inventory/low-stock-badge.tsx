import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Package, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LowStockBadgeProps {
  quantity: number;
  lowStockThreshold: number;
}

export function LowStockBadge({ quantity, lowStockThreshold }: LowStockBadgeProps) {
  const isOutOfStock = quantity === 0;
  const isLowStock = quantity > 0 && quantity <= lowStockThreshold;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 flex items-center gap-1.5 shadow-sm rounded-md",
        isOutOfStock 
            ? "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/30" 
            : isLowStock 
                ? "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900/30" 
                : "bg-green-500/10 text-green-600 border-green-200 dark:border-green-900/30"
      )}
    >
      {isOutOfStock ? (
          <>
            <AlertCircle className="h-3 w-3" />
            Stockout
          </>
      ) : isLowStock ? (
          <>
            <AlertCircle className="h-3 w-3" />
            {quantity} Low
          </>
      ) : (
          <>
            <CheckCircle2 className="h-3 w-3" />
            {quantity} Units
          </>
      )}
    </Badge>
  );
}
