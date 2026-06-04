'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Booking } from '@/types/booking';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Vehicle } from '@/types/vehicle';
import { Customer } from '@/types/customer';
import { MakrosService } from '@/types/makros-service';
import { StaffMember } from '@/types/staff';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { User, Car, Wrench, Calendar, Clock, UserCheck, MessageSquare, Loader2 } from 'lucide-react';

interface BookingFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Booking) => void;
  isSubmitting?: boolean;
  booking?: Booking | null;
}

const BookingFormDialog: React.FC<BookingFormDialogProps> = ({ isOpen, onClose, onSave, isSubmitting, booking }) => {
  const db = useFirestore();
  const [formData, setFormData] = useState<Partial<Booking>>(booking || {});

  // Stabilized Registry Queries
  const customersQuery = useMemoFirebase(() => query(collection(db, 'customers'), orderBy('fullName', 'asc')), [db]);
  const servicesQuery = useMemoFirebase(() => query(collection(db, 'services'), where('status', '==', 'Active')), [db]);
  const staffQuery = useMemoFirebase(() => query(collection(db, 'users'), where('role', '==', 'Mechanic'), where('status', '==', 'Active')), [db]);
  const vehiclesQuery = useMemoFirebase(() => query(collection(db, 'vehicles')), [db]);

  const { data: customers } = useCollection<Customer>(customersQuery as any);
  const { data: services } = useCollection<MakrosService>(servicesQuery as any);
  const { data: staff } = useCollection<StaffMember>(staffQuery as any);
  const { data: allVehicles } = useCollection<Vehicle>(vehiclesQuery as any);

  useEffect(() => {
    if (isOpen) {
      setFormData(booking || {});
    }
  }, [isOpen, booking]);

  const filteredVehicles = useMemo(() => {
    if (formData.customerId) {
      return allVehicles?.filter(v => v.customerId === formData.customerId) || [];
    } else {
      return allVehicles || [];
    }
  }, [formData.customerId, allVehicles]);

  const handleValueChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Booking);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[560px] border-border/50">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="font-black uppercase tracking-tight">
            {booking ? 'Update Schedule' : 'Intake Appointment'}
          </DialogTitle>
          <DialogDescription className="text-[10px] font-bold uppercase tracking-widest">
            Configure temporal parameters and technical requirements for the workshop bay.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogBody>
            <div className="space-y-5 px-6 pb-6 pt-2">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <User className="h-3 w-3 text-primary" /> Customer Context
                </Label>
                <Select 
                  value={formData.customerId || ''} 
                  onValueChange={(val) => handleValueChange('customerId', val)}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none font-bold">
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50">
                    {customers?.map(c => (
                      <SelectItem key={c.customerId} value={c.customerId} className="font-bold uppercase text-xs">{c.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Car className="h-3 w-3 text-primary" /> Technical Asset
                  </Label>
                  <Select 
                    value={formData.vehicleId || ''} 
                    onValueChange={(val) => handleValueChange('vehicleId', val)}
                    disabled={!formData.customerId}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none font-bold">
                      <SelectValue placeholder="Select Vehicle" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50">
                      {filteredVehicles.map(v => (
                        <SelectItem key={v.vehicleId} value={v.vehicleId} className="font-bold uppercase text-xs">
                          {v.make} {v.model} ({v.numberPlate})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Wrench className="h-3 w-3 text-primary" /> Service Catalog
                  </Label>
                  <Select 
                    value={formData.serviceId || ''} 
                    onValueChange={(val) => handleValueChange('serviceId', val)}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none font-bold">
                      <SelectValue placeholder="Select Service" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50">
                      {services?.map(s => (
                        <SelectItem key={s.serviceId} value={s.serviceId} className="font-bold uppercase text-xs">{s.serviceName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-indigo-500" /> Date
                  </Label>
                  <Input 
                    type="date" 
                    value={formData.bookingDate?.split('T')[0] || ''} 
                    onChange={(e) => handleValueChange('bookingDate', e.target.value)} 
                    className="h-11 rounded-xl bg-muted/50 border-none font-bold"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3 text-indigo-500" /> Time
                  </Label>
                  <Input 
                    type="time" 
                    value={formData.preferredTime || ''} 
                    onChange={(e) => handleValueChange('preferredTime', e.target.value)} 
                    className="h-11 rounded-xl bg-muted/50 border-none font-bold"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <UserCheck className="h-3 w-3 text-primary" /> Preferred Mechanic
                </Label>
                <Select 
                  value={formData.assignedMechanicId || ''} 
                  onValueChange={(val) => handleValueChange('assignedMechanicId', val)}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none font-bold">
                    <SelectValue placeholder="No Preference" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50">
                    <SelectItem value="unassigned" className="italic">No Preference / Auto-assign</SelectItem>
                    {staff?.map(m => (
                      <SelectItem key={m.userId} value={m.userId} className="font-bold uppercase text-xs">{m.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="h-3 w-3 text-primary" /> Incident Documentation
                </Label>
                <Textarea 
                  value={formData.notes || ''} 
                  onChange={(e) => handleValueChange('notes', e.target.value)} 
                  placeholder="Describe symptoms or client requirements..." 
                  className="rounded-2xl bg-muted/50 border-none resize-none min-h-[100px] text-sm font-medium" 
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="p-6 border-t">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 font-black uppercase tracking-widest text-[10px]"
            >
              Discard
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {booking ? 'Commit Synchronization' : 'Initialize Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingFormDialog;
