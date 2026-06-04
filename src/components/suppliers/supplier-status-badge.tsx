import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SupplierStatusBadgeProps {
  status: 'Active' | 'Inactive';
  className?: string;
}

export const SupplierStatusBadge: React.FC<SupplierStatusBadgeProps> = ({ status, className }) => {
  const statusStyles = {
    Active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200',
    Inactive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-sm',
        statusStyles[status],
        className
      )}
    >
      {status}
    </Badge>
  );
};
