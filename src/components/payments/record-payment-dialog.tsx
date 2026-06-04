'use client';

import React from 'react';
import { Invoice } from '@/types/invoice';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { RecordPaymentForm } from './record-payment-form';

interface RecordPaymentDialogProps {
  invoice?: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
}

export function RecordPaymentDialog({ invoice, isOpen, onClose, invoices }: RecordPaymentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[480px] border-border/50">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">Collection Entry</DialogTitle>
          <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Synchronize a new financial settlement with the workshop ledger.</DialogDescription>
        </DialogHeader>
        <RecordPaymentForm 
            onSubmit={onClose}
            invoices={invoice ? [invoice] : invoices}
        />
      </DialogContent>
    </Dialog>
  );
}
