'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { updateVehicle } from '@/services/vehicles-service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { Vehicle } from '@/types/vehicle';
import { Customer } from '@/types/customer';
import { Car, User, Hash, Calendar as CalendarIcon, FileText, Loader2, Gauge, Fuel } from 'lucide-react';

const vehicleFormSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  numberPlate: z.string().min(1, "License plate is required"),
  vin: z.string().optional(),
  mileage: z.coerce.number().min(0, "Mileage cannot be negative"),
  fuelLevel: z.string().min(1, "Fuel configuration required"),
  customerId: z.string().min(1, "Owner selection is required"),
  status: z.enum(['Active', 'Inactive']),
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

interface EditVehicleDialogProps {
  vehicle: Vehicle;
  customers: Customer[];
  isOpen: boolean;
  onClose: () => void;
}

export function EditVehicleDialog({ vehicle, customers, isOpen, onClose }: EditVehicleDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year ? Number(vehicle.year) : new Date().getFullYear(),
      numberPlate: vehicle.numberPlate,
      vin: vehicle.vin || '',
      mileage: vehicle.mileage || 0,
      fuelLevel: vehicle.fuelLevel || 'Half Tank',
      customerId: vehicle.customerId,
      status: vehicle.status as 'Active' | 'Inactive',
    },
  });

  useEffect(() => {
    if (isOpen && vehicle) {
      form.reset({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year ? Number(vehicle.year) : new Date().getFullYear(),
        numberPlate: vehicle.numberPlate,
        vin: vehicle.vin || '',
        mileage: vehicle.mileage || 0,
        fuelLevel: vehicle.fuelLevel || 'Half Tank',
        customerId: vehicle.customerId,
        status: vehicle.status as 'Active' | 'Inactive',
      });
    }
  }, [vehicle, isOpen, form]);

  async function onSubmit(data: VehicleFormValues) {
    try {
      await updateVehicle(vehicle.vehicleId, { ...data, year: String(data.year) }, user?.userId || '');
      toast({ title: "Success", description: "Vehicle updated successfully" });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update vehicle", variant: "destructive" });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[500px] border-border/50">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">Technical Data Update</DialogTitle>
          <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Synchronize registry record for Asset #{vehicle.vehicleId.slice(-6).toUpperCase()}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <DialogBody>
              <div className="space-y-5 px-6 pb-6 pt-2">
                
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <User className="h-3 w-3 text-primary" /> Owner Authority
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 bg-muted/50 border-none rounded-xl font-bold">
                            <SelectValue placeholder="Select an owner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-border/50">
                          {customers.map((customer) => (
                            <SelectItem key={customer.customerId || (customer as any).id} value={customer.customerId || (customer as any).id} className="font-bold text-xs uppercase">
                              {customer.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest">Make</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Car className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input {...field} className="pl-9 h-11 bg-muted/50 border-none rounded-xl font-bold" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest">Model</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 bg-muted/50 border-none rounded-xl font-bold" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3" /> Year
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type="number" className="pl-9 h-11 bg-muted/50 border-none rounded-xl font-bold" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numberPlate"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <Hash className="h-3 w-3" /> Plate
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input {...field} className="pl-9 h-11 bg-muted/50 border-none rounded-xl font-mono font-black uppercase" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="mileage"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                          <Gauge className="h-3 w-3 text-primary" /> Odometer (KM)
                        </FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="h-11 bg-muted/50 border-none rounded-xl font-black text-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fuelLevel"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                          <Fuel className="h-3 w-3 text-primary" /> Fuel Config
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger className="h-11 bg-muted/50 border-none rounded-xl">
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                    control={form.control}
                    name="vin"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-3 w-3" /> VIN
                        </FormLabel>
                        <FormControl>
                            <Input {...field} className="h-11 bg-muted/50 border-none rounded-xl font-mono text-[10px] uppercase" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registry Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger className="h-11 bg-muted/50 border-none rounded-xl font-black text-primary">
                                <SelectValue />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Active" className="font-bold text-xs uppercase">Active Duty</SelectItem>
                            <SelectItem value="Inactive" className="font-bold text-xs uppercase">Decommissioned</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="p-6 border-t">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose} 
                className="w-full sm:w-auto h-11 font-black uppercase tracking-widest text-[10px]"
              >
                Discard Changes
              </Button>
              <Button type="submit" className="w-full sm:w-auto h-11 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Commit Synchronization
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}