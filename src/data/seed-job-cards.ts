import { JobCard } from '@/schemas/job-card-schema';

export const MOCK_JOB_CARDS: JobCard[] = [
  {
    id: 'JC-001',
    customerId: 'CUST-001',
    customerName: 'John Doe',
    vehicleId: 'v1',
    vehicleDescription: 'Toyota Camry (UAB 123C)',
    assignedMechanicId: 'u1',
    assignedMechanicName: 'Paul Mugisha',
    serviceDescription: 'Engine Oil Change and Brake Inspection',
    status: 'In Progress',
    totalCost: 150.00,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T11:30:00Z',
  },
  {
    id: 'JC-002',
    customerId: 'CUST-002',
    customerName: 'Jane Smith',
    vehicleId: 'v2',
    vehicleDescription: 'Honda Civic (UCD 456F)',
    assignedMechanicId: 'u3',
    assignedMechanicName: 'John Technician',
    serviceDescription: 'Tire Rotation and Suspension Check',
    status: 'Pending',
    totalCost: 85.50,
    createdAt: '2024-03-21T09:00:00Z',
    updatedAt: '2024-03-21T09:00:00Z',
  }
];
