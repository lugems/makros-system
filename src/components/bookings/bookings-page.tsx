
'use client';

import React, { useState } from 'react';
import { BookingsTable } from './bookings-table';
import { BookingCard } from './booking-card';
import { BookingDetails } from './booking-details';
import { mockBookings } from '@/data/mock-bookings';
import { Booking } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';

const BookingsPage = () => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  const handleSelectBooking = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseDetails = () => {
    setSelectedBooking(null);
  };

  return (
    <div className="flex h-full bg-gray-50">
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Bookings</h1>
            <div>
                <Button variant="ghost" size="icon" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-gray-200' : ''}>
                    <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-gray-200' : ''}>
                    <LayoutGrid className="h-4 w-4" />
                </Button>
            </div>
        </div>

        {viewMode === 'list' ? (
            <BookingsTable bookings={mockBookings} onSelect={handleSelectBooking} />
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockBookings.map(booking => (
                    <BookingCard key={booking.bookingId} booking={booking} onSelect={handleSelectBooking} />
                ))}
            </div>
        )}

      </div>
      {selectedBooking && (
        <aside className="w-96 border-l border-gray-200">
          <BookingDetails 
            booking={selectedBooking} 
            onClose={handleCloseDetails} 
            onStatusChange={() => {}} 
            onConvertToJobCard={() => {}} 
            onEdit={() => {}}
          />
        </aside>
      )}
    </div>
  );
};

export default BookingsPage;
