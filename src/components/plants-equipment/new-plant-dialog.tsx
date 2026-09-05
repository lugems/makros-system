'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogBody, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Hammer, User, Tag, Hash, Calendar, Loader2, Gauge, Fuel, Binary, MapPin } from 'lucide-react';
import { registerPlant } from '@/services/plants-service';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Customer } from '@/types/customer';
import { SearchableSelect } from '@/components/shared/searchable-select';
import { Separator } from '@/components/ui/separator';

const plantSchema = z.object({
  ownerId: z.string().min(1, "Owner is required"),
  name: z.string().min(1, "Equipment name is required"),
  category: z.string().min(1, "Category is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  yearOfManufacture: z.string().min(1, "Year is required"),
  assetId: z.string().min(1, "Asset ID is required"),
  meterType: z.enum(['Hour Meter', 'Odometer - KM', 'Odometer - Miles', 'Cycle Counter', 'None']),
  meterReading: z.coerce.number().min(0),
  powerType: z.string().min(1, "Power type is required"),
  engineNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  location: z.string().optional(),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Poor', 'Non-operational']),
  status: z.enum(['Active', 'Under Repair', 'Under Maintenance', 'Out of Service', 'Decommissioned']),
  notes: z.string().optional(),
});

type PlantFormData = z.infer<typeof plantSchema>;

interface NewPlantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
}

export function NewPlantDialog({ isOpen, onClose, customers }: NewPlantDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PlantFormData>({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      ownerId: '',
      name: '',
      category: 'Excavator',
      make: '',
      model: '',
      serialNumber: '',
      yearOfManufacture: new Date().getFullYear().toString(),
      assetId: '',
      meterType: 'Hour Meter',
      meterReading: 0,
      powerType: 'Diesel',
      engineNumber: '',
      manufacturer: '',
      location: '',
      condition: 'Good',
      status: 'Active',
      notes: ''
    }
  });

  const onSubmit = async (data: PlantFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await registerPlant(data as any, user.userId);
      toast({ title: "Asset Enrolled", description: `${data.name} initialized in technical registry.` });
      form.reset();
      onClose();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Enrollment Failed", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const customerOptions = customers.map(c => ({
      value: c.customerId,
      label: c.fullName,
      description: c.phone
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[92dvh] flex-col overflow-hidden p-0 sm:max-w-[700px] border-border/50">
        <DialogHeader className="px-8 pt-8 pb-4 text-left border-b bg-muted/30">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                    <Hammer className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">Plant Enrollment</DialogTitle>
                    <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1.5">Initialize a new technical machinery dossier.</DialogDescription>
                </div>
            </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <DialogBody>
              <div className="space-y-8 px-8 py-6">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="ownerId"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <User className="h-3 w-3 text-primary" /> Equipment Owner
                                </FormLabel>
                                <SearchableSelect 
                                    options={customerOptions}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Identify client authority..."
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator className="opacity-50" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Equipment Name</FormLabel>
                                <FormControl><Input placeholder="e.g. Caterpillar Excavator" {...field} className="h-11 bg-muted/20 border-none rounded-xl font-bold" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Technical Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger className="h-11 bg-muted/20 border-none rounded-xl font-bold"><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {['Excavator', 'Bulldozer', 'Grader', 'Loader', 'Forklift', 'Crane', 'Tractor', 'Generator', 'Compressor', 'Welding Equipment', 'Hydraulic Equipment', 'Pump', 'Workshop Machine', 'Other'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="make"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Make</FormLabel>
                                <FormControl><Input {...field} className="h-11 bg-muted/20 border-none rounded-xl font-bold" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Model</FormLabel>
                                <FormControl><Input {...field} className="h-11 bg-muted/20 border-none rounded-xl font-bold" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="yearOfManufacture"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Year</FormLabel>
                                <FormControl><Input type="number" {...field} className="h-11 bg-muted/20 border-none rounded-xl font-bold" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6 bg-primary/5 p-6 rounded-3xl border border-primary/10">
                    <FormField
                        control={form.control}
                        name="assetId"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Hash className="h-3 w-3" /> Asset / Fleet ID
                                </FormLabel>
                                <FormControl><Input placeholder="Internal Ref..." {...field} className="h-11 bg-background border-none rounded-xl font-black uppercase tracking-tighter" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="serialNumber"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Binary className="h-3 w-3" /> Serial Number
                                </FormLabel>
                                <FormControl><Input placeholder="VIN equivalent..." {...field} className="h-11 bg-background border-none rounded-xl font-black uppercase" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="meterType"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Telemetry Protocol</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger className="h-11 bg-muted/20 border-none rounded-xl font-bold"><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {['Hour Meter', 'Odometer - KM', 'Odometer - Miles', 'Cycle Counter', 'None'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="meterReading"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Gauge className="h-3 w-3 text-primary" /> Current Reading
                                </FormLabel>
                                <FormControl><Input type="number" step="any" {...field} className="h-11 bg-muted/20 border-none rounded-xl font-black text-primary" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="powerType"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Fuel className="h-3 w-3 text-primary" /> Power Configuration
                                </FormLabel>
                                <FormControl><Input placeholder="e.g. Diesel, Electric" {...field} className="h-11 bg-muted/20 border-none rounded-xl font-bold" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <MapPin className="h-3 w-3 text-primary" /> Primary Location
                                </FormLabel>
                                <FormControl><Input placeholder="Project site or branch..." {...field} className="h-11 bg-muted/20 border-none rounded-xl font-bold" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Technical Remarks</Label>
                    <Textarea 
                        placeholder="Enrollment notes, damaged components, or specific service requirements..." 
                        {...form.register('notes')}
                        className="min-h-[100px] rounded-2xl bg-muted/20 border-none resize-none p-4 text-sm font-medium" 
                    />
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="p-8 border-t bg-muted/10">
                <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-14 font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
                >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : (
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5" />
                        <span>Complete Technical Enrollment</span>
                      </div>
                    )}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ShieldCheck({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
