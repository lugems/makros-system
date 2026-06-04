'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { registerVehicle } from '@/services/vehicles-service';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Car, User, Hash, Calendar as CalendarIcon, FileText, Loader2, Gauge, Fuel } from 'lucide-react';
import { Customer } from '@/types/customer';

const vehicleFormSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  numberPlate: z.string().min(1, "License plate is required"),
  vin: z.string().optional(),
  mileage: z.coerce.number().min(0, "Mileage cannot be negative"),
  fuelLevel: z.string().min(1, "Fuel configuration required"),
  customerId: z.string().min(1, "Owner selection is required"),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

const FUEL_LEVELS = [
    "Empty",
    "Reserve",
    "Quarter Tank",
    "Half Tank",
    "Three-Quarter Tank",
    "Full Tank"
];

interface NewVehicleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewVehicleDialog({ isOpen, onClose }: NewVehicleDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const db = useFirestore();
  
  const customersQuery = useMemo(() => query(collection(db, 'customers'), orderBy('fullName', 'asc')) as any, [db]);
  const { data: customers } = useCollection<Customer>(customersQuery);
  
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      numberPlate: '',
      vin: '',
      mileage: 0,
      fuelLevel: 'Half Tank',
      customerId: '',
      status: 'Active',
    },
  });

  const onSubmit = async (data: VehicleFormValues) => {
    if (!user) return;
    
    try {
        await registerVehicle({ ...data, year: String(data.year) }, user.userId);
        toast({ title: "Asset Registered", description: `${data.make} ${data.model} added to fleet.` });
        onClose();
        form.reset();
    } catch (error: any) {
        toast({ variant: "destructive", title: "Registration Failed", description: error.message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[500px] border-border/50">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">New Vehicle Enrollment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <DialogBody>
              <div className="space-y-5 px-6 pb-6 pt-2">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                        <User className="h-3 w-3 text-primary" /> Vehicle Owner
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/50 border-none rounded-xl h-11">
                            <SelectValue placeholder="Search client database..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          {customers?.map((c) => (
                            <SelectItem key={c.customerId || (c as any).id} value={c.customerId || (c as any).id} className="font-bold uppercase text-xs">
                              {c.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest">Brand / Make</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Toyota" {...field} className="bg-muted/50 border-none rounded-xl h-11 font-bold" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest">Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Camry" {...field} className="bg-muted/50 border-none rounded-xl h-11 font-bold" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="numberPlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <Hash className="h-3 w-3" /> License Plate
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="UAB 123X" {...field} className="bg-muted/50 border-none rounded-xl h-11 font-mono font-black uppercase" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3" /> Year
                        </FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="bg-muted/50 border-none rounded-xl h-11 font-bold" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Telemetry Integration */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <Gauge className="h-3 w-3 text-primary" /> Odometer (KM)
                        </FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="bg-muted/50 border-none rounded-xl h-11 font-black text-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fuelLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <Fuel className="h-3 w-3 text-primary" /> Fuel Config
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger className="bg-muted/50 border-none rounded-xl h-11">
                                    <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-border/50">
                                {FUEL_LEVELS.map(level => (
                                    <SelectItem key={level} value={level} className="text-xs font-bold uppercase">{level}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <FileText className="h-3 w-3" /> VIN / Chassis Number
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="17-digit identification code" {...field} className="bg-muted/50 border-none rounded-xl h-11 font-mono uppercase text-xs" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </DialogBody>

            <DialogFooter className="p-6 border-t">
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
              >
                {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Complete Technical Enrollment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
