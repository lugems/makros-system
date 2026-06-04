'use client';

import React, { useState } from 'react';
import { useCustomers } from '../../hooks/use-customers';
import { CustomerList } from './customer-list';
import { CustomerDetails } from './customer-details';
import { NewCustomerDialog } from './new-customer-dialog';
import { EditCustomerDialog } from './edit-customer-dialog';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { customers, isLoading } = useCustomers() as { customers: Customer[], isLoading: boolean };
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedCustomer(null);
    setFormOpen(true);
  };

  const handleClose = () => {
    setDetailsOpen(false);
    setFormOpen(false);
    setSelectedCustomer(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Customers</h2>
        <Button 
          onClick={handleAdd} 
          className="gap-2 font-black uppercase tracking-[0.2em] text-[10px] h-11 px-6 shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" /> Enroll Customer
        </Button>
      </div>
      <CustomerList customers={customers} onView={handleView} onEdit={handleEdit} />
      {selectedCustomer && (
        <CustomerDetails
          isOpen={isDetailsOpen}
          onClose={handleClose}
          customer={selectedCustomer}
        />
      )}
      
      <NewCustomerDialog
        isOpen={isFormOpen && !selectedCustomer}
        onClose={handleClose}
      />

      {selectedCustomer && (
        <EditCustomerDialog
          customer={selectedCustomer}
          open={isFormOpen && !!selectedCustomer}
          onOpenChange={(open) => !open && handleClose()}
        />
      )}
    </div>
  );
};
