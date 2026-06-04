'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Invoice } from '@/types/invoice';
import useMakrosStore from '@/store/makros-store';
import PaymentStatusBadge from './payment-status-badge';
import { CurrencyFormat } from '@/components/shared/currency-format';
import { FormattedDate } from '@/components/shared/formatted-date';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface InvoiceCardProps {
  invoice: Invoice;
  onViewDetails: (invoice: Invoice) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onViewDetails }) => {
  const { customers, vehicles } = useMakrosStore();
  const customer = customers.find(c => c.customerId === invoice.customerId);
  const vehicle = vehicles.find(v => v.customerId === invoice.customerId);

  return (
    <Card 
        onClick={() => onViewDetails(invoice)}
        className="cursor-pointer hover:border-primary/50 transition-colors"
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
            <div className="space-y-1">
                <CardTitle className="text-base font-bold">
                    {invoice.invoiceNumber || `INV-${invoice.invoiceId.slice(-6)}`}
                </CardTitle>
                <p className="text-sm font-medium">{customer?.fullName || 'Unknown Customer'}</p>
                <p className="text-xs text-muted-foreground">
                    {vehicle?.make} {vehicle?.model} • {vehicle?.numberPlate}
                </p>
            </div>
            <PaymentStatusBadge status={invoice.paymentStatus} />
        </div>
      </CardHeader>
      <CardContent className="flex justify-between items-center pt-2">
        <div>
            <p className="text-lg font-bold text-primary">
                <CurrencyFormat value={invoice.grandTotal} />
            </p>
            <p className="text-xs text-muted-foreground">
                Issued: <FormattedDate date={invoice.issuedAt} formatString="dd MMM yyyy" />
            </p>
        </div>
        <Button variant="ghost" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            View
        </Button>
      </CardContent>
    </Card>
  );
};

export default InvoiceCard;
