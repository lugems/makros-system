
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Supplier } from '@/types/supplier';
import { User, Phone, Mail, MapPin, Activity, Loader2 } from 'lucide-react';

const supplierSchema = z.object({
  supplierName: z.string().min(1, 'Business name is required'),
  phone: z.string().min(1, 'Contact number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  status: z.enum(['Active', 'Inactive']),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  onSubmit: (data: SupplierFormData) => void;
  supplier?: Supplier | null;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({ onSubmit, supplier }) => {
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      supplierName: supplier?.supplierName || '',
      phone: supplier?.phone || '',
      email: supplier?.email || '',
      address: supplier?.address || '',
      status: supplier?.status || 'Active',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
        <DialogBody>
          <div className="space-y-5 px-6 pb-6 pt-2">
        <FormField
          control={form.control}
          name="supplierName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <User className="h-3 w-3 text-primary" /> Legal Entity Name
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. Kampala Auto Spares" {...field} className="h-11 rounded-xl bg-muted/50 border-none font-bold" />
              </FormControl>
              <FormMessage className="text-[10px] font-bold uppercase" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3 w-3 text-primary" /> Contact Phone
                </FormLabel>
                <FormControl>
                  <Input placeholder="+256 700 000 000" {...field} className="h-11 rounded-xl bg-muted/50 border-none font-bold" />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3 w-3 text-primary" /> Electronic Mail
                </FormLabel>
                <FormControl>
                  <Input placeholder="sales@vendor.ug" {...field} className="h-11 rounded-xl bg-muted/50 border-none font-bold" />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3 w-3 text-primary" /> Physical Distribution Center
              </FormLabel>
              <FormControl>
                <Input placeholder="Market, Street, District" {...field} className="h-11 rounded-xl bg-muted/50 border-none font-medium" />
              </FormControl>
              <FormMessage className="text-[10px] font-bold uppercase" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity className="h-3 w-3 text-primary" /> Registry Status
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none font-black text-primary">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/50">
                  <SelectItem value="Active" className="text-xs font-bold uppercase">Active Partnership</SelectItem>
                  <SelectItem value="Inactive" className="text-xs font-bold uppercase">Out of Service</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-[10px] font-bold uppercase" />
            </FormItem>
          )}
        />
          </div>
        </DialogBody>

        <DialogFooter className="p-6 border-t">
          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]">
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (supplier ? 'Synchronize Partner Record' : 'Enroll New Vendor')}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
