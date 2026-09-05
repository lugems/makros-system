'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Booking } from '@/types/booking';
import { AssetType } from '@/types/asset';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Vehicle } from '@/types/vehicle';
import { Customer } from '@/types/customer';
import { PlantEquipment } from '@/types/plant-equipment';
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
import { User, Car, Wrench, Calendar, Clock, UserCheck, MessageSquare, Loader2, Hammer, Activity } from 'lucide-react';
import { SearchableSelect } from '@/components/shared/searchable-select';
import { cn } from '@/lib/utils';

interface BookingFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: any) => void;
  isSubmitting?: boolean;
  booking?: Booking | null;
}

const BookingFormDialog: React.FC<BookingFormDialogProps> = ({ isOpen, onClose, onSave, isSubmitting, booking }) => {
  const db = useFirestore();
  const [assetType, setAssetType] = useState<AssetType>(booking?.assetType || 'Vehicle');
  const [formData, setFormData] = useState<Partial<Booking>>(booking || {
      assetType: 'Vehicle',
      bookingDate: new Date().toISOString().split('T')[0],
      preferredTime: '09:00'
  });

  // Registry Queries
  const customersQuery = useMemoFirebase(() => query(collection(db, 'customers'), orderBy('fullName', 'asc')), [db]);
  const servicesQuery = useMemoFirebase(() => query(collection(db, 'services'), where('status', '==', 'Active')), [db]);
  const staffQuery = useMemoFirebase(() => query(collection(db, 'users'), where('status', '==', 'Active')), [db]);

  const { data: customers } = useCollection<Customer>(customersQuery as any);
  const { data: services } = useCollection<MakrosService>(servicesQuery as any);
  const { data: allStaff } = useCollection<StaffMember>(staffQuery as any);

  // Asset Queries
  const vehiclesQuery = useMemoFirebase(() => {
      if (!formData.customerId) return null;
      return query(collection(db, 'vehicles'), where('customerId', '==', formData.customerId));
  }, [db, formData.customerId]);

  const plantsQuery = useMemoFirebase(() => {
      if (!formData.customerId) return null;
      return query(collection(db, 'plantsAndEquipment'), where('ownerId', '==', formData.customerId));
  }, [db, formData.customerId]);

  const { data: vehicles, loading: vLoading } = useCollection<Vehicle>(vehiclesQuery as any);
  const { data: plants, loading: pLoading } = useCollection<PlantEquipment>(plantsQuery as any);

  const technicians = useMemo(() => {
      const technicalRoles = [
        "Senior Mechanic / Lead Mechanic", "Mechanic", "Diagnostic Technician", 
        "Auto-Wiring Technician", "Welding Technician", "Auto Body / Panel Beater"
      ];
      return allStaff?.filter(s => technicalRoles.includes(s.role)) || [];
  }, [allStaff]);

  useEffect(() => {
    if (isOpen && booking) {
      setFormData(booking);
      setAssetType(booking.assetType || 'Vehicle');
    }
  }, [isOpen, booking]);

  const handleValueChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssetTypeChange = (type: AssetType) => {
      setAssetType(type);
      setFormData(prev => ({ ...prev, assetType: type, assetId: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, assetType });
  };

  const customerOptions = useMemo(() => 
    customers?.map(c => ({ value: c.customerId, label: c.fullName, description: c.phone })) || [],
    [customers]
  );

  const assetOptions = useMemo(() => {
      if (assetType === 'Vehicle') {
          return vehicles?.map(v => ({ value: v.vehicleId, label: `${v.make} ${v.model}`, description: v.numberPlate })) || [];
      } else {
          return plants?.map(p => ({ value: p.id, label: p.name, description: p.assetId })) || [];
      }
  }, [assetType, vehicles, plants]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[92dvh] flex-col overflow-hidden p-0 sm:max-w-[560px] border-border/50">
        <DialogHeader className="px-8 pt-8 pb-4 text-left border-b bg-muted/30">
          <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                  <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-none">
                    {booking ? 'Recalibrate Schedule' : 'Schedule Intake'}
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1.5">
                    Configure technical parameters and asset assignment.
                </DialogDescription>
              </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogBody>
            <div className="space-y-8 px-8 py-6">
              {/* Asset Type Toggle */}
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/50 border border-border/50">
                  <Button 
                    type="button"
                    variant={assetType === 'Vehicle' ? 'secondary' : 'ghost'}
                    onClick={() => handleAssetTypeChange('Vehicle')}
                    className="flex-1 h-10 text-[9px] font-black uppercase tracking-widest gap-2 rounded-xl"
                  >
                      <Car className="h-3.5 w-3.5" /> Vehicle
                  </Button>
                  <Button 
                    type="button"
                    variant={assetType === 'Plant' ? 'secondary' : 'ghost'}
                    onClick={() => handleAssetTypeChange('Plant')}
                    className="flex-1 h-10 text-[9px] font-black uppercase tracking-widest gap-2 rounded-xl"
                  >
                      <Hammer className="h-3.5 w-3.5" /> Plant & Equipment
                  </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                  <User className="h-3 w-3 text-primary" /> Customer Context
                </Label>
                <SearchableSelect 
                    options={customerOptions}
                    value={formData.customerId}
                    onValueChange={(val) => handleValueChange('customerId', val)}
                    placeholder="Identify client authority..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                    {assetType === 'Vehicle' ? <Car className="h-3 w-3 text-primary" /> : <Hammer className="h-3 w-3 text-primary" />}
                    Target Asset
                  </Label>
                  <SearchableSelect 
                    options={assetOptions}
                    value={formData.assetId}
                    onValueChange={(val) => handleValueChange('assetId', val)}
                    disabled={!formData.customerId}
                    placeholder="Identify unit..."
                    isLoading={vLoading || pLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                    <Wrench className="h-3 w-3 text-primary" /> Catalog Service
                  </Label>
                  <Select 
                    value={formData.serviceId || ''} 
                    onValueChange={(val) => handleValueChange('serviceId', val)}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none font-bold">
                      <SelectValue placeholder="Select service..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50">
                      {services?.map(s => (
                        <SelectItem key={s.serviceId} value={s.serviceId} className="font-bold uppercase text-xs">{s.serviceName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                    <Calendar className="h-3 w-3 text-indigo-500" /> Intake Date
                  </Label>
                  <Input 
                    type="date" 
                    value={formData.bookingDate?.split('T')[0] || ''} 
                    onChange={(e) => handleValueChange('bookingDate', e.target.value)} 
                    className="h-12 rounded-xl bg-muted/20 border-none font-bold text-center"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                    <Clock className="h-3 w-3 text-indigo-500" /> Arrival Window
                  </Label>
                  <Input 
                    type="time" 
                    value={formData.preferredTime || ''} 
                    onChange={(e) => handleValueChange('preferredTime', e.target.value)} 
                    className="h-12 rounded-xl bg-muted/20 border-none font-bold text-center"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                  <UserCheck className="h-3 w-3 text-primary" /> Technical Assignment
                </Label>
                <Select 
                  value={formData.assignedMechanicId || ''} 
                  onValueChange={(val) => handleValueChange('assignedMechanicId', val)}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none font-bold">
                    <SelectValue placeholder="Auto-assign bay..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50">
                    <SelectItem value="unassigned" className="italic font-bold">No Preference</SelectItem>
                    {technicians?.map(m => (
                      <SelectItem key={m.userId} value={m.userId} className="font-bold uppercase text-xs">{m.fullName} ({m.role.split(' ')[0]})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                  <MessageSquare className="h-3 w-3 text-primary" /> Incident Documentation
                </Label>
                <Textarea 
                  value={formData.notes || ''} 
                  onChange={(e) => handleValueChange('notes', e.target.value)} 
                  placeholder="Describe symptoms or client requirements..." 
                  className="rounded-2xl bg-muted/20 border-none resize-none min-h-[100px] text-sm font-medium leading-relaxed p-4" 
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="p-8 border-t bg-muted/10">
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.customerId || !formData.assetId}
              className="w-full h-14 font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 rounded-2xl text-xs transition-all hover:scale-[1.01]"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
                  <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5" />
                      <span>{booking ? 'Commit Synchronization' : 'Initialize Schedule Entry'}</span>
                  </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingFormDialog;

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