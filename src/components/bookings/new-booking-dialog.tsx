'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useMakrosStore from '@/store/makros-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';

export function NewBookingDialog() {
  const { customers, vehicles, createBooking } = useMakrosStore();
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [serviceId, setServiceId] = useState('svc-001');
  const [customerNotes, setCustomerNotes] = useState('');

  const handleSubmit = () => {
    if (!customerId || !vehicleId || !bookingDate) return;

    const bookingId = `bk-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    createBooking({
        bookingId,
        customerId,
        vehicleId,
        serviceId,
        bookingDate,
        preferredTime: '10:00',
        status: 'Pending',
        notes: customerNotes,
        createdAt: now,
        updatedAt: now,
    });
    setOpen(false);
    setCustomerId('');
    setVehicleId('');
    setBookingDate('');
    setCustomerNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Booking</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select onValueChange={setCustomerId} value={customerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c: Customer) => <SelectItem key={c.customerId} value={c.customerId}>{c.fullName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Vehicle</Label>
            <Select onValueChange={setVehicleId} value={vehicleId} disabled={!customerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.filter((v: Vehicle) => v.customerId === customerId).map((v: Vehicle) => (
                  <SelectItem key={v.vehicleId} value={v.vehicleId}>
                    {v.make} {v.model} ({v.numberPlate})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Booking Date</Label>
            <Input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Customer Notes</Label>
            <Textarea 
              placeholder="Reported issues or specific requests..." 
              value={customerNotes} 
              onChange={e => setCustomerNotes(e.target.value)} 
            />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={!customerId || !vehicleId || !bookingDate}>
            Create Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
