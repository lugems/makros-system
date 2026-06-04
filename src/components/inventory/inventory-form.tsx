'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Package, Hash, Truck, Banknote, AlertTriangle, Layers, Tag, Activity, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

const inventoryFormSchema = z.object({
  itemName: z.string().min(1, 'Technical name is required'),
  category: z.string().min(1, 'Category selection is required'),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  reorderLevel: z.coerce.number().min(0, 'Threshold cannot be negative'),
  purchasePrice: z.coerce.number().min(0, 'Cost price cannot be negative'),
  sellingPrice: z.coerce.number().min(0, 'Retail price cannot be negative'),
  supplierId: z.string(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

export type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

interface InventoryFormProps {
  onSubmit: (data: InventoryFormValues) => void;
  item?: Partial<InventoryFormValues>;
}

const CATEGORIES = [
    "Engine Parts",
    "Braking System",
    "Suspension & Steering",
    "Electrical & Lighting",
    "Body & Trim",
    "Fluids & Lubricants",
    "Filters",
    "Tyres & Wheels",
    "Battery & Power",
    "General Hardware"
];

export function InventoryForm({ onSubmit, item }: InventoryFormProps) {
  const db = useFirestore();
  const suppliersQuery = useMemoFirebase(() => query(collection(db, 'suppliers'), orderBy('supplierName', 'asc')), [db]);
  const { data: suppliers, loading: sLoading, error: sError } = useCollection<any>(suppliersQuery);

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      itemName: item?.itemName || '',
      category: item?.category || '',
      quantity: item?.quantity || 0,
      reorderLevel: item?.reorderLevel || 5,
      purchasePrice: item?.purchasePrice || 0,
      sellingPrice: item?.sellingPrice || 0,
      supplierId: item?.supplierId || '',
      status: item?.status || 'Active',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
        <DialogBody>
          <div className="space-y-5 px-6 pb-6 pt-2">
        <FormField
          control={form.control}
          name="itemName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                <Package className="h-3 w-3 text-primary" /> SKU Description
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. Full Synthetic Oil 5W-30" {...field} className="rounded-xl h-11 bg-muted/50 dark:bg-muted/10 border-none font-bold" />
              </FormControl>
              <FormMessage className="text-[10px] font-bold uppercase" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-3 w-3 text-primary" /> Technical Category
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none font-bold">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-border/50">
                    {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat} className="text-xs font-bold uppercase">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                  <Activity className="h-3 w-3 text-primary" /> Registry Status
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none font-black text-primary">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-border/50">
                    <SelectItem value="Active" className="text-xs font-bold uppercase">Active SKU</SelectItem>
                    <SelectItem value="Inactive" className="text-xs font-bold uppercase">Decommissioned</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                    <Layers className="h-3 w-3 text-primary" /> In-Stock Units
                </FormLabel>
                <FormControl>
                  <Input type="number" {...field} className="h-11 rounded-xl bg-muted/50 border-none font-black text-primary" />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reorderLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-3 w-3 text-orange-500" /> Alert Threshold
                </FormLabel>
                <FormControl>
                  <Input type="number" {...field} className="h-11 rounded-xl bg-muted/50 border-none font-black text-orange-600" />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                    <Banknote className="h-3 w-3 text-green-500" /> Unit Cost (Ush)
                </FormLabel>
                <FormControl>
                  <Input type="number" {...field} className="h-11 rounded-xl bg-muted/50 border-none font-bold" />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sellingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-3 w-3 text-indigo-500" /> Retail Rate (Ush)
                </FormLabel>
                <FormControl>
                  <Input type="number" {...field} className="h-11 rounded-xl bg-muted/50 border-none font-black text-primary" />
                </FormControl>
                <FormMessage className="text-[10px] font-bold uppercase" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                <Truck className="h-3 w-3 text-primary" /> Vendor Authority
              </FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none font-bold">
                    {sLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <SelectValue placeholder={sError ? "Technical Stream Error" : "Identify Vendor..."} />}
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50">
                    {suppliers?.filter(s => s.status === 'Active' || s.supplierId === item?.supplierId || s.id === item?.supplierId).map(s => (
                      <SelectItem key={s.id} value={s.supplierId || s.id} className="font-bold text-xs uppercase">
                        {s.supplierName} {s.status === 'Inactive' ? '(Decommissioned)' : ''}
                      </SelectItem>
                    ))}
                    {(!suppliers || suppliers.length === 0) && !sLoading && (
                        <SelectItem value="GENERAL_VENDOR" className="font-bold text-xs uppercase italic text-muted-foreground">General / External Vendor</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage className="text-[10px] font-bold uppercase" />
            </FormItem>
          )}
        />
          </div>
        </DialogBody>

        <DialogFooter className="p-6 border-t">
          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]">
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (item ? 'Synchronize Record' : 'Enroll SKU in Catalog')}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
