import { Booking } from '@/schemas/booking-schema';

export const MOCK_BOOKINGS: any[] = [
  {
    id: 'b1',
    customerId: 'c1',
    vehicleId: 'v1',
    serviceDescription: 'Standard Maintenance',
    bookingDate: '2024-07-25T10:00:00Z',
    status: 'Confirmed',
  },
  {
    id: 'b2',
    customerId: 'c2',
    vehicleId: 'v2',
    serviceDescription: 'Tire Rotation',
    bookingDate: '2024-07-26T14:00:00Z',
    status: 'Pending',
  },
];
