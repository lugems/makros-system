import React from 'react';
import { Customer } from '@/types/customer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface CustomerListProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ customers, onView, onEdit }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-6 py-4">Name</TableHead>
          <TableHead className="px-6 py-4">Email</TableHead>
          <TableHead className="px-6 py-4">Phone</TableHead>
          <TableHead className="px-6 py-4 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.customerId} className="hover:bg-[#1E293B]">
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{customer.fullName}</TableCell>
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{customer.email}</TableCell>
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{customer.phone}</TableCell>
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
              <button onClick={() => onView(customer)} className="text-blue-500 hover:text-blue-700 mr-4">View</button>
              <button onClick={() => onEdit(customer)} className="text-yellow-500 hover:text-yellow-700">Edit</button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
