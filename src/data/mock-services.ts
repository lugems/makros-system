import { MakrosService } from '@/types/makros-service';

export const mockServices: MakrosService[] = [
  {
    serviceId: 'S001',
    serviceName: 'Oil Change',
    description: 'Basic oil and filter change.',
    category: 'General Service',
    defaultLaborCost: 50,
    estimatedDuration: '30 minutes',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    serviceId: 'S002',
    serviceName: 'Tire Rotation',
    description: 'Tire rotation and pressure check.',
    category: 'General Service',
    defaultLaborCost: 75,
    estimatedDuration: '45 minutes',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    serviceId: 'S003',
    serviceName: 'Full Inspection',
    description: 'Complete vehicle inspection.',
    category: 'Diagnostics',
    defaultLaborCost: 200,
    estimatedDuration: '2 hours',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
