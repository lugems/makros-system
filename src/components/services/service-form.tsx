import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MakrosServiceSchema, ServiceCategorySchema, ServiceStatusSchema } from '@/schemas/service-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Wrench, Layers, FileText, Banknote, Clock, Activity } from 'lucide-react';

const ServiceFormSchema = MakrosServiceSchema.omit({ serviceId: true, createdAt: true, updatedAt: true });

type ServiceFormValues = z.infer<typeof ServiceFormSchema>;

interface ServiceFormProps {
  onSubmit: (data: ServiceFormValues) => void;
  initialData?: Partial<ServiceFormValues>;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onSubmit, initialData }) => {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(ServiceFormSchema),
    defaultValues: {
      serviceName: initialData?.serviceName || '',
      category: initialData?.category || 'General Service',
      description: initialData?.description || '',
      defaultLaborCost: initialData?.defaultLaborCost || 0,
      estimatedDuration: initialData?.estimatedDuration || '',
      status: initialData?.status || 'Active',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
        <DialogBody>
          <div className="space-y-6 px-4 sm:px-8 pb-8 pt-4">
            <FormField
              control={form.control}
              name="serviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Wrench className="h-3 w-3 text-primary" /> Service Catalog Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Engine Oil Service" className="h-12 rounded-xl bg-muted/50 dark:bg-muted/10 border-none font-bold text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold uppercase" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Layers className="h-3 w-3 text-primary" /> Technical Category
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl bg-muted/50 dark:bg-muted/10 border-none font-bold">
                        <SelectValue placeholder="Select classification" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border/50">
                      {ServiceCategorySchema.options.map((category) => (
                        <SelectItem key={category} value={category} className="font-bold uppercase text-xs">
                          {category}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <FileText className="h-3 w-3 text-primary" /> Detailed Specifications
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                        placeholder="Describe the technical requirements or standard procedures..." 
                        className="bg-muted/50 dark:bg-muted/10 border-none resize-none min-h-[120px] rounded-2xl p-5 text-sm font-medium leading-relaxed" 
                        {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold uppercase" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="defaultLaborCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Banknote className="h-3 w-3 text-green-500" /> Base Labor Rate (Ush)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 80000" 
                        className="h-12 rounded-xl bg-muted/50 dark:bg-muted/10 border-none font-black text-primary text-base" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold uppercase" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3 text-indigo-500" /> Cycle Time
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2 hours" className="h-12 rounded-xl bg-muted/50 dark:bg-muted/10 border-none font-bold" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold uppercase" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Activity className="h-3 w-3 text-primary" /> Operational Status
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl bg-muted/50 dark:bg-muted/10 border-none font-black text-primary uppercase text-xs tracking-widest">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border/50">
                      {ServiceStatusSchema.options.map((status) => (
                        <SelectItem key={status} value={status} className="font-bold uppercase text-xs">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px] font-bold uppercase" />
                </FormItem>
              )}
            />
          </div>
        </DialogBody>

        <DialogFooter className="px-8 py-6 border-t bg-muted/10">
          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] text-xs">
            {form.formState.isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : (initialData ? 'Commit Sync to Catalog' : 'Enroll Catalog Entry')}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ServiceForm;
