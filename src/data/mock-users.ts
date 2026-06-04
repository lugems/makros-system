import { User } from '@/types/user';

export const mockUsers: User[] = [
  {
    userId: 'U001',
    name: 'Alice (Mechanic)',
    email: 'alice@example.com',
    role: 'Mechanic',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    userId: 'U002',
    name: 'Bob (Service Advisor)',
    email: 'bob@example.com',
    role: 'Service Advisor',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    userId: 'U003',
    name: 'Charlie (Mechanic - Inactive)',
    email: 'charlie@example.com',
    role: 'Mechanic',
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
    {
    userId: 'U004',
    name: 'David (Admin)',
    email: 'david@example.com',
    role: 'Admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
