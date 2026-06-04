import React from 'react';
import { Booking } from '@/types/booking';
import { BookingStatusBadge } from '@/components/bookings/booking-status-badge';
import { mockCustomers } from '@/data/mock-customers';
import { mockVehicles } from '@/data/mock-vehicles';
import { mockServices } from '@/data/mock-services';

interface BookingsTableRowProps {
  booking: Booking;
  onSelect: (booking: Booking) => void;
}

const BookingsTableRow: React.FC<BookingsTableRowProps> = ({ booking, onSelect }) => {
    const customer = mockCustomers.find(c => c.customerId === booking.customerId);
    const vehicle = mockVehicles.find(v => v.vehicleId === booking.vehicleId);
    const service = mockServices.find(s => s.serviceId === booking.serviceId);

  return (
    <tr onClick={() => onSelect(booking)} className="hover:bg-gray-50 cursor-pointer">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{customer?.fullName}</div>
        <div className="text-sm text-gray-500">{customer?.phone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{vehicle?.make} {vehicle?.model}</div>
        <div className="text-sm text-gray-500">{vehicle?.numberPlate}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service?.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(booking.bookingDate).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.preferredTime}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <BookingStatusBadge status={booking.status} />
      </td>
    </tr>
  );
};

export default BookingsTableRow;
