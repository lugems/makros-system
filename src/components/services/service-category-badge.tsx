import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ServiceCategory } from '@/types/makros-service';
import { cn } from '@/lib/utils';

interface ServiceCategoryBadgeProps {
  category: ServiceCategory;
  className?: string;
}

const ServiceCategoryBadge: React.FC<ServiceCategoryBadgeProps> = ({ category, className }) => {
  const categoryStyles: Record<ServiceCategory, string> = {
    "General Service": 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50',
    "Diagnostics": 'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-900/50',
    "Engine": 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50',
    "Brakes": 'bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-900/50',
    "Suspension": 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900/50',
    "Tyres": 'bg-pink-500/10 text-pink-600 border-pink-200 dark:border-pink-900/50',
    "Battery": 'bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800',
    "Car Wash": 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-900/50',
    "Body Works": 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900/50',
    "Electrical": 'bg-teal-500/10 text-teal-600 border-teal-200 dark:border-teal-900/50',
    "Other": 'bg-muted text-muted-foreground border-border/50',
  };

  return (
    <Badge 
        variant="outline" 
        className={cn(
            "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm",
            categoryStyles[category] || "bg-muted text-muted-foreground",
            className
        )}
    >
      {category}
    </Badge>
  );
};

export default ServiceCategoryBadge;
