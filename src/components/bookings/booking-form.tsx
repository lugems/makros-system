'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Clock, User, Car, Wrench, UserCheck, Loader2 } from 'lucide-react';
import { Booking, BookingStatus } from '@/types/booking';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { MakrosService } from '@/types/makros-service';
import { StaffMember } from '@/types/staff';

const bookingSchema = z.object({
  customerId: z.string().min(1, "Customer identification is required"),
  vehicleId: z.string().min(1, "Vehicle asset reference is required"),
  serviceId: z.string().min(1, "Service classification required"),
  bookingDate: z.string().min(1, "Temporal schedule required"),
  preferredTime: z.string().min(1, "Intake time window required"),
  status: z.enum(['Pending', 'Confirmed', 'Checked In', 'Completed', 'Cancelled', 'No Show']),
  assignedMechanicId: z.string().optional(),
  notes: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => Promise<void>;
  initialData?: Partial<Booking>;
  isSubmitting?: boolean;
}

/**
 * @fileOverview Technical intake form for scheduling workshop appointments.
 * Resolves context from customers, services, and personnel registries.
 */
export function BookingForm({ onSubmit, initialData, isSubmitting }: BookingFormProps) {
  const db = useFirestore();

  // 1. Technical Context Streams
  const customersQuery = useMemo(() => query(collection(db, 'customers'), orderBy('fullName', 'asc')) as any, [db]);
  const servicesQuery = useMemo(() => query(collection(db, 'services'), where('status', '==', 'Active'), orderBy('serviceName', 'asc')) as any, [db]);
  const usersQuery = useMemo(() => query(collection(db, 'users'), where('role', '==', 'Mechanic'), where('status', '==', 'Active')) as any, [db]);

  const { data: customers } = useCollection<Customer>(customersQuery);
  const { data: services } = useCollection<MakrosService>(servicesQuery);
  const { data: staff } = useCollection<StaffMember>(usersQuery);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
        customerId: initialData?.customerId || '', 
        vehicleId: initialData?.vehicleId || '', 
        serviceId: initialData?.serviceId || '',
        bookingDate: initialData?.bookingDate || new Date().toISOString().split('T')[0],
        preferredTime: initialData?.preferredTime || '09:00',
        status: initialData?.status || 'Pending',
        assignedMechanicId: initialData?.assignedMechanicId || '',
        notes: initialData?.notes || '',
    },
  });

  const selectedCustomerId = form.watch('customerId');

  // 2. Dynamic Asset Stream (Filtered by Customer)
  const vehiclesQuery = useMemo(() => {
    if (!selectedCustomerId) return null;
    return query(collection(db, 'vehicles'), where('customerId', '==', selectedCustomerId)) as any;
  }, [db, selectedCustomerId]);

  const { data: vehicles, loading: vehiclesLoading } = useCollection<Vehicle>(vehiclesQuery);

  // Sync vehicle if current selection is invalid for new customer
  useEffect(() => {
    if (selectedCustomerId && vehicles && !vehicles.find(v => v.vehicleId === form.getValues('vehicleId'))) {
        form.setValue('vehicleId', '');
    }
  }, [selectedCustomerId, vehicles, form]);

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
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
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
        
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                <Car className="h-3 w-3 text-primary" /> Registered Asset
                            </FormLabel>
                            <Select 
                                onValueChange={field.onChange} 
                                value={field.value} 
                                disabled={!selectedCustomerId || vehiclesLoading}
                            >
                                <FormControl>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-bold">
                                        {vehiclesLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <SelectValue placeholder="Select unit..." />}
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-border/50">
                                    {vehicles?.map(v => (
                                        <SelectItem key={v.vehicleId} value={v.vehicleId} className="font-bold uppercase text-xs">
                                            {v.make} {v.model} ({v.numberPlate})
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
                    name="serviceId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                <Wrench className="h-3 w-3 text-primary" /> Catalog Service
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-bold">
                                        <SelectValue placeholder="Select type..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-border/50">
                                    {services?.map((s) => (
                                        <SelectItem key={s.serviceId} value={s.serviceId} className="font-bold uppercase text-xs">
                                            {s.serviceName}
                                        </SelectItem>
                                    ))}
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
                    name="bookingDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                <CalendarIcon className="h-3 w-3 text-indigo-500" /> Intake Date
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
                    name="preferredTime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-3 w-3 text-indigo-500" /> Arrival Time
                            </FormLabel>
                            <FormControl>
                                <Input type="time" {...field} className="h-12 rounded-xl bg-muted/50 border-none font-bold text-center" />
                            </FormControl>
                            <FormMessage className="text-[10px] font-bold uppercase" />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="assignedMechanicId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <UserCheck className="h-3 w-3 text-primary" /> Lead Technician
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-bold">
                                        <SelectValue placeholder="Unassigned" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-border/50">
                                    <SelectItem value="unassigned" className="font-bold uppercase text-xs italic">Auto-assign bay</SelectItem>
                                    {staff?.map((m) => (
                                        <SelectItem key={m.userId} value={m.userId} className="font-bold uppercase text-xs">
                                            {m.fullName}
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
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-black text-primary">
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-border/50">
                                    {['Pending', 'Confirmed', 'Checked In', 'Completed', 'Cancelled', 'No Show'].map(s => (
                                        <SelectItem key={s} value={s} className="font-bold uppercase text-xs">{s}</SelectItem>
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
                name="notes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Technical Observations</FormLabel>
                        <FormControl>
                            <Textarea 
                                placeholder="Reported symptoms or client requirements..." 
                                {...field} 
                                className="bg-muted/50 border-none resize-none min-h-[100px] rounded-2xl p-4 text-sm font-medium" 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            </div>
          </DialogBody>

          <DialogFooter className="p-6 border-t">
            <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (initialData ? 'Update Certified Record' : 'Initialize Schedule Entry')}
            </Button>
          </DialogFooter>
        </form>
    </Form>
  );
}
