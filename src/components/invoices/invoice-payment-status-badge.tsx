import { Badge } from '@/components/ui/badge';

interface InvoicePaymentStatusBadgeProps {
  status: 'Paid' | 'Unpaid' | 'Overdue';
}

export function InvoicePaymentStatusBadge({ status }: InvoicePaymentStatusBadgeProps) {
    let variant: 'default' | 'secondary' | 'destructive' = 'secondary';
    if (status === 'Paid') variant = 'default';
    if (status === 'Overdue') variant = 'destructive';

  return <Badge variant={variant}>{status}</Badge>;
}
