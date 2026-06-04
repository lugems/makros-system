import { MakrosService } from '@/types/makros-service';

export const MOCK_SERVICES: MakrosService[] = [
  {
    serviceId: 's1',
    serviceName: 'Oil Change',
    description: 'Standard oil change service',
    category: 'General Service',
    defaultLaborCost: 50000,
    estimatedDuration: '1 hour',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    serviceId: 's2',
    serviceName: 'Tire Rotation',
    description: 'Tire rotation and pressure check',
    category: 'General Service',
    defaultLaborCost: 30000,
    estimatedDuration: '30 minutes',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    serviceId: 's3',
    serviceName: 'Brake Inspection',
    description: 'Full brake system inspection',
    category: 'Brakes',
    defaultLaborCost: 40000,
    estimatedDuration: '1 hour',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
