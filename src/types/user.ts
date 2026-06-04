export type UserRole = 'Admin' | 'Service Advisor' | 'Mechanic' | 'Customer';

export interface User {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
