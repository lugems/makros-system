'use client';

import React from 'react';
import { Customer } from '@/types/customer';
import { DataTable } from '@/components/shared/data-table';
import { getCustomerColumns } from './customer-columns';
import MobileCardList from '@/components/shared/mobile-card-list';
import { CustomerCard } from './customer-card';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRouter } from 'next/navigation';

interface CustomersTableProps {
  customers: Customer[];
}

const CustomersTable: React.FC<CustomersTableProps> = ({ customers }) => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const columns = getCustomerColumns();

  if (isMobile) {
    return (
      <MobileCardList
        items={customers}
        renderItem={(customer) => (
            <CustomerCard 
                customer={customer} 
                onView={() => router.push(`/customers/${customer.customerId}`)}
                onEdit={() => {}} // Handle appropriately in caller
            />
        )}
        keyExtractor={(customer) => customer.customerId}
      />
    );
  }

  return <DataTable columns={columns} data={customers} />;
};

export default CustomersTable;
