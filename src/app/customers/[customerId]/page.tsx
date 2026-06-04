'use client';

import React from 'react';
import CustomerDetailsPage from '@/components/customers/customer-details-page';

/**
 * @fileOverview Client-side entry for customer details, handling Next.js 15 dynamic params as a Promise.
 */
export default function Page({ params }: { params: Promise<{ customerId: string }> }) {
  const resolvedParams = React.use(params);
  return <CustomerDetailsPage params={resolvedParams} />;
}
