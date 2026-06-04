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
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  description: z.string().min(1, 'Task description is required'),
  estimatedHours: z.coerce.number().min(0, 'Estimated hours must be positive'),
});

export type TaskFormData = z.infer<typeof formSchema>;

interface JobTaskFormProps {
  onSubmit: (data: TaskFormData) => void;
}

export function JobTaskForm({ onSubmit }: JobTaskFormProps) {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { description: '', estimatedHours: 0 },
  });

  return (
    <Form {...form}>
        <h2 className="text-xl font-semibold mb-2">Add Task</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Task Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Replace spark plugs" {...field} className="h-11 rounded-xl bg-muted/50 border-none font-bold" />
              </FormControl>
              <FormMessage className="text-[10px] font-bold uppercase" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="estimatedHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estimated Hours</FormLabel>
              <FormControl>
                <Input type="number" {...field} className="h-11 rounded-xl bg-muted/50 border-none font-black text-primary" />
              </FormControl>
              <FormMessage className="text-[10px] font-bold uppercase" />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-12 font-black uppercase tracking-widest rounded-xl">Add Task</Button>
      </form>
    </Form>
  );
}
