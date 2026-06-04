'use client';

import React, { useEffect } from 'react';
import { NewCustomerDialog } from '@/components/customers/new-customer-dialog';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { LoadingState } from '@/components/shared/loading-state';

const NewCustomer = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !['Makros System Owner', 'Workshop Manager', 'Receptionist', 'Accountant'].includes(user.role))) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <LoadingState />;

  return <NewCustomerDialog isOpen={true} onClose={() => router.push('/customers')} />;
};

export default NewCustomer;
