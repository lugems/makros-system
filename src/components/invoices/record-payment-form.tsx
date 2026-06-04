'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
import { Banknote, Smartphone, Wallet, CreditCard, Hash, Receipt, Loader2 } from 'lucide-react';

export const paymentFormSchema = z.object({
  invoiceId: z.string().min(1, { message: "Target invoice is required" }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive value" }),
  method: z.enum(['Cash', 'Mobile Money', 'Bank Transfer', 'Card', 'Credit']),
  transactionRef: z.string().optional(),
});

interface RecordPaymentFormProps {
    onSubmit: (data: z.infer<typeof paymentFormSchema>) => void;
    invoices: Invoice[];
    isSubmitting?: boolean;
}

export function RecordPaymentForm({ onSubmit, invoices, isSubmitting }: RecordPaymentFormProps) {
  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      invoiceId: invoices.length === 1 ? invoices[0].invoiceId : '',
      amount: invoices.length === 1 ? invoices[0].balance : 0,
      method: 'Cash',
      transactionRef: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
        <DialogBody>
          <div className="space-y-6 px-6 pb-6 pt-2">
        <FormField
          control={form.control}
          name="invoiceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Receipt className="h-3 w-3 text-primary" /> Settlement Target
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={invoices.length === 1}>
                <FormControl>
                  <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none font-bold">
                    <SelectValue placeholder="Select active invoice balance..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  {invoices.map(invoice => (
                    <SelectItem key={invoice.invoiceId} value={invoice.invoiceId} className="text-[10px] font-bold uppercase tracking-tight">
                      {invoice.invoiceNumber || invoice.invoiceId.slice(-6)} • Bal: {invoice.balance.toLocaleString()} Ush
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-[10px] font-bold uppercase" />
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
                          <Banknote className="h-3 w-3 text-green-500" /> Disbursed (Ush)
                        </FormLabel>
                        <FormControl>
                            <Input type="number" step="1000" {...field} className="h-11 rounded-xl bg-muted/50 border-none font-black text-primary" />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold uppercase" />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Wallet className="h-3 w-3 text-primary" /> Channel
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none font-black text-primary">
                                <SelectValue />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="Cash" className="text-[10px] font-bold uppercase">Cash</SelectItem>
                                <SelectItem value="Mobile Money" className="text-[10px] font-bold uppercase">Digital</SelectItem>
                                <SelectItem value="Bank Transfer" className="text-[10px] font-bold uppercase">Transfer</SelectItem>
                                <SelectItem value="Card" className="text-[10px] font-bold uppercase">Card</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px] font-bold uppercase" />
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
                <Hash className="h-3 w-3 text-primary" /> Technical Ref / TXN ID
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. MTN-9988, BANK-REF, etc." {...field} className="h-11 rounded-xl bg-muted/50 border-none font-mono text-[10px] uppercase font-bold" />
              </FormControl>
              <FormMessage className="text-[10px] font-bold uppercase" />
            </FormItem>
          )}
        />
          </div>
        </DialogBody>

        <DialogFooter className="p-6 border-t">
          <Button type="submit" className="w-full h-14 font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 rounded-2xl text-[11px] transition-all hover:scale-[1.01]" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Authorize & Finalize Collection'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}