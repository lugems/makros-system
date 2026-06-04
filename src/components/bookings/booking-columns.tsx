'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ClipboardList, CheckCircle2, XCircle, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Booking, BookingStatus } from '@/types/booking';
import { Badge } from '@/components/ui/badge';
import { MOCK_CUSTOMERS } from '@/data/seed-customers';
import { MOCK_VEHICLES } from '@/data/seed-vehicles';

const getStatusVariant = (status: BookingStatus) => {
  switch (status) {
    case 'Confirmed': return 'default';
    case 'Pending': return 'secondary';
    case 'Cancelled': return 'destructive';
    case 'Completed': return 'outline';
    default: return 'secondary';
  }
};

export const getColumns = (
  onConvertToJobCard: (id: string) => void,
  onStatusChange: (id: string, status: BookingStatus) => void
): ColumnDef<Booking>[] => [
  {
    accessorKey: 'bookingId',
    header: 'Booking ID',
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.bookingId}</span>
  },
  {
    accessorKey: 'customerId',
    header: 'Customer',
    cell: ({ row }) => {
      const customer = MOCK_CUSTOMERS.find(c => c.customerId === row.original.customerId);
      return customer ? customer.fullName : 'Unknown';
    }
  },
  {
    accessorKey: 'vehicleId',
    header: 'Vehicle',
    cell: ({ row }) => {
      const vehicle = MOCK_VEHICLES.find(v => v.id === row.original.vehicleId);
      return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.numberPlate})` : 'Unknown';
    }
  },
  {
    accessorKey: 'bookingDate',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.original.bookingDate);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={getStatusVariant(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const booking = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onConvertToJobCard(booking.bookingId)}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Convert to Job Card
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onStatusChange(booking.bookingId, 'Confirmed')}>
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              Confirm
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(booking.bookingId, 'Pending')}>
              <Clock className="mr-2 h-4 w-4 text-yellow-500" />
              Set Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(booking.bookingId, 'Cancelled')}>
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
