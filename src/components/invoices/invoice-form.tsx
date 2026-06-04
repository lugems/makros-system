'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogBody, DialogFooter } from '@/components/ui/dialog';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { JobCard, JobCardStatus } from '@/types/job-card';
import { Customer } from '@/types/customer';
import { User, ClipboardCheck, Calendar, FileText, Loader2 } from 'lucide-react';

const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  jobCardId: z.string().min(1, "Job card is required"),
  issuedAt: z.string(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormValues) => void;
  initialData?: Partial<InvoiceFormValues>;
}

const InvoiceForm = ({ onSubmit, initialData }: InvoiceFormProps) => {
  const db = useFirestore();
  
  const customersQuery = useMemo(() => query(collection(db, 'customers'), orderBy('fullName', 'asc')) as any, [db]);
  const jobCardsQuery = useMemo(() => query(
    collection(db, 'jobCards'), 
    where('status', 'in', [JobCardStatus.Completed, JobCardStatus.QualityCheck])
  ) as any, [db]);

  const { data: customers } = useCollection<Customer>(customersQuery);
  const { data: jobCards } = useCollection<JobCard>(jobCardsQuery);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData || {
        customerId: '', 
        jobCardId: '', 
        issuedAt: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
        <DialogBody>
          <div className="space-y-6 px-6 pb-6 pt-2">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <User className="h-3 w-3 text-primary" /> Customer Identity
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-bold">
                        <SelectValue placeholder="Identify client..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border/50">
                      {customers?.map(customer => (
                        <SelectItem key={customer.customerId} value={customer.customerId} className="font-bold uppercase text-xs">
                          {customer.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px] font-bold uppercase" />
                </FormItem>
              )}
            />
        
            <FormField
              control={form.control}
              name="jobCardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <ClipboardCheck className="h-3 w-3 text-primary" /> Completed bay Load
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-bold">
                        <SelectValue placeholder="Select a completed job card" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border/50">
                      {jobCards?.map(jobCard => (
                        <SelectItem key={jobCard.jobCardId} value={jobCard.jobCardId} className="font-bold uppercase text-xs">
                          Job #{jobCard.jobCardId.slice(-6).toUpperCase()} — {jobCard.reportedIssue.slice(0, 30)}...
                        </SelectItem>
                      ))}
                      {(!jobCards || jobCards.length === 0) && (
                        <SelectItem value="none" disabled className="italic">No unbilled completed jobs found.</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px] font-bold uppercase" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issuedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-indigo-500" /> Issued Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-12 rounded-xl bg-muted/50 border-none font-bold text-center" />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold uppercase" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-indigo-500" /> Due Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-12 rounded-xl bg-muted/50 border-none font-bold text-center" />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold uppercase" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <FileText className="h-3 w-3 text-primary" /> Invoice Notes
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. Terms and conditions, payment instructions..." {...field} className="bg-muted/50 border-none resize-none min-h-[100px] rounded-2xl p-4 text-sm font-medium" />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold uppercase" />
                </FormItem>
              )}
            />
          </div>
        </DialogBody>

        <DialogFooter className="p-6 border-t">
          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]">
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Create Invoice Record'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default InvoiceForm;
