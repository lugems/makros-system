'use client';

import React from 'react';
import InventoryItemPage from '@/components/inventory/inventory-item-page';

/**
 * @fileOverview Client-side entry for inventory details, handling Next.js 15 dynamic params as a Promise.
 */
export default function Page({ params }: { params: Promise<{ itemId: string }> }) {
  const resolvedParams = React.use(params);
  return <InventoryItemPage params={resolvedParams} />;
}
