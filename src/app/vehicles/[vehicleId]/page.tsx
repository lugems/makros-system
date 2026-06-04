'use client';

import React from 'react';
import { VehicleDetails } from '@/components/vehicles/vehicle-details';

/**
 * @fileOverview Client-side entry for vehicle details, handling Next.js 15 dynamic params as a Promise.
 */
export default function Page({ params }: { params: Promise<{ vehicleId: string }> }) {
  const resolvedParams = React.use(params);
  return <VehicleDetails vehicleId={resolvedParams.vehicleId} />;
}
