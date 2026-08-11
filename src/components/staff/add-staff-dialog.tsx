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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StaffMember, UserRole } from '@/types/staff';

const ROLES: UserRole[] = [
  "Makros System Owner",
  "Workshop Manager",
  "Receptionist",
  "Senior Mechanic / Lead Mechanic",
  "Mechanic",
  "Diagnostic Technician",
  "Auto-Wiring Technician",
  "Welding Lead Technician",
  "Welding Technician",
  "Auto Body / Panel Beater",
  "Painter",
  "Tyre & Wheel Technician",
  "Car Wash / Detailing Technician",
  "Quality Control Officer",
  "Inventory Officer",
  "Accountant",
  "Customer",
];

interface AddStaffDialogProps {
    onAdd: (staff: Partial<StaffMember>) => void;
}

export function AddStaffDialog({ onAdd }: AddStaffDialogProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Mechanic');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [specialization, setSpecialization] = useState('');

  const handleSubmit = () => {
    onAdd({
      fullName,
      phone,
      email,
      role,
      status,
      specialization,
    });
  };

  const isTechnician = [
    "Senior Mechanic / Lead Mechanic",
    "Mechanic",
    "Diagnostic Technician",
    "Auto-Wiring Technician",
    "Welding Lead Technician",
    "Welding Technician",
    "Auto Body / Panel Beater",
    "Painter",
    "Tyre & Wheel Technician",
    "Car Wash / Detailing Technician"
  ].includes(role);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Staff</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Staff</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
          <Input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <Select onValueChange={value => setRole(value as UserRole)} value={role}>
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select onValueChange={value => setStatus(value as 'Active' | 'Inactive')} value={status}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {isTechnician && <Input placeholder="Specialization" value={specialization} onChange={e => setSpecialization(e.target.value)} />}
          <Button onClick={handleSubmit}>Add Staff</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
