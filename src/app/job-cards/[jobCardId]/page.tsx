'use client';

import React from 'react';
import { JobCardDetails } from '@/components/job-cards/job-card-details';

/**
 * @fileOverview Client-side entry for job card details, handling Next.js 15 dynamic params as a Promise.
 */
export default function Page({ params }: { params: Promise<{ jobCardId: string }> }) {
  const resolvedParams = React.use(params);
  return <JobCardDetails jobCardId={resolvedParams.jobCardId} />;
}
