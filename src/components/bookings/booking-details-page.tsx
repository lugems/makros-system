'use client';

import React from 'react';

const BookingDetailsPage = ({ params }: { params: { bookingId: string } }) => {
  return <div>Booking Details for booking ID: {params.bookingId}</div>;
};

export default BookingDetailsPage;
