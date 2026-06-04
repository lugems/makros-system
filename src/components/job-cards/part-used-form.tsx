'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { InventoryItem } from '@/types/inventory';

const formSchema = z.object({
  inventoryItemId: z.string().min(1, 'Please select an item'),
  quantityUsed: z.coerce.number().min(1, 'Quantity must be at least 1'),
});

export type PartFormData = z.infer<typeof formSchema>;

interface PartUsedFormProps {
  onSubmit: (data: PartFormData) => void;
  inventoryItems: InventoryItem[];
}

export function PartUsedForm({ onSubmit, inventoryItems }: PartUsedFormProps) {
  const form = useForm<PartFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { inventoryItemId: '', quantityUsed: 1 },
  });

  return (
    <Form {...form}>
        <h2 className="text-xl font-semibold mb-2">Add Part Used</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="inventoryItemId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Part Selection</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none font-bold">
                    <SelectValue placeholder="Select a part" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  {inventoryItems.map(item => (
                    <SelectItem key={item.itemId} value={item.itemId} className="text-xs font-bold uppercase">
                      {item.itemName}
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
          name="quantityUsed"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quantity Used</FormLabel>
              <FormControl>
                <Input type="number" {...field} className="h-11 rounded-xl bg-muted/50 border-none font-black text-primary" />
              </FormControl>
              <FormMessage className="text-[10px] font-bold uppercase" />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-12 font-black uppercase tracking-widest rounded-xl">Add Part</Button>
      </form>
    </Form>
  );
}
