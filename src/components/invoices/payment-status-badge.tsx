'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PaymentStatus } from '@/types/invoice';

interface PaymentStatusBadgeProps {
    status: PaymentStatus;
    className?: string;
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, className }) => {
    const statusColors: Record<PaymentStatus, string> = {
        Paid: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50',
        Unpaid: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50',
        'Partially Paid': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
        Overdue: 'bg-destructive/10 text-destructive border-destructive/20',
        Cancelled: 'bg-slate-500/10 text-slate-500 border-slate-200 dark:border-slate-800',
    };

    return (
        <Badge variant="outline" className={cn(
            'capitalize font-black text-[9px] tracking-[0.2em] px-3 py-1 rounded-md shadow-sm border',
            statusColors[status] || 'bg-muted text-muted-foreground',
            className
        )}>
            {status}
        </Badge>
    );
};

export default PaymentStatusBadge;
