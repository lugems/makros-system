'use client';

import { useState, useEffect } from 'react';
import { StaffMember, UserRole } from '@/types/staff';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, Zap, ShieldCheck } from 'lucide-react';

interface StaffFormProps {
  staff?: StaffMember;
  onChange: (staff: Partial<StaffMember>) => void;
}

const ROLES: UserRole[] = [
  "Makros System Owner",
  "Workshop Manager",
  "Receptionist",
  "Mechanic",
  "Inventory Officer",
  "Accountant",
];

const SPECIALIZATIONS = [
    "Engine Specialist",
    "Brake Specialist",
    "Electrical Technician",
    "Suspension Specialist",
    "Body Works",
    "General Mechanic",
    "Wheel Alignment",
    "Diagnostics"
  ];

export function StaffForm({ staff, onChange }: StaffFormProps) {
  const [formData, setFormData] = useState<Partial<StaffMember>>({
    fullName: staff?.fullName || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    role: staff?.role || 'Mechanic',
    status: staff?.status || 'Active',
    specialization: staff?.specialization || '',
  });

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <User className="h-3 w-3" /> Full Personnel Name
        </Label>
        <Input
            name="fullName"
            placeholder="e.g. Mugisha Paul"
            value={formData.fullName}
            onChange={handleChange}
            className="h-11 rounded-xl bg-muted/50 border-none font-bold"
            required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Mail className="h-3 w-3" /> Email Address
            </Label>
            <Input
                name="email"
                type="email"
                placeholder="name@makros.ug"
                value={formData.email}
                onChange={handleChange}
                className="h-11 rounded-xl bg-muted/50 border-none font-medium"
                required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Phone className="h-3 w-3" /> Contact Authority
            </Label>
            <Input
                name="phone"
                placeholder="+256 700 000 000"
                value={formData.phone}
                onChange={handleChange}
                className="h-11 rounded-xl bg-muted/50 border-none font-medium"
                required
            />
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-3 w-3" /> Personnel Classification
            </Label>
            <Select onValueChange={(value) => handleSelectChange('role', value)} value={formData.role}>
                <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none">
                    <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                {ROLES.map((role) => (
                    <SelectItem key={role} value={role} className="text-xs font-bold uppercase tracking-tight">
                        {role}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registry Status</Label>
            <Select onValueChange={(value) => handleSelectChange('status', value)} value={formData.status}>
                <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                    <SelectItem value="Active" className="text-xs font-bold uppercase">Active Duty</SelectItem>
                    <SelectItem value="Inactive" className="text-xs font-bold uppercase">Deactivated</SelectItem>
                </SelectContent>
            </Select>
          </div>
      </div>

      {formData.role === 'Mechanic' && (
        <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Zap className="h-3 w-3" /> Technical Specialization
            </Label>
            <Select onValueChange={(value) => handleSelectChange('specialization', value)} value={formData.specialization || ''}>
                <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none">
                    <SelectValue placeholder="Select Specialization" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                    {SPECIALIZATIONS.map((spec) => (
                        <SelectItem key={spec} value={spec} className="text-xs font-bold uppercase">
                            {spec}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      )}
    </div>
  );
}