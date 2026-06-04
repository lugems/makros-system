/**
 * @fileOverview Type definitions for the booking module.
 */

export type BookingStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'Checked In' 
  | 'Completed' 
  | 'Cancelled' 
  | 'No Show';

export interface Booking {
  bookingId: string;
  customerId: string;
  vehicleId: string;
  serviceId: string;
  assignedMechanicId?: string;
  bookingDate: string; // ISO Date string (YYYY-MM-DD)
  preferredTime: string; // HH:MM
  status: BookingStatus;
  notes?: string;
  createdAt: any;
  updatedAt: any;
}
