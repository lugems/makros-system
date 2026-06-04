
'use client';

import React, { useState } from 'react';
import { Invoice } from '@/types/invoice';
import { Payment } from '@/types/payment';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { RecordPaymentForm } from './record-payment-form';
import { recordPaymentTransaction } from '@/services/payments-service';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

interface RecordPaymentDialogProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordPayment?: (payment: Payment) => void;
}

export default function RecordPaymentDialog({ invoice, isOpen, onClose, onRecordPayment }: RecordPaymentDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!invoice) return null;

  const handleRecordPayment = async (data: any) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
        const result = await recordPaymentTransaction({
            invoiceId: invoice.invoiceId,
            customerId: invoice.customerId,
            amount: data.amount,
            method: data.method,
            transactionRef: data.transactionRef,
        }, user.userId);
        
        toast({ title: "Settlement Synchronized", description: "Ledger updated and certified receipt generated." });
        if (onRecordPayment && result) onRecordPayment(result as unknown as Payment);
        onClose();
    } catch (error: any) {
        toast({ variant: "destructive", title: "Settlement Failed", description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[480px] border-border/50">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">Collection Entry</DialogTitle>
          <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Record a settlement for Invoice #{invoice.invoiceNumber || invoice.invoiceId.slice(-6)}</DialogDescription>
        </DialogHeader>
        <RecordPaymentForm 
            onSubmit={handleRecordPayment}
            invoices={[invoice]}
            isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
