import { Customer } from '@/types/customer';

export const mockCustomers: Customer[] = [
  {
    customerId: 'C001',
    fullName: 'John Doe',
    phone: '123-456-7890',
    email: 'john.doe@example.com',
    address: '123 Main St, Anytown, USA',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    customerId: 'C002',
    fullName: 'Jane Smith',
    phone: '098-765-4321',
    email: 'jane.smith@example.com',
    address: '456 Oak Ave, Somecity, USA',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
   {
    customerId: 'C003',
    fullName: 'Peter Jones',
    phone: '555-555-5555',
    email: 'peter.jones@example.com',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
