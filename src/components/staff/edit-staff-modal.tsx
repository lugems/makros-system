'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogBody,
  DialogFooter,
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StaffForm } from '@/components/staff/staff-form';
import { StaffMember } from '@/types/staff';

interface EditStaffModalProps {
  staff: StaffMember;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (staffId: string, staff: Partial<StaffMember>) => void;
}

export function EditStaffModal({ staff, isOpen, onOpenChange, onEdit }: EditStaffModalProps) {
  const [formData, setFormData] = useState<Partial<StaffMember>>(staff);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit(staff.userId, formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[560px]">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-black uppercase tracking-tight">Technical Record Synchronization</DialogTitle>
          <DialogDescription>
            Update existing personnel profile and technical classification.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogBody>
            <div className="px-6 pb-6 pt-2">
              <StaffForm staff={staff} onChange={setFormData} />
            </div>
          </DialogBody>
          <DialogFooter className="p-6 border-t">
            <Button type="submit" className="w-full sm:w-auto h-11 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20">
              Commit Synchronization
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
