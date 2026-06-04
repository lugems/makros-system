import React from 'react';
import { Customer } from '@/types/customer';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogBody
} from '../ui/dialog';

interface CustomerDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({ isOpen, onClose, customer }) => {
  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[480px]">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">Customer Details</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4 px-6 pb-6 pt-2 text-white">
            <div className="mb-4">
              <p className="text-sm text-gray-400">Name</p>
              <p className="text-lg font-semibold">{customer.fullName}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-lg">{customer.email}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-400">Phone</p>
              <p className="text-lg">{customer.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Address</p>
              <p className="text-lg">{customer.address}</p>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
