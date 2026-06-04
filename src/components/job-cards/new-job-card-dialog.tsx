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
import { Label } from '@/components/ui/label';
import useMakrosStore from '@/store/makros-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Booking } from '@/types/booking';
import { StaffMember } from '@/types/staff';
import { JobCardStatus } from '@/types/job-card';

export function NewJobCardDialog() {
  const { bookings, users, createJobCard } = useMakrosStore();
  const [open, setOpen] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [mechanicId, setMechanicId] = useState('');

  const handleSubmit = () => {
    const booking = bookings.find((b: Booking) => b.bookingId === bookingId);
    if (!booking) return;

    const jobCardId = `jc-${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    createJobCard({
        jobCardId,
        bookingId,
        customerId: booking.customerId,
        vehicleId: booking.vehicleId,
        assignedMechanicId: mechanicId,
        reportedIssue: booking.notes || 'Service requested from booking.',
        status: JobCardStatus.InProgress,
        laborCost: 0,
        receivedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
        createdBy: 'system',
        tasks: [],
        parts: [],
    });
    setOpen(false);
    setBookingId('');
    setMechanicId('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Job Card</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Job Card</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Select Booking</Label>
            <Select onValueChange={setBookingId} value={bookingId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a confirmed booking..." />
              </SelectTrigger>
              <SelectContent>
                {(bookings || []).filter((b: Booking) => b.status === 'Confirmed' || b.status === 'Pending').map((b: Booking) => (
                  <SelectItem key={b.bookingId} value={b.bookingId}>
                    Booking #{b.bookingId.slice(-4)} - {b.bookingDate}
                  </SelectItem>
                ))}
                {bookings.length === 0 && <SelectItem value="none" disabled>No active bookings</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Assign Mechanic</Label>
            <Select onValueChange={setMechanicId} value={mechanicId}>
              <SelectTrigger>
                <SelectValue placeholder="Assign a technician..." />
              </SelectTrigger>
              <SelectContent>
                {users.filter((u: StaffMember) => u.role === 'Mechanic' && u.status === 'Active').map((u: StaffMember) => (
                  <SelectItem key={u.userId} value={u.userId}>
                    {u.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={!bookingId}>
            Create Job Card
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
