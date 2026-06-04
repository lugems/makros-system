'use client';

import React, { Suspense } from 'react';
import { NewJobCardPage } from '@/components/job-cards/new-job-card-page';
import { LoadingState } from '@/components/shared/loading-state';

/**
 * @fileOverview Client-side entry for creating new technical job cards.
 * Wrapped in Suspense to correctly handle search parameters in Next.js 15.
 */
export default function Page() {
  return (
    <Suspense fallback={<LoadingState />}>
      <NewJobCardPage />
    </Suspense>
  );
}
