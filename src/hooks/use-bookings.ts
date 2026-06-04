'use client';

import { useState, useEffect, useCallback } from 'react';
import { Booking, BookingStatus } from '@/types/booking';
import * as bookingsService from '@/services/bookings-service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadBookings = useCallback(async () => {
    // Note: getBookings should ideally be a real-time listener or implemented in service.
    // For now, we simulate success as the app is moving towards useCollection.
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const addBooking = async (data: Omit<Booking, 'bookingId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    try {
      const bookingId = bookingsService.createBooking(data, user.userId);
      toast({
        title: 'Booking Scheduled',
        description: 'The appointment has been initialized.',
      });
      return bookingId;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create booking.',
        variant: 'destructive',
      });
    }
  };

  const updateStatus = async (bookingId: string, status: BookingStatus) => {
    if (!user) return;
    try {
      bookingsService.updateBookingStatus(bookingId, status, user.userId);
      toast({
        title: 'Status Updated',
        description: `Booking status changed to ${status}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update booking status.',
        variant: 'destructive',
      });
    }
  };

  const removeBooking = async (bookingId: string) => {
    if (!user) return;
    try {
      bookingsService.deleteBooking(bookingId, user.userId);
      toast({
        title: 'Booking Deleted',
        description: 'The booking has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete booking.',
        variant: 'destructive',
      });
    }
  };

  return {
    bookings,
    isLoading,
    addBooking,
    updateStatus,
    removeBooking,
    refresh: loadBookings,
  };
};
