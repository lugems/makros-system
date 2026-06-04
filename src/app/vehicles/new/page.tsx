'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { NewVehicleDialog } from '@/components/vehicles/new-vehicle-dialog';

const NewVehicle = () => {
  const router = useRouter();
  return (
    <NewVehicleDialog 
      isOpen={true} 
      onClose={() => router.push('/vehicles')} 
    />
  );
};

export default NewVehicle;
