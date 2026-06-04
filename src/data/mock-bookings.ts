import { Booking } from '@/types/booking';

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

export const mockBookings: Booking[] = [
  {
    bookingId: 'B001',
    customerId: 'C001',
    vehicleId: 'V001',
    serviceId: 'S001',
    bookingDate: today.toISOString().split('T')[0],
    preferredTime: '10:00',
    status: 'Confirmed',
    assignedMechanicId: 'U001',
    notes: 'Customer waiting.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    bookingId: 'B002',
    customerId: 'C002',
    vehicleId: 'V002',
    serviceId: 'S002',
    bookingDate: today.toISOString().split('T')[0],
    preferredTime: '14:00',
    status: 'Pending',
    notes: 'Needs a call back to confirm.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    bookingId: 'B003',
    customerId: 'C001',
    vehicleId: 'V003',
    serviceId: 'S003',
    bookingDate: tomorrow.toISOString().split('T')[0],
    preferredTime: '09:00',
    status: 'Confirmed',
    assignedMechanicId: 'U001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
