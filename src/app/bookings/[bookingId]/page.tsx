'use client';

import React from 'react';
import BookingDetailsPage from '@/components/bookings/booking-details-page';

/**
 * @fileOverview Client-side entry for booking details, handling Next.js 15 dynamic params as a Promise.
 */
export default function Page({ params }: { params: Promise<{ bookingId: string }> }) {
  const resolvedParams = React.use(params);
  return <BookingDetailsPage params={resolvedParams} />;
}
