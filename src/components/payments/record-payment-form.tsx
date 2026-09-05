'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Invoice } from '@/types/invoice';
import { Banknote, Smartphone, Wallet, CreditCard, Hash, DollarSign, Receipt, Loader2 } from 'lucide-react';
import { recordPaymentTransaction } from '@/services/payments-service';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { SearchableSelect } from '@/components/shared/searchable-select';

export const paymentFormSchema = z.object({
  invoiceId: z.string().min(1, { message: "Target invoice is required" }),
  customerId: z.string().min(1, { message: "Customer mapping required" }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive value" }),
  method: z.enum(['Cash', 'Mobile Money', 'Bank Transfer', 'Card', 'Credit']),
  transactionRef: z.string().optional(),
});

interface RecordPaymentFormProps {
    onSubmit: () => void;
    invoices: Invoice[];
    isSubmitting?: boolean;
}

/**
 * @fileOverview Technical enrollment form for financial settlements.
 * Synchronizes with the atomic recordPaymentTransaction service.
 */
export function RecordPaymentForm({ onSubmit, invoices, isSubmitting: externalIsSubmitting }: RecordPaymentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);

  const isSubmitting = externalIsSubmitting || internalIsSubmitting;

  const invoiceOptions = useMemo(() => invoices.map(invoice => {
    const id = invoice.invoiceId || (invoice as any).id;
    return {
      value: id,
      label: invoice.invoiceNumber || id.slice(-6),
      description: `Balance: ${invoice.balance.toLocaleString()} Ush`,
    };
  }), [invoices]);

  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      invoiceId: invoices.length === 1 ? (invoices[0].invoiceId || (invoices[0] as any).id) : '',
      customerId: invoices.length === 1 ? invoices[0].customerId : '',
      amount: invoices.length === 1 ? invoices[0].balance : 0,
      method: 'Cash',
      transactionRef: '',
    },
  });

  const handleInvoiceChange = (id: string) => {
      const invoice = invoices.find(i => (i.invoiceId === id || (i as any).id === id));
      if (invoice) {
          form.setValue('invoiceId', id);
          form.setValue('customerId', invoice.customerId);
          form.setValue('amount', invoice.balance);
      }
  };

  const handleFormSubmit = async (data: z.infer<typeof paymentFormSchema>) => {
    if (!user) return;
    
    setInternalIsSubmitting(true);
    try {
        await recordPaymentTransaction({
            invoiceId: data.invoiceId,
            customerId: data.customerId,
            amount: data.amount,
            method: data.method,
            transactionRef: data.transactionRef,
        }, user.userId);
        
        toast({ title: "Settlement Synchronized", description: "Ledger updated and certified receipt generated." });
        onSubmit();
    } catch (error: any) {
        toast({ variant: "destructive", title: "Settlement Failed", description: error.message || "Registry synchronization error." });
    } finally {
        setInternalIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex min-h-0 flex-1 flex-col">
        <DialogBody>
          <div className="space-y-6 px-6 pb-6 pt-2">
        <FormField
          control={form.control}
          name="invoiceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Receipt className="h-3 w-3" /> Settlement Target
              </FormLabel>
              <FormControl>
                <SearchableSelect
                  options={invoiceOptions}
                  value={field.value}
                  onValueChange={handleInvoiceChange}
                  placeholder={invoices.length === 0 ? 'No outstanding balances' : 'Select active invoice balance...'}
                  searchPlaceholder="Search invoice number or balance..."
                  emptyText="No matching invoice found."
                  disabled={invoices.length <= 1}
                  className="h-11 bg-muted/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <DollarSign className="h-3 w-3" /> Amount (Ush)
                        </FormLabel>
                        <FormControl>
                            <Input type="number" step="1000" {...field} className="rounded-xl h-11 bg-muted/50 dark:bg-muted/10 border-none font-black text-primary" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Wallet className="h-3 w-3" /> Method
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger className="rounded-xl h-11 bg-muted/50 dark:bg-muted/10 border-none font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-border/50">
                                <SelectItem value="Cash" className="text-[10px] font-bold uppercase"><span className="flex items-center gap-2"><Banknote className="h-3.5 w-3.5" /> Cash</span></SelectItem>
                                <SelectItem value="Mobile Money" className="text-[10px] font-bold uppercase"><span className="flex items-center gap-2"><Smartphone className="h-3.5 w-3.5" /> Digital</span></SelectItem>
                                <SelectItem value="Bank Transfer" className="text-[10px] font-bold uppercase"><span className="flex items-center gap-2"><Wallet className="h-3.5 w-3.5" /> Transfer</span></SelectItem>
                                <SelectItem value="Card" className="text-[10px] font-bold uppercase"><span className="flex items-center gap-2"><CreditCard className="h-3.5 w-3.5" /> Card</span></SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <FormField
          control={form.control}
          name="transactionRef"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Hash className="h-3 w-3" /> Technical Ref / TXN ID
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. MTN-9988-776, BANK-REF, etc." {...field} className="rounded-xl h-11 bg-muted/50 dark:bg-muted/10 border-none font-mono text-[10px] uppercase font-bold" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          </div>
        </DialogBody>

        <DialogFooter className="p-6 border-t">
          <Button type="submit" className="w-full h-14 font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 rounded-2xl text-[11px] transition-all hover:scale-[1.01]" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Authorize & Finalize Collection'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
